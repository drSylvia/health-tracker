import {readCache,writeCache,refreshIndex} from './revision-store.js?v=1.2.0';
import {GOOGLE_CONFIG} from './cloud-config.js?v=1.2.0';
import {makeBackup,validateBackup} from './cloud-backup.js?v=1.2.0';
import {listSyncRevisions,downloadBackup,uploadSyncRevision,driveAccount,changeStart,driveChanges,listCheckpoints,uploadCheckpoint} from './google-drive.js?v=1.2.0';
import {readSyncState,saveSyncState,saveSafety} from './sync-state.js?v=1.2.0';
import {setTargets} from './i18n.js?v=1.2.0';
import {accessToken} from './google-auth.js?v=1.2.0';
import {targetFields} from './config.js?v=1.2.0';
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const semantic=r=>r===undefined?undefined:r.deleted?['deleted']:['value',r.value];
const same=(a,b)=>eq(semantic(a),semantic(b));
const map=d=>new Map(d?.records.map(r=>[r.id,r])||[]);
export function fingerprint(d){return JSON.stringify([d.records.slice().sort((a,b)=>a.id.localeCompare(b.id)),d.targets]);}
// Pure three-way merge, including tombstones and nullable targets. No clock ordering.
export function mergePlan(local,remote,base,choose){
 const lm=map(local),rm=map(remote),bm=map(base),records=[],targets={},counts={upload:0,download:0,same:0,conflicts:0};
 function pick(key,l,r,b,equal,kind){
  if(equal(l,r)){if(kind==='record'&&l!==undefined)counts.same++;return l;}
  // Missing records are not deletes. Deletion requires an explicit tombstone.
  if(kind==='record'&&l===undefined){counts.download++;return r;}
  if(kind==='record'&&r===undefined){counts.upload++;return l;}
  if(base&&equal(l,b)){if(kind==='record')counts.download++;return r;}
  if(base&&equal(r,b)){if(kind==='record')counts.upload++;return l;}
  counts.conflicts++;const side=choose({key,kind,local:l,cloud:r});
  if(side!=='local'&&side!=='cloud')throw new Error('sync-cancel');
  if(kind==='record')counts[side==='local'?'upload':'download']++;
  return side==='local'?l:r;
 }
 for(const key of new Set([...lm.keys(),...rm.keys()])){const r=pick(key,lm.get(key),rm.get(key),bm.get(key),same,'record');if(r!==undefined)records.push(r);}
 for(const f of targetFields)targets[f.key]=pick(f.key,local.targets[f.key],remote.targets[f.key],base?.targets[f.key],eq,'target');
 return {data:validateBackup({...local,records,targets,exportedAt:new Date().toISOString()}),counts};
}
// Resolve asynchronous UI choices before any write, replaying the pure plan.
export async function interactivePlan(local,remote,base,choose){
 const answers=new Map();
 for(;;){let question;const waiting={};try{return mergePlan(local,remote,base,c=>{const key=JSON.stringify(c);if(answers.has(key))return answers.get(key);question=c;throw waiting;});}catch(e){if(e!==waiting)throw e;const side=await choose(question);if(side!=='local'&&side!=='cloud')throw new Error('sync-cancel');answers.set(JSON.stringify(question),side);}}
}
export function validateRevision(raw){if(raw?.protocol!==1||!Array.isArray(raw.parents)||raw.parents.some(x=>typeof x!=='string'||!x)||new Set(raw.parents).size!==raw.parents.length)throw new Error('sync-invalid');return {parents:raw.parents,data:validateBackup(raw.data)};}
export function graphHeads(nodes){
 const referenced=new Set();for(const [id,n] of nodes)for(const p of n.parents){if(p===id||!nodes.has(p))throw new Error('sync-invalid');referenced.add(p);}
 const degrees=new Map([...nodes].map(([id,n])=>[id,n.parents.length])),children=new Map();for(const [id,n] of nodes)for(const p of n.parents){if(!children.has(p))children.set(p,[]);children.get(p).push(id);}const queue=[...degrees].filter(([,d])=>d===0).map(([id])=>id);for(let i=0;i<queue.length;i++)for(const child of children.get(queue[i])||[]){const d=degrees.get(child)-1;degrees.set(child,d);if(d===0)queue.push(child);}if(queue.length!==nodes.size)throw Error('sync-invalid');
 return [...nodes.keys()].filter(id=>!referenced.has(id)).sort();
}
function ancestors(id,nodes){const seen=new Set(),todo=[id];while(todo.length){const x=todo.pop();if(seen.has(x))continue;seen.add(x);todo.push(...nodes.get(x).parents);}return seen;}
function commonBase(ids,nodes){if(!ids.length)return null;const sets=ids.map(id=>ancestors(id,nodes));const common=[...sets[0]].filter(id=>sets.every(s=>s.has(id)));const parents=new Set(common.flatMap(id=>nodes.get(id).parents));const maximal=common.filter(id=>!parents.has(id));return maximal.length===1?nodes.get(maximal[0]).data:null;}
// Account-scoped persistent graph cache. Server versions invalidate modified files.
let cacheToken=null,revisionCache=new Map(),indexCache=null,accountKey=null;
let diagnostic=null,checkpointAttempt=0;
export function syncDiagnostic(){return diagnostic?{...diagnostic}:null;}
const CHECKPOINT_LIMIT=12_000_000;
export function checkpointEntries(raw,files,validate=validateRevision){
 if(raw?.format!==1||!Array.isArray(raw.entries))throw Error('sync-invalid');
 const expected=new Map(files.map(f=>[f.id,f.version])),out=new Map();
 for(const entry of raw.entries){if(!Array.isArray(entry)||entry.length!==2)throw Error('sync-invalid');const [id,v]=entry;if(out.has(id))throw Error('sync-invalid');if(expected.has(id)&&expected.get(id)===v?.version)out.set(id,{version:v.version,node:validate(v.raw)});}
 return out;
}
function packed(entries){return [...entries].map(([id,v])=>[id,{version:v.version,raw:{protocol:1,...v.node}}]);}
const assertToken=token=>{if(!token||accessToken()!==token)throw Error('expired');};
async function loadGraph(token){
 assertToken(token);
 if(cacheToken!==token){const current=diagnostic;clearRevisionCache();diagnostic=current;const account=await driveAccount();assertToken(token);accountKey=GOOGLE_CONFIG.clientId+':'+account;cacheToken=token;const saved=await readCache(accountKey);assertToken(token);if(saved?.format===1&&Array.isArray(saved.entries)){try{revisionCache=new Map(saved.entries.map(([id,v])=>[id,{version:v.version,node:validateRevision(v.raw)}]));indexCache=saved.index;}catch{revisionCache.clear();indexCache=null;}}}
 const guard=fn=>async(...args)=>{assertToken(token);const result=await fn(...args);assertToken(token);return result;};
 const index=await refreshIndex(indexCache,{start:guard(changeStart),list:guard(listSyncRevisions),changes:guard(driveChanges)});assertToken(token);
 if(diagnostic){diagnostic.mode=index.mode;diagnostic.total=index.files.length;}
 // Cold device: one packed checkpoint may replace many individual downloads.
 if(!revisionCache.size&&index.files.length>=20){try{const candidates=await guard(listCheckpoints)();for(const file of candidates){if(Number(file.size)>CHECKPOINT_LIMIT*4)continue;try{if(diagnostic)diagnostic.checkpointDownloads++;const cached=checkpointEntries(await guard(downloadBackup)(file.id),index.files);if(cached.size){revisionCache=cached;break;}}catch{assertToken(token);}}}catch{assertToken(token);}}
 let next=new Map(),nodes=new Map();let changed=false;
 for(const file of index.files){let entry=revisionCache.get(file.id);if(!entry||entry.version!==file.version){if(diagnostic)diagnostic.downloads++;const node=validateRevision(await guard(downloadBackup)(file.id));entry={version:file.version,node};changed=true;}else if(diagnostic)diagnostic.hits++;next.set(file.id,entry);nodes.set(file.id,entry.node);}
 try{graphHeads(nodes);}catch(e){
 // A malformed checkpoint or local cache must never prevent a clean server rebuild.
 if(!revisionCache.size)throw e;next=new Map();nodes=new Map();changed=true;
 for(const file of index.files){if(diagnostic)diagnostic.downloads++;const node=validateRevision(await guard(downloadBackup)(file.id));next.set(file.id,{version:file.version,node});nodes.set(file.id,node);}
 graphHeads(nodes);
 }assertToken(token);
 changed ||= next.size!==revisionCache.size||index.cursor!==indexCache?.cursor;
 revisionCache=next;indexCache=index;
 if(changed){const stored=await writeCache(accountKey,{format:1,index,entries:packed(next)});if(diagnostic)diagnostic.storage=stored?"saved":"unavailable";assertToken(token);}
 // Publish at most once per session hour, and only when enough revisions accumulated.
 // Best effort only: never delete or replace authoritative revisions.
 if(next.size>=20&&Date.now()-checkpointAttempt>=3600000){checkpointAttempt=Date.now();try{const recent=await guard(listCheckpoints)();const newest=recent[0];if(!newest||Date.now()-Date.parse(newest.createdTime)>=7*86400000){const payload={format:1,entries:packed(next)};if(JSON.stringify(payload).length<=CHECKPOINT_LIMIT){await guard(uploadCheckpoint)(payload);if(diagnostic)diagnostic.checkpointCreated=true;}}}catch{assertToken(token);}}
 return {nodes};
}
export function clearRevisionCache(){revisionCache.clear();cacheToken=null;indexCache=null;accountKey=null;checkpointAttempt=0;diagnostic=null;}
let running=false;
export async function syncNow(repo,choose,approve,canApply=()=>true){
 if(running)throw new Error('sync-busy');running=true;const started=performance.now();diagnostic={mode:"unknown",total:0,downloads:0,hits:0,checkpointDownloads:0,checkpointCreated:false,storage:"unchanged",status:"running",at:new Date().toISOString()};
 try{
  const local=await makeBackup(repo),state=readSyncState(),token=accessToken(),{nodes}=await loadGraph(token);
  if(accessToken()!==token)throw new Error("expired");
  const heads=graphHeads(nodes);
  if(state&&!nodes.has(state.id))throw new Error('sync-account');
  let merged=local,counts={upload:local.records.length,download:0,same:0,conflicts:0};
  if(heads.length){let remote=nodes.get(heads[0]).data;let branchConflicts=0;
   // Reconcile simultaneous cloud branches without losing either immutable revision.
   for(let i=1;i<heads.length;i++){const plan=await interactivePlan(remote,nodes.get(heads[i]).data,commonBase(heads.slice(0,i+1),nodes),choose);remote=plan.data;branchConflicts+=plan.counts.conflicts;}
   const base=state?commonBase([state.id,...heads],nodes):null;
   const plan=await interactivePlan(local,remote,base,choose);merged=plan.data;counts=plan.counts;counts.conflicts+=branchConflicts;
  }
  if(!await approve(counts,heads.length))throw new Error('sync-cancel');
  if(accessToken()!==token||!canApply()||fingerprint(await makeBackup(repo))!==fingerprint(local))throw new Error('sync-local-changed');
  // Identical local and sole cloud head: no local data write, no upload, no second listing.
  if(heads.length===1&&fingerprint(local)===fingerprint(nodes.get(heads[0]).data)){
   saveSyncState(heads[0]);return {...counts,pending:false,unchanged:true};
  }
  saveSafety(local);
  // Reuse unchanged single head; otherwise append a revision referencing all observed heads.
  let id=heads.length===1&&fingerprint(merged)===fingerprint(nodes.get(heads[0]).data)?heads[0]:null;
  if(!id){const result=await uploadSyncRevision({protocol:1,parents:heads,data:merged});if(!result.id)throw new Error('sync-invalid');id=result.id;}
  if(accessToken()!==token||!canApply()||fingerprint(await makeBackup(repo))!==fingerprint(local))throw new Error('sync-local-changed');
  await repo.applySync(local.records,merged.records);
  setTargets(merged.targets);saveSyncState(id);
  let pending=true;try{const after=await loadGraph(token);pending=[...after.nodes.keys()].some(key=>!nodes.has(key)&&key!==id);}catch{}return {...counts,pending};
 }catch(e){if(diagnostic)diagnostic.status="failed";throw e;}finally{if(diagnostic){if(diagnostic.status==="running")diagnostic.status="done";diagnostic.ms=Math.round(performance.now()-started);}running=false;}
}
