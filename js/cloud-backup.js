import {normalize} from './repository.js?v=1.1.6';
import {SCHEMA_VERSION,targetFields,validTarget} from './config.js?v=1.1.6';
import {getPreferences,setTargets} from './i18n.js?v=1.1.6';
export function validateBackup(data){
 if(data?.schemaVersion!==SCHEMA_VERSION||!Array.isArray(data.records)||!data.targets||typeof data.targets!=='object'||Array.isArray(data.targets)||typeof data.exportedAt!=='string'||!Number.isFinite(Date.parse(data.exportedAt)))throw new Error('invalid-backup');
 const records=data.records.map(r=>{if(!r||typeof r.updatedAt!=='string')throw new Error('invalid-backup');return normalize(r);});
 if(new Set(records.map(r=>r.id)).size!==records.length)throw new Error('invalid-backup');
 const targets={};for(const f of targetFields){if(!Object.hasOwn(data.targets,f.key)||!validTarget(f,data.targets[f.key]))throw new Error('invalid-backup');targets[f.key]=data.targets[f.key];}
 return {schemaVersion:SCHEMA_VERSION,exportedAt:data.exportedAt,records,targets};
}
export async function makeBackup(repo){const backup=await repo.exportBackup();const prefs=getPreferences();return validateBackup({...backup,targets:Object.fromEntries(targetFields.map(f=>[f.key,prefs[f.key]]))});}
export async function compareBackup(repo,data){const cloud=validateBackup(data);const local=await repo.list({includeDeleted:true});const map=new Map(local.map(r=>[r.id,r]));let added=0,conflicts=0;for(const r of cloud.records){const old=map.get(r.id);if(!old)added++;else if(old.deleted!==r.deleted||old.value!==r.value)conflicts++;}return {local:local.filter(r=>!r.deleted).length,cloud:cloud.records.filter(r=>!r.deleted).length,added,conflicts};}
export async function restoreBackup(repo,data,restoreTargets=false){const cloud=validateBackup(data);const result=await repo.importBackup(cloud);if(restoreTargets){try{setTargets(cloud.targets);}catch{return {...result,targetError:true};}}return result;}
