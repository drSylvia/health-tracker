// Central configuration; no personal records or credentials here.
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'health-tracker:v1';
export const trackers = Object.freeze([
  { id:'weight', label:'Weight', unit:'kg', step:0.1, min:1, max:500, chart:'line' },
  { id:'exercise', label:'Exercise', unit:'min', step:1, min:0, max:1440, chart:'bar' },
  { id:'water', label:'Water', unit:'ml', step:1, min:0, max:30000, chart:'bar' },
  { id:'sleep', label:'Sleep', unit:'h', step:0.1, min:0, max:24, chart:'line' },
  {id:'dailyBaseline',label:'Daily baseline expenditure',unit:'kcal',step:1,min:0,max:100000,type:'energy'},
  {id:'exerciseCalories',label:'Exercise energy',unit:'kcal',step:1,min:0,max:100000,type:'energy'},
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

// Optional personal reference values; not prescribed health targets.
export const targetFields = Object.freeze([
 {id:'weight',key:'weightTarget',step:0.1,max:500,initial:null},
 {id:'calories',key:'calorieTarget',step:1,max:100000,initial:null},
 {id:'dailyEnergy',key:'dailyEnergyTarget',step:1,max:100000,initial:null},
 {id:'exercise',key:'exerciseTarget',step:1,max:1440,initial:45},
 {id:'water',key:'waterTarget',step:1,max:30000,initial:2000},
 {id:'sleep',key:'sleepTarget',step:0.1,max:24,initial:8}
]);
export function validTarget(field,value){return value===null||(typeof value==='number'&&Number.isFinite(value)&&value>=field.step&&value<=field.max&&Math.abs(value/field.step-Math.round(value/field.step))<1e-7);}
