import {createRepository} from './repository.js?v=1.1.12';
import {mountUI} from './ui.js?v=1.1.12';
import {applyPreferences,t} from './i18n.js?v=1.1.12';
applyPreferences();
try{await mountUI(document.getElementById('app'),createRepository());}catch(error){document.getElementById('app').textContent=t('error');console.error(error);}
