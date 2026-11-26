import {t,unit} from './i18n.js';
import {localDate} from './config.js';
const NS='http://www.w3.org/2000/svg';
export function renderChart(container,records,tracker,days=7,endDate=new Date()){
 container.replaceChildren();const end=new Date(endDate);end.setHours(12,0,0,0);const start=new Date(end);start.setDate(start.getDate()-days+1);
 const points=records.filter(r=>r.trackerId===tracker.id&&typeof r.value==='number'&&r.date>=localDate(start)&&r.date<=localDate(end)).sort((a,b)=>a.date.localeCompare(b.date));
 if(!points.length){const p=document.createElement('p');p.className='empty';p.textContent=t('chartEmpty');container.append(p);return;}
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 360 165');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${t(tracker.id)} · ${t('days',{n:days})}`);
 const add=(tag,attrs,text)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 const vs=points.map(p=>p.value);let lo=tracker.chart==='bar'?0:Math.max(0,Math.min(...vs)-Math.max(.2,(Math.max(...vs)-Math.min(...vs))*.15));let hi=Math.max(...vs);if(tracker.chart==='line')hi+=Math.max(.2,(hi-lo)*.15);if(hi<=lo)hi=lo+1;
 const ordinal=s=>Date.parse(s+'T00:00:00Z')/86400000;const x=p=>48+((ordinal(p.date)-ordinal(localDate(start))+.5)/days)*300;const y=v=>130-(v-lo)/(hi-lo)*110;
 for(let i=0;i<=3;i++){const v=lo+(hi-lo)*i/3;add('line',{x1:48,x2:348,y1:y(v),y2:y(v),stroke:'var(--color-chart-grid)','stroke-dasharray':'3 4'});add('text',{x:43,y:y(v)+3,'text-anchor':'end','font-size':10,fill:'var(--color-chart-axis)'},Number(v.toFixed(1)));}
 const color=`var(--color-chart-${tracker.id})`;
 if(tracker.chart==='line'&&points.length>1){if(tracker.id==='weight')add('polygon',{points:`${x(points[0])},130 ${points.map(p=>`${x(p)},${y(p.value)}`).join(' ')} ${x(points.at(-1))},130`,fill:color,opacity:.08});add('polyline',{points:points.map(p=>`${x(p)},${y(p.value)}`).join(' '),fill:'none',stroke:color,'stroke-width':'var(--chart-line-width)','stroke-linejoin':'round','stroke-linecap':'round','vector-effect':'non-scaling-stroke'});}
 for(const p of points){const mark=tracker.chart==='bar'?add('rect',{x:x(p)-Math.min(10,120/days),y:y(p.value),width:Math.min(20,240/days),height:130-y(p.value),fill:color,rx:2}):add('circle',{cx:x(p),cy:y(p.value),r:'var(--chart-point-radius)',fill:color});const title=document.createElementNS(NS,'title');title.textContent=`${p.date}: ${p.value} ${unit(tracker.id)}`;mark.append(title);}
 add('text',{x:48,y:151,'font-size':10,fill:'var(--color-chart-axis)'},localDate(start).slice(5));add('text',{x:348,y:151,'text-anchor':'end','font-size':10,fill:'var(--color-chart-axis)'},localDate(end).slice(5));container.append(svg);
}
