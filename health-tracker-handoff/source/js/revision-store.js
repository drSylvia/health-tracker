// Disposable cache, not the source of truth. No OAuth tokens are persisted.
const DB='health-tracker-revision-cache-v1', STORE='snapshots';
function open(){return new Promise((resolve,reject)=>{if(!globalThis.indexedDB)return reject(Error('no-indexeddb'));const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('blocked'));});}
async function operation(mode,fn){let db;try{db=await open();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);const r=fn(tx.objectStore(STORE));tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db?.close();}}
export async function readCache(key){try{return await operation('readonly',s=>s.get(key));}catch{return null;}}
export async function writeCache(key,value){try{if(JSON.stringify(value).length>12_000_000)return false;await operation('readwrite',s=>s.put(value,key));return true;}catch{return false;}}
// Capture a cursor BEFORE listing, then replay changes to close the listing race.
export async function refreshIndex(previous,api){
 const valid=f=>typeof f?.id==='string'&&f.id&&typeof f.version==='string'&&f.version;
 async function advance(files,cursor){const map=new Map(files.map(f=>[f.id,f]));let page=cursor;const seen=new Set();do{if(!page||seen.has(page))throw Error('sync-invalid');seen.add(page);const d=await api.changes(page);for(const c of d.changes||[]){if(!c.fileId)throw Error('sync-invalid');const f=c.file;if(!c.removed&&(!f||typeof f.name!=='string'))throw Error('sync-invalid');if(c.removed||f?.trashed||f?.name!=='health-sync.json')map.delete(c.fileId);else{if(!valid(f)||f.id!==c.fileId)throw Error('sync-invalid');map.set(f.id,{id:f.id,version:f.version});}}if(d.nextPageToken){page=d.nextPageToken;continue;}if(!d.newStartPageToken)throw Error('sync-invalid');return {files:[...map.values()],cursor:d.newStartPageToken};}while(true);}
 if(previous?.cursor&&Array.isArray(previous.files)&&previous.files.every(valid)){try{return {...await advance(previous.files,previous.cursor),mode:"incremental"};}catch{ /* fallback to full listing */ }}
 try{const cursor=await api.start();const files=await api.list();if(!files.every(valid))throw Error('sync-invalid');return {...await advance(files,cursor),mode:"full"};}catch{const files=await api.list();if(!files.every(valid))throw Error('sync-invalid');return {files,cursor:null,mode:"fallback"};}
}
