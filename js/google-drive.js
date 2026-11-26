import {accessToken,forgetToken} from './google-auth.js?v=1.1.0';
export async function testDrive(){
 const token=accessToken();if(!token)throw new Error('expired');
 const url=new URL('https://www.googleapis.com/drive/v3/files');
 url.search=new URLSearchParams({spaces:'appDataFolder',fields:'nextPageToken',pageSize:'1',q:'trashed = false'});
 const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(response.status===401)forgetToken();
 if(!response.ok)throw new Error(`HTTP ${response.status}`);
 await response.json();
}
