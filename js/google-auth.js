import {GOOGLE_CONFIG} from './cloud-config.js?v=1.2.0';
let token=null, expires=0, pending=false;
export const configured=()=>/^[\w-]+\.apps\.googleusercontent\.com$/.test(GOOGLE_CONFIG.clientId);
export const accessToken=()=>Date.now()<expires?token:null;
export function connect(){
 if(pending)return Promise.reject(new Error('busy'));
 if(!configured()||!window.google?.accounts?.oauth2)return Promise.reject(new Error('unavailable'));
 pending=true;
 return new Promise((resolve,reject)=>{
  const finish=(error)=>{pending=false;error?reject(error):resolve();};
  try{const client=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CONFIG.clientId,scope:GOOGLE_CONFIG.scope,include_granted_scopes:false,callback:r=>{
   if(r.error||!r.access_token||!google.accounts.oauth2.hasGrantedAllScopes(r,GOOGLE_CONFIG.scope)){finish(new Error('authorization'));return;}
   token=r.access_token;expires=Date.now()+Math.max(0,Number(r.expires_in)-30)*1000;finish();
  },error_callback:()=>finish(new Error('popup'))});client.requestAccessToken({prompt:'select_account'});}catch(e){finish(e);}
 });
}
export function forgetToken(){token=null;expires=0;}
export function disconnect(){const old=accessToken();forgetToken();if(!old)return Promise.resolve();return new Promise((resolve,reject)=>{try{google.accounts.oauth2.revoke(old,r=>r?.successful===false||r?.error?reject(new Error('revoke')):resolve());}catch(e){reject(e);}});}
