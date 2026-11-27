import {targetFields,validTarget} from './config.js?v=1.1.5';
import zh from './locales/zh-CN.js?v=1.1.5';
import en from './locales/en.js?v=1.1.5';
const packs={'zh-CN':zh,en};
const key='health-tracker:preferences';
let prefs={language:'zh-CN',theme:'system',...Object.fromEntries(targetFields.map(f=>[f.key,f.initial]))};
try{const stored=JSON.parse(localStorage.getItem(key)||'{}');if(packs[stored.language])prefs.language=stored.language;if(['light','dark','system'].includes(stored.theme))prefs.theme=stored.theme;for(const f of targetFields)if(Object.hasOwn(stored,f.key)&&validTarget(f,stored[f.key]))prefs[f.key]=stored[f.key];}catch{}
export function getPreferences(){return {...prefs};}
export function applyPreferences(){document.documentElement.lang=prefs.language;document.title=t('app');if(prefs.theme==='system')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=prefs.theme;}
export function setPreference(name,value){if(name==='language'&&!Object.hasOwn(packs,value))return;if(name==='theme'&&!['system','light','dark'].includes(value))return;const field=targetFields.find(f=>f.key===name);if(field){setTargets({[name]:value});return;}if(!['language','theme'].includes(name))return;const next={...prefs,[name]:value};localStorage.setItem(key,JSON.stringify(next));prefs=next;applyPreferences();}
export function setTargets(values){const next={...prefs};for(const [key,value] of Object.entries(values)){const field=targetFields.find(f=>f.key===key);if(!field||!validTarget(field,value))throw new Error('Invalid target');next[key]=value;}localStorage.setItem(key,JSON.stringify(next));prefs=next;}
export function t(key,vars={}){return (packs[prefs.language][key]??zh[key]??key).replace(/\{(\w+)\}/g,(_,k)=>String(vars[k]??''));}
export function formatDate(date){return new Intl.DateTimeFormat(prefs.language,{month:'long',day:'numeric',weekday:'long'}).format(new Date(date+'T12:00:00'));}
export function unit(id){return ['breakfast','lunch','dinner','snack','calories'].includes(id)?'kcal':id==='exercise'?t('min'):id==='sleep'?t('h'):id==='water'?'ml':id==='weight'?'kg':'';}
