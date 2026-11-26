// Central configuration; no personal records or credentials here.
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'health-tracker:v1';
export const trackers = Object.freeze([
  { id:'weight', label:'Weight', unit:'kg', step:0.1, min:1, max:500, chart:'line' },
  { id:'exercise', label:'Exercise', unit:'min', step:1, min:0, max:1440, chart:'bar' },
  { id:'water', label:'Water', unit:'ml', step:1, min:0, max:30000, chart:'bar' },
  { id:'sleep', label:'Sleep', unit:'h', step:0.1, min:0, max:24, chart:'line' },
  ...['breakfast','lunch','dinner','snack'].map(id=>({id,label:id,unit:'kcal',step:1,min:0,max:100000,type:'meal'})),
  { id:'healthyDiet', label:'Healthy diet', unit:'', type:'boolean' },
]);
export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function validDate(s) {
  if(typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isFinite(+d) && d.toISOString().slice(0,10) === s;
}

export const mealIds = Object.freeze(["breakfast","lunch","dinner","snack"]);
