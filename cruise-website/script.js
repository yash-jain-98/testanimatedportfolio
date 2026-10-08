const experiences=[
{id:'deck',name:'Golden-hour deck walk',time:'17:45',duration:'30 minutes',kind:'ON THE SHIP',where:'Open-air deck',description:'Take a quiet moment on deck as the light softens over the waterfront.',details:'A self-guided moment for fresh air and waterfront views. Bring a light layer and wear comfortable, non-slip shoes. Access to outdoor areas depends on the vessel, weather and crew instructions.'},
{id:'dinner',name:'Dinner on the water',time:'18:30',duration:'90 minutes',kind:'ONBOARD DINING',where:'Dining deck',description:'Settle in for good food, good company and an ever-changing view.',details:'An illustrative dining experience. Menus, seating times, dietary options and inclusions depend on the cruise you book. Contact the operator before booking to confirm accessibility and dietary requirements.'},
{id:'shore',name:'A waterfront wander',time:'16:00',duration:'45 minutes',kind:'BEFORE YOU BOARD',where:'Departure waterfront',description:'Arrive a little early and explore the waterfront before your cruise.',details:'A suggested independent walk before boarding, rather than an operator-led excursion. Confirm your departure location and check-in time first. Allow plenty of time to return; no shore stop during the sailing is implied.'}
];
let plan=[{id:'boarding',name:'Welcome aboard',time:'17:00',where:'Departure point · confirm with operator'},experiences[0],experiences[1]];
const el=id=>document.getElementById(id);let toastTimer;
function toast(message){el('toast').textContent=message;el('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el('toast').classList.remove('show'),3000)}
function render(){el('count').textContent=`${plan.length} experience${plan.length===1?'':'s'}`;el('plan').replaceChildren();for(const item of [...plan].sort((a,b)=>a.time.localeCompare(b.time))){const row=document.createElement('div');row.className='plan-item';const time=document.createElement('time');time.textContent=item.time;const copy=document.createElement('div');const title=document.createElement('h4');title.textContent=item.name;const desc=document.createElement('p');desc.textContent=item.where;copy.append(title,desc);const remove=document.createElement('button');remove.className='remove';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${item.name} from plan`);remove.onclick=()=>{plan=plan.filter(p=>p.id!==item.id);render();toast('Removed from your draft plan')};row.append(time,copy,remove);el('plan').append(row)}if(!plan.length){const p=document.createElement('p');p.textContent='Your plan is empty. Add an experience below.';el('plan').append(p)}document.querySelectorAll('[data-add]').forEach(b=>{const added=plan.some(p=>p.id===b.dataset.add);b.disabled=added;b.textContent=added?'In your plan':'Add to plan'})}
function add(id){const item=experiences.find(x=>x.id===id);if(!item)throw new Error('Unknown experience');if(!plan.some(p=>p.id===id)){plan.push(item);render();toast('Added to your draft plan')}return {id,added:true,total:plan.length}}
function details(item){el('detail-content').innerHTML=`<p class="eyebrow">${item.kind} · SAMPLE EXPERIENCE</p><h2>${item.name}</h2><p>${item.duration} · ${item.where}</p><p>${item.details}</p><p class="small">Suggested time: ${item.time}. This is a draft plan, not a reservation.</p><button class="button" data-add="${item.id}">Add to plan</button>`;el('detail-content').querySelector('button').onclick=()=>add(item.id);render();el('details').showModal()}
for(const item of experiences){const card=document.createElement('article');card.className='experience';card.innerHTML=`<span class="eyebrow">${item.kind}</span><h3>${item.name}</h3><p>${item.description}</p><span class="meta">${item.duration} · Sample experience</span><div class="actions"><button class="details-button">View details</button><button class="button" data-add="${item.id}">Add to plan</button></div>`;card.querySelector('.details-button').onclick=()=>details(item);card.querySelector('[data-add]').onclick=()=>add(item.id);el('experiences').append(card)}
el('details').querySelector('.close').onclick=()=>el('details').close();el('details').addEventListener('click',event=>{if(event.target===el('details')){const rect=el('details').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)el('details').close()}});
const urls={victoria:'https://www.melbourneboatparties.org/',lady:'https://ladycutler.com.au/',charter:'https://australianboatcharters.com.au/'};el('book').onclick=()=>window.open(urls[el('ship').value],'_blank','noopener');
el('download').onclick=()=>{const text='MY DAY ON THE WATER\nAustralian Boat Parties · Draft plan\n\n'+[...plan].sort((a,b)=>a.time.localeCompare(b.time)).map(p=>`${p.time}  ${p.name}\n       ${p.where}`).join('\n\n')+'\n\nSample schedule only. This is not a booking or confirmed itinerary. Confirm times and availability with the operator.\nhttps://australianboatparties.com/\n';const blob=new Blob([text],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='my-cruise-plan.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your draft plan has been downloaded')};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const cinema=document.querySelector('.cinema'), stage=document.querySelector('.stage');
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
function cinemaValues(distance){
 const intro=ease(distance/650),split=ease((distance-560)/700),party=ease((distance-1760)/500),cards=ease((distance-2760)/700);
 const diningIn=ease((distance-750)/420),diningOut=ease((distance-1630)/300);
 return {intro,split,party,cards,dining:diningIn*(1-diningOut),partyCopy:ease((distance-1900)/400)*(1-ease((distance-2640)/320)),scene:distance<1050?0:distance<1930?1:distance<2990?2:3};
}
let rafPending=false,smoothDistance=0,mouseX=0,mouseY=0,targetX=0,targetY=0;
const sceneNames=['01 / THE SHIP','02 / STEP INSIDE','03 / AFTER DARK','04 / YOUR NEXT CHAPTER'];
function paint(){
 const rect=cinema.getBoundingClientRect(),maxDistance=cinema.offsetHeight-stage.offsetHeight;
 const target=clamp(-rect.top,0,maxDistance),motion=reduce.matches;
 smoothDistance=motion?target:smoothDistance+(target-smoothDistance)*.14;
 mouseX=motion?0:mouseX+(targetX-mouseX)*.08;mouseY=motion?0:mouseY+(targetY-mouseY)*.08;
 const v=cinemaValues(smoothDistance),set=(key,value)=>stage.style.setProperty(key,String(value));
 set('--intro',1-v.intro);set('--title-y',`${v.intro*-210}px`);set('--title-scale',1-v.intro*.08);
 set('--split',v.split);set('--split-x',`${v.split*60}vw`);set('--split-y',`${-v.split*180}px`);set('--split-scale',1+v.split*.55);
 set('--exterior-opacity',1-ease((smoothDistance-560)/60));set('--split-opacity',1-ease((smoothDistance-1200)/160));
 set('--dining-opacity',v.dining);set('--party-opacity',v.party);set('--party-copy',v.partyCopy);
 set('--cards-opacity',v.cards);set('--cards-x',`${Math.pow(1-v.cards,1.55)*120}vw`);
 set('--scene-scale',1.04+clamp(smoothDistance/3700)*.15);set('--scene-blur',`${v.cards*12}px`);
 set('--mx',`${mouseX*18}px`);set('--my',`${mouseY*10}px`);
 const panels=[[document.querySelector('.copy-intro'),1-v.intro],[document.querySelector('.copy-dining'),v.dining],[document.querySelector('.copy-party'),v.partyCopy],[document.querySelector('.cinema-cruises'),v.cards]];
 for(const [panel,visibility]of panels){panel.inert=visibility<.5;panel.setAttribute('aria-hidden',String(visibility<.5))}
 el('scene-label').textContent=sceneNames[v.scene];document.querySelectorAll('[data-scene]').forEach((button,i)=>{if(i===v.scene)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
 rafPending=false;if(Math.abs(target-smoothDistance)>.08||(!motion&&(Math.abs(mouseX-targetX)>.001||Math.abs(mouseY-targetY)>.001)))requestTick();
}
function requestTick(){if(!rafPending){rafPending=true;requestAnimationFrame(paint)}}
addEventListener('scroll',requestTick,{passive:true});addEventListener('resize',requestTick);reduce.addEventListener('change',requestTick);
addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){targetX=event.clientX/innerWidth-.5;targetY=event.clientY/innerHeight-.5;requestTick()}},{passive:true});
document.querySelectorAll('[data-scene]').forEach(button=>button.onclick=()=>{const distances=[0,1280,2300,3550];window.scrollTo({top:cinema.getBoundingClientRect().top+scrollY+distances[Number(button.dataset.scene)],behavior:reduce.matches?'instant':'smooth'})});
const track=document.querySelector('.cinema-track');el('cruise-prev').onclick=()=>track.scrollBy({left:-track.clientWidth*.8,behavior:reduce.matches?'instant':'smooth'});el('cruise-next').onclick=()=>track.scrollBy({left:track.clientWidth*.8,behavior:reduce.matches?'instant':'smooth'});
document.querySelectorAll('.scene img').forEach(img=>img.addEventListener('error',()=>{img.closest('.scene').classList.add('image-unavailable')}));
render();requestTick();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'add_draft_cruise_experience',description:'Add a sample experience to the current unsaved cruise draft. Does not create a booking.',inputSchema:{type:'object',properties:{experienceId:{type:'string',enum:experiences.map(e=>e.id)}},required:['experienceId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input.experienceId!=='string'||Object.keys(input).some(k=>k!=='experienceId'))throw new Error('Invalid experience input');return add(input.experienceId)}})).catch(()=>{})}catch{}}

