import {accessToken,forgetToken} from './google-auth.js?v=1.1.1';
export async function testDrive(){
 const token=accessToken();if(!token)throw new Error('expired');
 const url=new URL('https://www.googleapis.com/drive/v3/files');
 url.search=new URLSearchParams({spaces:'appDataFolder',fields:'nextPageToken',pageSize:'1',q:'trashed = false'});
 const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(response.status===401)forgetToken();
 if(!response.ok)throw new Error(`HTTP ${response.status}`);
 await response.json();
}

const BASE='https://www.googleapis.com/drive/v3/files';
async function request(url,options={}){
 const token=accessToken();if(!token)throw new Error('expired');
 const r=await fetch(url,{...options,headers:{...options.headers,Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(30000)});
 if(r.status===401)forgetToken();if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();
}
export async function listBackups(){
 const files=[];let pageToken;
 do{const url=new URL(BASE);url.search=new URLSearchParams({spaces:'appDataFolder',q:"name = 'health-data.json' and trashed = false",fields:'nextPageToken,files(id,name,createdTime,size)',orderBy:'createdTime desc',pageSize:'100',...(pageToken?{pageToken}:{})});const data=await request(url);files.push(...(data.files||[]));pageToken=data.nextPageToken;}while(pageToken);
 return files.sort((a,b)=>String(b.createdTime).localeCompare(String(a.createdTime)));
}
export async function uploadBackup(data){
 const boundary='health_'+crypto.randomUUID();const metadata={name:'health-data.json',parents:['appDataFolder'],mimeType:'application/json'};
 const body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(data)}\r\n--${boundary}--\r\n`;
 return request('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,createdTime,size',{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body});
}
export async function downloadBackup(id){return request(`${BASE}/${encodeURIComponent(id)}?alt=media`);}
