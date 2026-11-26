import zh from './locales/zh-CN.js';
import en from './locales/en.js';
const packs={'zh-CN':zh,en};
const key='health-tracker:preferences';
let prefs={language:'zh-CN',theme:'system',calorieTarget:null};
try{const stored=JSON.parse(localStorage.getItem(key)||'{}');if(packs[stored.language])prefs.language=stored.language;if(['light','dark','system'].includes(stored.theme))prefs.theme=stored.theme;if(Number.isSafeInteger(stored.calorieTarget)&&stored.calorieTarget>0)prefs.calorieTarget=stored.calorieTarget;}catch{}
export function getPreferences(){return {...prefs};}
export function applyPreferences(){document.documentElement.lang=prefs.language;document.title=t('app');if(prefs.theme==='system')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=prefs.theme;}
export function setPreference(name,value){if(name==='language'&&!Object.hasOwn(packs,value))return;if(name==='theme'&&!['system','light','dark'].includes(value))return;if(name==='calorieTarget'&&value!==null&&(!Number.isSafeInteger(value)||value<=0))throw new Error('Invalid calorie target');if(!['language','theme','calorieTarget'].includes(name))return;const next={...prefs,[name]:value};localStorage.setItem(key,JSON.stringify(next));prefs=next;applyPreferences();}
export function t(key,vars={}){return (packs[prefs.language][key]??zh[key]??key).replace(/\{(\w+)\}/g,(_,k)=>String(vars[k]??''));}
export function formatDate(date){return new Intl.DateTimeFormat(prefs.language,{month:'long',day:'numeric',weekday:'long'}).format(new Date(date+'T12:00:00'));}
export function unit(id){return ['breakfast','lunch','dinner','snack','calories'].includes(id)?'kcal':id==='exercise'?t('min'):id==='sleep'?t('h'):id==='water'?'ml':id==='weight'?'kg':'';}
