import {t,unit} from './i18n.js';
import {localDate} from './config.js';
const NS='http://www.w3.org/2000/svg';
// Measure the actual chart viewport, not a fixed 360-unit canvas.
const observed = new Map();
const observer = new ResizeObserver(entries => {
 for (const entry of entries) {
  const draw = observed.get(entry.target);
  if (draw && entry.target.isConnected && entry.contentRect.width > 0) draw(entry.contentRect.width, entry.contentRect.height);
 }
});
const cleanup = new MutationObserver(() => {
 for (const area of observed.keys()) if (!area.isConnected) { observer.unobserve(area); observed.delete(area); }
});
cleanup.observe(document.documentElement, {childList:true,subtree:true});
export function renderChart(container,records,tracker,days=7,endDate=new Date()){
 observer.unobserve(container);observed.delete(container);container.replaceChildren();const end=new Date(endDate);end.setHours(12,0,0,0);const start=new Date(end);start.setDate(start.getDate()-days+1);
 const points=records.filter(r=>r.trackerId===tracker.id&&typeof r.value==='number'&&r.date>=localDate(start)&&r.date<=localDate(end)).sort((a,b)=>a.date.localeCompare(b.date));
 if(!points.length){const p=document.createElement('p');p.className='empty';p.textContent=t('chartEmpty');container.append(p);return;}
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 360 180');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${t(tracker.id)} · ${t('days',{n:days})}`);
 const draw=(width,height)=>{
 const W=Math.max(1,width),H=Math.max(1,height),left=Math.min(48,W*.22),right=Math.max(left+1,W-12),top=16,bottom=Math.max(top+1,H-30),plotWidth=right-left;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.replaceChildren();
 const add=(tag,attrs,text)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 const vs=points.map(p=>p.value);
 let lo,hi,weightTicks=null;
 if(tracker.id==='weight'){
  lo=50;hi=65;weightTicks=[50,55,60,65];
 }else{
  lo=tracker.chart==='bar'?0:Math.max(0,Math.min(...vs)-Math.max(.2,(Math.max(...vs)-Math.min(...vs))*.15));
  hi=Math.max(...vs,tracker.reference||0);
  if(tracker.chart==='line')hi+=Math.max(.2,(hi-lo)*.15);
  if(hi<=lo)hi=lo+1;
 }
 const ordinal=s=>Date.parse(s+'T00:00:00Z')/86400000;const x=p=>left+((ordinal(p.date)-ordinal(localDate(start))+.5)/days)*plotWidth;const y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top);
 const gridValues=weightTicks||Array.from({length:4},(_,i)=>lo+(hi-lo)*i/3);
 for(const v of gridValues){add('line',{x1:left,x2:right,y1:y(v),y2:y(v),stroke:'var(--color-chart-grid)','stroke-dasharray':'3 4'});add('text',{x:left-6,y:y(v)+3,'text-anchor':'end','font-size':12,fill:'var(--color-chart-axis)'},tracker.id==='weight'?String(v):Number(v.toFixed(1)));}
 const color=tracker.id==='calories'?'var(--color-metric-exercise)':`var(--color-chart-${tracker.id})`;
 if(tracker.chart==='line'&&points.length>1){if(tracker.id==='weight')add('polygon',{points:`${x(points[0])},${bottom} ${points.map(p=>`${x(p)},${y(p.value)}`).join(' ')} ${x(points.at(-1))},${bottom}`,fill:color,opacity:.08});add('polyline',{points:points.map(p=>`${x(p)},${y(p.value)}`).join(' '),fill:'none',stroke:color,'stroke-width':'var(--chart-line-width)','stroke-linejoin':'round','stroke-linecap':'round','vector-effect':'non-scaling-stroke'});}
 for(const p of points){const mark=tracker.chart==='bar'?add('rect',{x:x(p)-Math.min(10,plotWidth*.4/days),y:y(p.value),width:Math.min(20,plotWidth*.8/days),height:bottom-y(p.value),fill:color,rx:2}):add('circle',{cx:x(p),cy:y(p.value),r:'var(--chart-point-radius)',fill:color});const title=document.createElementNS(NS,'title');title.textContent=`${p.date}: ${p.value} ${unit(tracker.id)}`;mark.append(title);}
 if(tracker.reference>0){const line=add('line',{x1:left,x2:right,y1:y(tracker.reference),y2:y(tracker.reference),stroke:'var(--color-metric-weight)','stroke-dasharray':'5 4','vector-effect':'non-scaling-stroke'});const title=document.createElementNS(NS,'title');title.textContent=t('calorieReference')+': '+tracker.reference+' kcal';line.append(title);}
 const ticks=W>=500&&days>=30?4:2;
 for(let i=0;i<ticks;i++){const fraction=i/(ticks-1),d=new Date(start);d.setDate(d.getDate()+Math.round((days-1)*fraction));add('text',{x:left+plotWidth*fraction,y:H-9,'text-anchor':i===0?'start':i===ticks-1?'end':'middle','font-size':12,fill:'var(--color-chart-axis)'},localDate(d).slice(5));}
 };
 container.append(svg);observed.set(container,draw);observer.observe(container);
 draw(container.clientWidth||360,container.clientHeight||180);
}
