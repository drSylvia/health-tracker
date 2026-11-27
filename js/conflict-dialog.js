import {t,unit} from './i18n.js?v=1.1.8';
import {targetFields} from './config.js?v=1.1.8';
export function chooseConflict(c){return new Promise(resolve=>{
 const dialog=document.createElement('dialog');dialog.className='sync-conflict-dialog';
 const add=(parent,tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;parent.append(e);return e;};
 const r=c.local||c.cloud, f=targetFields.find(f=>f.key===c.key);
 add(dialog,'h2',t('conflictTitle'));add(dialog,'p',c.kind==='record'?t(r.trackerId)+' · '+r.date:t(f.id+'TargetLabel'));add(dialog,'p',t('conflictHelp'),'text-muted');
 const form=add(dialog,'form','', 'stack');let choice=null;
 const confirm= document.createElement('button');confirm.type='submit';confirm.className='primary';confirm.textContent=t('conflictApply');confirm.disabled=true;
 for(const [side,label,v] of [['local','candidateA',c.local],['cloud','candidateB',c.cloud]]){
 const row=add(form,'label','','conflict-option');const radio=document.createElement('input');radio.type='radio';radio.name='conflict';radio.value=side;row.append(radio);const info=add(row,'div','');add(info,'small',t(label),'text-muted');add(info,'strong',v==null?t('targetUnset'):c.kind==='target'?String(v)+' '+unit(f.id):v.deleted?t('syncDeleted'):String(v.value)+' '+unit(v.trackerId));if(c.kind==='record'&&v?.updatedAt)add(info,'small',new Date(v.updatedAt).toLocaleString(),'text-muted');radio.onchange=()=>{choice=side;confirm.disabled=false;};}
 form.append(confirm);const cancel=add(form,'button',t('cancel'));cancel.type='button';let finished=false;const finish=side=>{if(finished)return;finished=true;dialog.close();dialog.remove();resolve(side);};cancel.onclick=()=>finish(null);dialog.addEventListener('cancel',e=>{e.preventDefault();finish(null);});form.onsubmit=e=>{e.preventDefault();if(choice)finish(choice);};document.body.append(dialog);try{dialog.showModal();}catch{dialog.remove();resolve(null);}
});}
