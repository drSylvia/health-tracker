import {mealIds,localDate} from './config.js?v=1.1.17';
// Net walking energy above resting expenditure; moderate level walking = 3.8 MET.
export const WALKING_MET = 3.8;
export function dailyEnergy(records,date,baseline){
 const day=new Map(records.filter(r=>r.date===date&&!r.deleted).map(r=>[r.trackerId,r.value]));
 const meals=mealIds.map(id=>day.get(id));const count=meals.filter(v=>typeof v==='number').length;
 const intake=meals.reduce((a,b)=>a+(b??0),0);
 const minutes=day.get('exercise')??0;
 const manual=day.get('exerciseCalories');
 let exercise=0,exerciseSource='none',exerciseWeight=null;
 if(typeof manual==='number'){exercise=manual;exerciseSource='manual';}
 else if(minutes>0){
  const weight=records.filter(r=>!r.deleted&&r.trackerId==='weight'&&r.date<=date&&Number.isFinite(r.value)&&r.value>0).reduce((latest,r)=>!latest||r.date>latest.date?r:latest,null);
  exerciseWeight=weight?.value??null;
  exercise=exerciseWeight===null?null:Math.round((WALKING_MET-1)*3.5*exerciseWeight/200*minutes);
  exerciseSource=exercise===null?'missingWeight':'walking';
 }
 const manualBaseline=day.get('dailyBaseline');
 const baselineSource=typeof manualBaseline==='number'?'manual':baseline==null?'unset':'default';
 baseline=manualBaseline??baseline;
 const output=baseline!=null&&exercise!==null?baseline+exercise:null;
 return {count,intake,exercise,exerciseSource,exerciseWeight,baseline,baselineSource,output,balance:output!==null?output-intake:null};
}
export function energySeries(records,baseline,days,end=new Date()){
 const start=new Date(end);start.setDate(start.getDate()-days+1);
 return [...new Set(records.filter(r=>!r.deleted&&(mealIds.includes(r.trackerId)||r.trackerId==='exerciseCalories'||r.trackerId==='exercise')).map(r=>r.date))].filter(d=>d>=localDate(start)&&d<=localDate(end)).sort().map(date=>({date,...dailyEnergy(records,date,baseline)}));
}
