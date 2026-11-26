import {configured,accessToken,connect,disconnect} from './google-auth.js?v=1.1.1';
import {testDrive,listBackups,uploadBackup,downloadBackup} from './google-drive.js?v=1.1.1';
import {makeBackup,validateBackup,compareBackup,restoreBackup} from './cloud-backup.js?v=1.1.1';
import {t} from './i18n.js?v=1.1.1';
let busy=false,message='',detail='';
export function cloudPanel(repo,refresh){
 const card=document.createElement('section');card.className='card stack cloud-card';let backups=[],selected='',preview=null;
 const add=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;card.append(e);return e;};
 const load=async()=>{backups=await listBackups();selected=backups[0]?.id||'';preview=null;};
 const draw=()=>{card.replaceChildren();add('h2',t('cloudTitle'));add('h3','Google Drive');add('p',t('cloudHelp'),'text-muted text-small');add('p',t(accessToken()?'cloudConnected':'cloudDisconnected'),'sync-label');add('p',t('cloudNoSync'),'text-muted text-small');if(!configured())add('p',t('cloudConfig'),'text-muted');const status=add('p',message?t(message)+detail:'','text-small');status.setAttribute('role','status');
 const action=(key,fn,cls)=>{const b=add('button',t(key),cls);b.type='button';b.disabled=busy||!configured();b.onclick=async()=>{if(busy)return;busy=true;message='cloudWorking';detail='';draw();try{await fn();}catch(e){message='cloudError';detail=/^HTTP \d+$/.test(e.message)?' · '+e.message:e.message==='invalid-backup'?' · '+t('invalidBackup'):'';}finally{busy=false;draw();}};return b;};
 if(accessToken()){
 action('cloudTest',async()=>{await testDrive();message='cloudTestOk';});
 action('cloudUpload',async()=>{const data=await makeBackup(repo);if(!confirm(t('cloudUploadConfirm'))){message='';return;}await uploadBackup(data);message='cloudUploadOk';try{await load();}catch{message='cloudUploadListError';}},'primary');
 action('cloudList',async()=>{await load();message=backups.length?'cloudListOk':'cloudEmpty';});
 if(backups.length){const select=add('select','');select.setAttribute('aria-label',t('cloudChoose'));select.disabled=busy;for(const file of backups){const opt=document.createElement('option');opt.value=file.id;opt.textContent=new Date(file.createdTime).toLocaleString();select.append(opt);}select.value=selected;select.onchange=()=>{selected=select.value;preview=null;draw();};
 action('cloudInspect',async()=>{const data=validateBackup(await downloadBackup(selected));preview={data,counts:await compareBackup(repo,data)};message='cloudInspectOk';});
 if(preview){add('p',t('cloudCounts',preview.counts));add('p',t('cloudBackupTime')+' '+new Date(preview.data.exportedAt).toLocaleString(),'text-muted text-small');add('p',t('cloudRestoreHelp'),'text-muted text-small');action('cloudRestore',async()=>{const counts=await compareBackup(repo,preview.data);if(!confirm(t('cloudCounts',counts)+'\n'+t('cloudRestoreConfirm'))){message='';return;}const goals=confirm(t('cloudTargetsConfirm'));const result=await restoreBackup(repo,preview.data,goals);message=result.targetError?'cloudTargetError':'imported';detail=result.targetError?' · '+t('imported',result):'';if(!result.targetError){message='cloudRestoreOk';detail=' · '+t('imported',result);}preview=null;busy=false;await refresh();});}
 }
 action('cloudDisconnect',async()=>{await disconnect();backups=[];preview=null;message='cloudDisconnected';});
 }else action('cloudConnect',async()=>{await connect();backups=[];selected='';preview=null;message='cloudConnected';},'primary');};
 draw();return card;
}
