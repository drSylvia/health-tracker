import {createRepository} from './repository.js?v=1.0.3';
import {mountUI} from './ui.js?v=1.0.3';
import {applyPreferences,t} from './i18n.js?v=1.0.3';
applyPreferences();
try{await mountUI(document.getElementById('app'),createRepository());}catch(error){document.getElementById('app').textContent=t('error');console.error(error);}
