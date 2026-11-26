import {makeBackup,validateBackup} from './cloud-backup.js?v=1.1.3';
import {listSyncRevisions,downloadBackup,uploadSyncRevision} from './google-drive.js?v=1.1.3';
import {readSyncState,saveSyncState,saveSafety} from './sync-state.js?v=1.1.3';
import {setTargets} from './i18n.js?v=1.1.3';
import {targetFields} from './config.js?v=1.1.3';
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
export function validateRevision(raw){if(raw?.protocol!==1||!Array.isArray(raw.parents)||raw.parents.some(x=>typeof x!=='string'||!x)||new Set(raw.parents).size!==raw.parents.length)throw new Error('sync-invalid');return {parents:raw.parents,data:validateBackup(raw.data)};}
export function graphHeads(nodes){
 const referenced=new Set();for(const [id,n] of nodes)for(const p of n.parents){if(p===id||!nodes.has(p))throw new Error('sync-invalid');referenced.add(p);}
 const visiting=new Set(),done=new Set();function visit(id){if(visiting.has(id))throw new Error('sync-invalid');if(done.has(id))return;visiting.add(id);for(const p of nodes.get(id).parents)visit(p);visiting.delete(id);done.add(id);}for(const id of nodes.keys())visit(id);
 return [...nodes.keys()].filter(id=>!referenced.has(id)).sort();
}
function ancestors(id,nodes){const seen=new Set(),todo=[id];while(todo.length){const x=todo.pop();if(seen.has(x))continue;seen.add(x);todo.push(...nodes.get(x).parents);}return seen;}
function commonBase(ids,nodes){if(!ids.length)return null;const sets=ids.map(id=>ancestors(id,nodes));const common=[...sets[0]].filter(id=>sets.every(s=>s.has(id)));const maximal=common.filter(id=>!common.some(other=>other!==id&&ancestors(other,nodes).has(id)));return maximal.length===1?nodes.get(maximal[0]).data:null;}
let running=false;
export async function syncNow(repo,choose,approve,canApply=()=>true){
 if(running)throw new Error('sync-busy');running=true;
 try{
  const local=await makeBackup(repo),state=readSyncState(),files=await listSyncRevisions(),nodes=new Map();
  for(const file of files)nodes.set(file.id,validateRevision(await downloadBackup(file.id)));
  const heads=graphHeads(nodes);
  if(state&&!nodes.has(state.id))throw new Error('sync-account');
  let merged=local,counts={upload:local.records.length,download:0,same:0,conflicts:0};
  if(heads.length){let remote=nodes.get(heads[0]).data;let branchConflicts=0;
   // Reconcile simultaneous cloud branches without losing either immutable revision.
   for(let i=1;i<heads.length;i++){const plan=mergePlan(remote,nodes.get(heads[i]).data,commonBase(heads.slice(0,i+1),nodes),choose);remote=plan.data;branchConflicts+=plan.counts.conflicts;}
   const base=state?commonBase([state.id,...heads],nodes):null;
   const plan=mergePlan(local,remote,base,choose);merged=plan.data;counts=plan.counts;counts.conflicts+=branchConflicts;
  }
  if(!approve(counts,heads.length))throw new Error('sync-cancel');
  if(!canApply()||fingerprint(await makeBackup(repo))!==fingerprint(local))throw new Error('sync-local-changed');
  saveSafety(local);
  // Reuse unchanged single head; otherwise append a revision referencing all observed heads.
  let id=heads.length===1&&fingerprint(merged)===fingerprint(nodes.get(heads[0]).data)?heads[0]:null;
  if(!id){const result=await uploadSyncRevision({protocol:1,parents:heads,data:merged});if(!result.id)throw new Error('sync-invalid');id=result.id;}
  if(!canApply()||fingerprint(await makeBackup(repo))!==fingerprint(local))throw new Error('sync-local-changed');
  await repo.applySync(local.records,merged.records);
  setTargets(merged.targets);saveSyncState(id);
  let pending=true;try{const after=await listSyncRevisions();pending=after.some(f=>!nodes.has(f.id)&&f.id!==id);}catch{}return {...counts,pending};
 }finally{running=false;}
}
