// Device-local automation preferences. No credentials or health records are stored here.
import {accessToken} from './google-auth.js?v=1.1.12';
import {readSyncState} from './sync-state.js?v=1.1.12';
import {syncNow} from './sync.js?v=1.1.12';
import {listBackups,uploadBackup} from './google-drive.js?v=1.1.12';
import {makeBackup} from './cloud-backup.js?v=1.1.12';
const KEY='health-tracker:auto:v1';
const periods={daily:1,weekly:7,monthly:30};
export function autoPrefs(){try{const p=JSON.parse(localStorage.getItem(KEY)||'{}');return {sync:p.sync!==false,backup:p.backup!==false,frequency:Object.hasOwn(periods,p.frequency)?p.frequency:'weekly'};}catch{return {sync:true,backup:true,frequency:'weekly'};}}
export function setAutoPrefs(p){localStorage.setItem(KEY,JSON.stringify({...autoPrefs(),...p}));}
export function backupDue(files,frequency,now=Date.now()){const dates=files.map(f=>Date.parse(f.createdTime)).filter(Number.isFinite);return !dates.length||now-Math.max(...dates)>=periods[frequency]*86400000;}
let lastBackupCheck=0,lastBackupToken=null,lastBackupFrequency=null;
export async function backupIfDue(repo,canRun=()=>true,api={listBackups,uploadBackup,makeBackup}){const p=autoPrefs();if(!p.backup||!canRun())return false;const token=accessToken(),now=Date.now();
 if(token&&token===lastBackupToken&&p.frequency===lastBackupFrequency&&now-lastBackupCheck<300000)return false;
 const files=await api.listBackups();if(!backupDue(files,p.frequency)){lastBackupToken=token;lastBackupFrequency=p.frequency;lastBackupCheck=now;return false;}if(!canRun())return false;const data=await api.makeBackup(repo);if(!canRun())return false;await api.uploadBackup(data);lastBackupToken=token;lastBackupFrequency=p.frequency;lastBackupCheck=now;return true;}
export async function automaticSync(repo,canRun,api={syncNow,backupIfDue}){
 if(!autoPrefs().sync||!accessToken()||!readSyncState()||!canRun())return null;
 const result=await api.syncNow(repo,()=>{throw new Error('auto-conflict');},()=>canRun(),canRun);
 let backup='';if(!result.pending){try{if(await api.backupIfDue(repo,canRun))backup='autoBackupDone';}catch{backup='autoBackupFailed';}}
 return {...result,backup};
}
