import {createRepository} from './repository.js';
import {mountUI} from './ui.js';
import {applyPreferences,t} from './i18n.js';
applyPreferences();
try{await mountUI(document.getElementById('app'),createRepository());}catch(error){document.getElementById('app').textContent=t('error');console.error(error);}
