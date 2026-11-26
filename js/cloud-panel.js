import {configured,accessToken,connect,disconnect} from './google-auth.js?v=1.1.0';
import {testDrive} from './google-drive.js?v=1.1.0';
import {t} from './i18n.js?v=1.1.0';
let busy=false, message='', detail='';
export function cloudPanel(){
 const card=document.createElement('section');card.className='card stack cloud-card';
 const add=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;card.append(e);return e;};
 const draw=()=>{card.replaceChildren();add('h2',t('cloudTitle'));add('h3','Google Drive');add('p',t('cloudHelp'),'text-muted text-small');add('p',t(accessToken()?'cloudConnected':'cloudDisconnected'),'sync-label');add('p',t('cloudNoSync'),'text-muted text-small');if(!configured())add('p',t('cloudConfig'),'text-muted');const status=add('p',message?t(message)+detail:'','text-small');status.setAttribute('role','status');
 const action=(key,fn,cls)=>{const b=add('button',t(key),cls);b.type='button';b.disabled=busy||!configured();b.onclick=async()=>{if(busy)return;busy=true;message='cloudWorking';detail='';draw();try{await fn();}catch(e){message='cloudError';detail=/^HTTP \d+$/.test(e.message)?' · '+e.message:'';}finally{busy=false;draw();}};};
 if(accessToken()){action('cloudTest',async()=>{await testDrive();message='cloudTestOk';},'primary');action('cloudDisconnect',async()=>{await disconnect();message='cloudDisconnected';});}else action('cloudConnect',async()=>{await connect();message='cloudConnected';},'primary');};
 draw();return card;
}
