import { trackers, validDate, SCHEMA_VERSION } from './config.js?v=1.1.8';
import { createStorage } from './storage.js?v=1.1.8';
export function normalize(record) {
  const t = trackers.find(t=>t.id===record.trackerId);
  if(!t || !validDate(record.date)) throw new Error('Invalid tracker or date');
  if(record.deleted !== undefined && typeof record.deleted !== 'boolean') throw new Error('Invalid deletion flag');
  const deleted = record.deleted === true;
  const v = record.value;
  if(!deleted && (t.type==='boolean' ? typeof v!=='boolean' : typeof v!=='number' || !Number.isFinite(v) || v<t.min || v>t.max)) throw new Error(`Invalid ${t.label} value`);
  const updatedAt = record.updatedAt ?? new Date().toISOString();
  if(typeof updatedAt!=='string' || !Number.isFinite(Date.parse(updatedAt))) throw new Error('Invalid timestamp');
  return {schemaVersion:SCHEMA_VERSION,id:`${t.id}:${record.date}`,trackerId:t.id,date:record.date,value:deleted?null:v,unit:t.unit,updatedAt:new Date(updatedAt).toISOString(),deleted};
}
export function createRepository(storage=createStorage(), syncAdapter=null) {
  let tail=Promise.resolve();
  function mutate(fn){const job=tail.then(async()=>{const state=await storage.read(); const result=fn(state); await storage.write(state); return result;}); tail=job.catch(()=>{}); return job;}
  async function records(){await tail; return (await storage.read()).records.map(normalize);}
  return {
    async list({trackerId,from,to,includeDeleted=false}={}) {return (await records()).filter(r=>(includeDeleted||!r.deleted)&&(!trackerId||r.trackerId===trackerId)&&(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));},
    async get(id){return (await records()).find(r=>r.id===id&&!r.deleted)??null;},
    async save(record){const r=normalize({...record,deleted:false,updatedAt:new Date().toISOString()}); return mutate(s=>{s.records=s.records.filter(x=>x.id!==r.id);s.records.push(r);return r;});},
    async remove(id){return mutate(s=>{const r=s.records.find(x=>x.id===id);if(!r)return false;Object.assign(r,{deleted:true,value:null,updatedAt:new Date().toISOString()});return true;});},
    async exportBackup(){return {schemaVersion:SCHEMA_VERSION,exportedAt:new Date().toISOString(),records:await records()};},
    async importBackup(data){if(data?.schemaVersion!==SCHEMA_VERSION||!Array.isArray(data.records))throw new Error('Invalid backup');const incoming=data.records.map(normalize);if(new Set(incoming.map(r=>r.id)).size!==incoming.length)throw new Error('Duplicate records in backup');return mutate(s=>{const map=new Map(s.records.map(r=>[r.id,normalize(r)]));let added=0,conflicts=0;for(const r of incoming){const old=map.get(r.id);if(!old){map.set(r.id,r);added++;}else if(old.deleted!==r.deleted||old.value!==r.value){conflicts++;}}s.records=[...map.values()];return {added,conflicts};});},
    async applySync(expected,incoming){const sorted=rs=>JSON.stringify(rs.map(normalize).sort((a,b)=>a.id.localeCompare(b.id)));return mutate(s=>{if(sorted(s.records)!==sorted(expected))throw new Error("sync-local-changed");s.records=incoming.map(normalize);});},
    async sync(){if(!syncAdapter)return {status:'local-only'};throw new Error('Cloud sync requires V2.2 event protocol');}
  };
}
