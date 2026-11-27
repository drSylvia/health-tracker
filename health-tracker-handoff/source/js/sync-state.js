const KEY='health-tracker:sync-state:v1';
const SAFETY='health-tracker:pre-sync:v1';
export function readSyncState(){const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null;}
export function saveSyncState(id){localStorage.setItem(KEY,JSON.stringify({id,at:new Date().toISOString()}));}
export function saveSafety(data){localStorage.setItem(SAFETY,JSON.stringify(data));}
