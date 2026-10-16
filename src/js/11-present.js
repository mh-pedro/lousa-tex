const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
/* ================= presentation ================= */
const P={tool:null,color:'#e5322d',sizeIdx:1,ink:{},cur:null,edit:null,barT:null,on:false,i:0,g:0,views:[],timers:[],presenter:false,aud:null,auto:0,loop:false,autoT:null,laser:false,typed:'',typedT:null,
  t0:0,pausedMs:0,pauseAt:0,clockT:null,rec:null,black:false,idleT:null};
function nextIdx(i,dir){let k=i+dir;while(k>=0&&k<deck.slides.length&&deck.slides[k].skip)k+=dir;return k>=0&&k<deck.slides.length?k:-1}
function buildUnits(node,s){
  const units=[];
  animOrder(s).forEach(e=>{const d=node.querySelector('[data-id="'+e.id+'"]');if(!d)return;const a=e.anim;
    const base={kind:a.kind||'in',fx:a.fx,dur:Math.max(.05,+a.dur||.5),delay:+a.delay||0,start:a.start||'click'};
    if(e.type==='box'&&a.byPara){const tx=d.querySelector('.tx'),parts=[];
      Array.from(tx.children).forEach(ch=>{if(ch.tagName==='UL'||ch.tagName==='OL')Array.from(ch.children).forEach(li=>parts.push(li));else parts.push(ch)});
      const real=parts.filter(p=>p.textContent.trim()||p.querySelector('svg'));
      if(real.length){real.forEach((p,k)=>units.push(Object.assign({},base,{nodes:k===0?[p,d.querySelector('.shp')]:[p],start:k===0?base.start:'click'})));return}}
    units.push(Object.assign({},base,{nodes:[d]}))});
  return units;
}
function buildGroups(units){
  const groups=[];let g=null;
  units.forEach(u=>{if(u.start==='click'||!g){g={units:[],auto:u.start!=='click'&&groups.length===0};groups.push(g)}g.units.push(u)});
  groups.forEach(gr=>{let ps=0,pe=0;gr.units.forEach((u,k)=>{const b=k===0?0:(u.start==='with'?ps:pe);u.t0=b+u.delay;ps=u.t0;pe=u.t0+u.dur})});
  return groups;
}
function kf(kind,fx){
  const off=Math.max(W,H)*1.15;
  const IN={fade:[{opacity:0},{opacity:1}],rise:[{opacity:0,translate:'0 40px'},{opacity:1,translate:'0 0'}],
    flyL:[{translate:(-off)+'px 0'},{translate:'0 0'}],flyR:[{translate:off+'px 0'},{translate:'0 0'}],flyT:[{translate:'0 '+(-off)+'px'},{translate:'0 0'}],flyB:[{translate:'0 '+off+'px'},{translate:'0 0'}],
    zoom:[{opacity:0,scale:'.3'},{opacity:1,scale:'1'}],spin:[{opacity:0,rotate:'-200deg',scale:'.3'},{opacity:1,rotate:'0deg',scale:'1'}],wipe:[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}]};
  if(kind==='in')return IN[fx]||null;
  if(kind==='out'){if(fx==='sink')return[{opacity:1,translate:'0 0'},{opacity:0,translate:'0 40px'}];if(fx==='wipe')return[{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(0 0 0 100%)'}];const k=IN[fx];return k?k.slice().reverse():null}
  const EM={pulse:[{scale:'1'},{scale:'1.12'},{scale:'1'}],spin:[{rotate:'0deg'},{rotate:'360deg'}],shake:[{translate:'0 0'},{translate:'-12px 0'},{translate:'12px 0'},{translate:'-7px 0'},{translate:'7px 0'},{translate:'0 0'}],
    flash:[{opacity:1},{opacity:.15},{opacity:1},{opacity:.15},{opacity:1}],grow:[{scale:'1'},{scale:'1.25'},{scale:'1'}]};
  return EM[fx]||null;
}
function applyUnit(u,animate){
  u.nodes.forEach(n=>{if(!n)return;if(n.getAnimations)n.getAnimations().forEach(a=>a.cancel());
    if(u.kind==='in'){n.classList.remove('pa-hid');if(animate){const k=kf('in',u.fx);if(k)n.animate(k,{duration:u.dur*1000,easing:'cubic-bezier(.2,.7,.2,1)'})}}
    else if(u.kind==='out'){const k=animate&&kf('out',u.fx);if(k){const a=n.animate(k,{duration:u.dur*1000,easing:'ease-in',fill:'forwards'});a.onfinish=()=>{n.classList.add('pa-hid');a.cancel()}}else n.classList.add('pa-hid')}
    else if(u.kind==='emph'&&animate){const k=kf('emph',u.fx);if(k)n.animate(k,{duration:u.dur*1000,easing:'ease-in-out'})}});
}
function revertUnit(u){u.nodes.forEach(n=>{if(!n)return;if(n.getAnimations)n.getAnimations().forEach(a=>a.cancel());if(u.kind==='in')n.classList.add('pa-hid');else if(u.kind==='out')n.classList.remove('pa-hid')})}
function clearTimers(flush){P.timers.forEach(t=>{clearTimeout(t.id);if(flush)t.fn()});P.timers=[]}
function runGroup(gi,animate){P.views.forEach(v=>{const g=v.groups[gi];if(!g)return;g.units.forEach(u=>{
  if(!animate||u.t0<=0)applyUnit(u,animate);else{const t={fn:()=>applyUnit(u,true)};t.id=setTimeout(()=>{P.timers=P.timers.filter(x=>x!==t);t.fn()},u.t0*1000);P.timers.push(t)}})})}
const groupsCount=()=>{const v=P.views[0];return v?v.groups.length:0};
const autoGroups=()=>{const v=P.views[0];return v&&v.groups[0]&&v.groups[0].auto?1:0};
function makeView(container,doc){const d=doc||document,slot=d.createElement('div');slot.className='pslot';container.appendChild(slot);return{container:container,slot:slot,doc:d,groups:[],scale:1,primary:false}}
function mountMedia(node,s,primary){
  s.els.forEach(e=>{if(e.type!=='media')return;const d=node.querySelector('[data-id="'+e.id+'"]');if(!d)return;const w=d.querySelector('.mw');if(!w)return;
    if(primary){w.innerHTML='';w.appendChild(node.ownerDocument===document?liveMedia(e):node.ownerDocument.importNode(liveMedia(e),true))}});
}
function renderView(v,state,trans){
  const b=thumbsEl.children[P.i],src=b&&b.querySelector('.slide');if(!src)return;
  const c=v.doc===document?src.cloneNode(true):v.doc.importNode(src,true);
  const cr=v.container.getBoundingClientRect(),s=Math.max(.05,Math.min(cr.width/W,cr.height/H));
  c.style.transform='scale('+s+')';v.scale=s;
  mountMedia(c,deck.slides[P.i],v.primary);
  c.querySelectorAll('a[href]').forEach(a=>{if(!/^#slide:/.test(a.getAttribute('href'))){a.target='_blank';a.rel='noopener'}});
  c.querySelectorAll('[data-link]').forEach(d=>{d.style.cursor='pointer'});
  v.groups=buildGroups(buildUnits(c,deck.slides[P.i]));
  v.groups.forEach(g=>g.units.forEach(u=>{if(u.kind==='in')u.nodes.forEach(n=>n&&n.classList.add('pa-hid'))}));
  const n=state==='all'?v.groups.length:Math.min(state,v.groups.length);
  for(let k=0;k<n;k++)v.groups[k].units.forEach(u=>applyUnit(u,false));
  const oldN=v.slot.querySelector(':scope>.slide');
  v.slot.innerHTML='';v.slot.style.width=W*s+'px';v.slot.style.height=H*s+'px';v.slot.appendChild(c);
  if(trans){const sl=deck.slides[P.i],type=sl.transition||deck.theme.transition;
    if(type==='morph'&&oldN&&P.prevI!=null&&P.prevI!==P.i&&deck.slides[P.prevI])morphIn(v,oldN,c,deck.slides[P.prevI],sl);else transitionIn(v,sl)}
  if(v.primary)c.querySelectorAll('video[data-autoplay],audio[data-autoplay]').forEach(m=>{const p=m.play();if(p&&p.catch)p.catch(()=>{})});
}
const mkey=e=>e.mk||e.id;
const contentOf=e=>e.type==='box'?e.html+'|'+e.size+'|'+e.color+'|'+e.fill+'|'+e.shape:e.type==='table'?JSON.stringify(e.cells):e.type==='image'?e.src:e.type==='tikz'?e.svg:e.type==='chart'?e.data+e.fns+e.kind:JSON.stringify(e);
function morphIn(v,oldN,newN,oldS,newS){
  if(!oldN.animate)return;
  const dur=(newS.transDur||deck.theme.transDur||.5)*1000*1.6,ease='cubic-bezier(.45,.05,.25,1)';
  Object.assign(oldN.style,{position:'absolute',left:'0',top:'0',background:'transparent',backgroundImage:'none',pointerEvents:'none'});
  oldN.querySelectorAll('.slnum,.progbar,.reffoot,.annot,.mst,.spot,.laser').forEach(x=>x.remove());
  v.slot.appendChild(oldN);
  const used=new Set();
  const findOld=ne=>{let o=oldS.els.find(x=>mkey(x)===mkey(ne)&&!used.has(x.id));if(o)return o;
    if(ne.role==='title'){o=oldS.els.find(x=>x.role==='title'&&!used.has(x.id));if(o)return o}
    if(ne.type==='box'&&!isEmptyHTML(ne.html)){o=oldS.els.find(x=>x.type==='box'&&x.html===ne.html&&!used.has(x.id));if(o)return o}
    return null};
  newS.els.forEach(ne=>{const nd=newN.querySelector('[data-id="'+ne.id+'"]');if(!nd)return;const oe=findOld(ne);
    const od=oe&&oldN.querySelector('[data-id="'+oe.id+'"]');
    if(!oe||!od||oe.type!==ne.type||ne.type==='line'||(ne.rot||0)||(oe.rot||0)){nd.animate([{opacity:0},{opacity:0,offset:.4},{opacity:1}],{duration:dur,easing:'ease'});return}
    used.add(oe.id);
    const a=bb(oe),b=bb(ne),bw=nd.offsetWidth||b.w,bh=nd.offsetHeight||b.h,aw=od.offsetWidth||a.w,ah=od.offsetHeight||a.h;
    const dx=a.x-b.x,dy=a.y-b.y,sx=aw/(bw||1),sy=ah/(bh||1);
    const from='translate('+dx+'px,'+dy+'px) scale('+sx+','+sy+')';
    if(contentOf(oe)===contentOf(ne)){od.style.visibility='hidden';nd.animate([{transformOrigin:'0 0',transform:from},{transformOrigin:'0 0',transform:'none'}],{duration:dur,easing:ease})}
    else{nd.animate([{transformOrigin:'0 0',transform:from,opacity:0},{transformOrigin:'0 0',transform:'none',opacity:1}],{duration:dur,easing:ease});
      od.animate([{transformOrigin:'0 0',transform:'none',opacity:1},{transformOrigin:'0 0',transform:'translate('+(-dx)+'px,'+(-dy)+'px) scale('+(1/sx)+','+(1/sy)+')',opacity:0}],{duration:dur,easing:ease,fill:'forwards'})}
  });
  oldS.els.forEach(oe=>{if(used.has(oe.id))return;const od=oldN.querySelector('[data-id="'+oe.id+'"]');if(od)od.animate([{opacity:1},{opacity:0}],{duration:dur*.55,easing:'ease',fill:'forwards'})});
  setTimeout(()=>oldN.remove(),dur+60);
}
function transitionIn(v,s){
  const type=s.transition||deck.theme.transition,dur=((s.transDur||deck.theme.transDur||.5))*1000;if(!type||type==='none'||!v.slot.animate)return;
  const K={fade:[{opacity:0},{opacity:1}],slideL:[{transform:'translateX(100%)'},{transform:'translateX(0)'}],slideU:[{transform:'translateY(100%)'},{transform:'translateY(0)'}],
    zoom:[{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'scale(1)'}],flip:[{transform:'perspective(1400px) rotateY(-90deg)'},{transform:'perspective(1400px) rotateY(0)'}]}[type];
  if(K)v.slot.animate(K,{duration:dur,easing:'cubic-bezier(.2,.7,.2,1)'});
}
function showSlide(i,state,trans){
  finishTextAnnot();clearTimers(false);P.prevI=P.i;P.zoom=null;P.i=i;P.views.forEach(v=>{renderView(v,state,trans);drawAnnot(v)});
  P.g=state==='all'?groupsCount():state;
  if(state===0&&autoGroups()){runGroup(0,true);P.g=1}
  updatePresInfo();scheduleAuto();
}
function pNext(){
  clearTimers(true);
  if(P.g<groupsCount()){runGroup(P.g,true);P.g++;updatePresInfo();scheduleAuto();return}
  let k=nextIdx(P.i,1);if(k<0&&P.loop)k=nextIdx(-1,1);
  if(k>=0)showSlide(k,0,true);else{toast('Fim da apresentação. Esc para sair.');clearTimeout(P.autoT)}
}
function pPrev(){
  clearTimers(false);
  if(P.g>autoGroups()){P.g--;P.views.forEach(v=>{const g=v.groups[P.g];if(g)g.units.slice().reverse().forEach(revertUnit)});updatePresInfo();return}
  const k=nextIdx(P.i,-1);if(k>=0)showSlide(k,'all',true);
}
function pGo(i){if(i>=0&&i<deck.slides.length)showSlide(i,0,true)}
function scheduleAuto(){clearTimeout(P.autoT);if(P.on&&P.auto>0)P.autoT=setTimeout(pNext,P.auto*1000)}
function startPres(from,presenter){
  if(editId)exitEdit();if(cropId)exitCrop();if(masterMode)exitMaster();thumbSoon.flush();closePop();stopPainter();
  from=clamp(from,0,deck.slides.length-1);if(deck.slides[from].skip){const k=nextIdx(from,1);if(k>=0)from=k}
  Object.assign(P,{on:true,presenter:!!presenter,views:[],t0:Date.now(),pausedMs:0,pauseAt:0,black:false,laser:false,typed:'',ink:{},cur:null,edit:null});
  if(presenter){
    $('#presenter').hidden=false;const v=makeView($('#prCur'));v.primary=true;P.views.push(v);
    $('#prGo').innerHTML=deck.slides.map((s,i)=>'<option value="'+i+'">'+(i+1)+'. '+esc(slideTitle(s).slice(0,48))+(s.skip?' (ignorado)':'')+'</option>').join('');
    clearInterval(P.clockT);P.clockT=setInterval(tickClock,500);tickClock();$('#prNotes').style.fontSize=prefs.presenterFont+'px';
    openAudience();
  }else{
    pres.hidden=false;$('#pblack').hidden=true;$('#pnotes').hidden=true;$('#pcaps').hidden=true;const v=makeView(pres);v.primary=true;P.views.push(v);
    try{const r=pres.requestFullscreen&&pres.requestFullscreen();if(r&&r.catch)r.catch(()=>{})}catch(e){}
  }
  P.prevI=null;showSlide(from,0,false);mountCam();
  chain.then(()=>{if(P.on)P.views.forEach(v=>{renderView(v,P.g,false);drawAnnot(v)})});
  setPTool(null);updatePTools();
}
function endPres(){
  if(!P.on)return;finishTextAnnot();const ink=P.ink,hasInk=Object.keys(ink).some(k=>ink[k].strokes.length||ink[k].texts.length);
  stopRecording();if(REC.cam){REC.cam.getTracks().forEach(t=>t.stop());REC.cam=null}unmountCam();
  P.on=false;P.tool=null;P.cur=null;P.zoom=null;clearTimers(false);clearTimeout(P.autoT);clearInterval(P.clockT);stopCaptions();
  P.views.forEach(v=>{if(v.slot&&v.slot.parentNode)v.slot.remove()});P.views=[];
  if(P.aud){try{P.aud.close()}catch(e){}P.aud=null}
  pres.hidden=true;$('#presenter').hidden=true;$$('.laser,.ltrail').forEach(l=>l.remove());P.trail=null;
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
  goto(P.i);
  if(hasInk)openModal('Manter as anotações?','<p class="hint">Você desenhou ou escreveu nos slides durante a apresentação. Se mantiver, elas viram desenhos e caixas de texto editáveis nos próprios slides.</p><div class="btns"><button type="button" class="btn" data-x="no">Descartar</button><button type="button" class="btn primary" data-x="yes">Manter nos slides</button></div>',
    {mount:b=>{b.querySelector('[data-x="no"]').onclick=closeModal;b.querySelector('[data-x="yes"]').onclick=()=>{closeModal();keepInk(ink)}}});
}
function updatePresInfo(){
  updatePTools();
  const n=deck.slides.length,s=deck.slides[P.i],G=groupsCount();
  $('#pcount').textContent=(P.i+1)+' / '+n;$('#pnotes').textContent=s.notes||'Sem anotações neste slide.';
  if(P.presenter){
    $('#prNotes').textContent=s.notes||'Sem anotações neste slide.';$('#prCount').textContent='Slide '+(P.i+1)+' de '+n+(G?' · passo '+P.g+' de '+G:'');$('#prGo').value=P.i;
    const box=$('#prNext');box.innerHTML='';
    if(P.g<G){box.innerHTML='<div style="color:#9aa4ab;font:500 14px var(--ui);padding:12px;text-align:center">Próximo clique: animação '+(P.g+1)+' de '+G+' neste slide</div>'}
    else{const k=nextIdx(P.i,1);const src=k>=0&&thumbsEl.children[k]&&thumbsEl.children[k].querySelector('.slide');
      if(src){const c=src.cloneNode(true),r=box.getBoundingClientRect(),sc=Math.min(r.width/W,r.height/H)||.2;c.style.transform='scale('+sc+')';const wrap=document.createElement('div');wrap.className='pslot';wrap.style.width=W*sc+'px';wrap.style.height=H*sc+'px';wrap.appendChild(c);box.appendChild(wrap)}
      else box.innerHTML='<div style="color:#9aa4ab;font:500 14px var(--ui)">Fim da apresentação</div>'}
  }
}
function fmtClock(ms){const t=Math.max(0,Math.floor(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t/60)%60,s=t%60;return(h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(s).padStart(2,'0')}
function tickClock(){const now=new Date();$('#prClock').textContent=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  const el=(P.pauseAt?P.pauseAt:Date.now())-P.t0-P.pausedMs;$('#prTimer').textContent=fmtClock(el)}
$('#prPause').onclick=()=>{if(P.pauseAt){P.pausedMs+=Date.now()-P.pauseAt;P.pauseAt=0;$('#prPause').textContent='Pausar'}else{P.pauseAt=Date.now();$('#prPause').textContent='Continuar'}};
$('#prReset').onclick=()=>{P.t0=Date.now();P.pausedMs=0;P.pauseAt=P.pauseAt?Date.now():0;tickClock()};
$('#prPrev').onclick=pPrev;$('#prNextBtn').onclick=pNext;$('#prEnd').onclick=endPres;
$('#prGo').onchange=ev=>pGo(+ev.target.value);
$('#prFontUp').onclick=()=>{prefs.presenterFont=Math.min(40,prefs.presenterFont+2);savePrefs();$('#prNotes').style.fontSize=prefs.presenterFont+'px'};
$('#prFontDown').onclick=()=>{prefs.presenterFont=Math.max(10,prefs.presenterFont-2);savePrefs();$('#prNotes').style.fontSize=prefs.presenterFont+'px'};
$('#prBlack').onclick=()=>setBlack(!P.black);$('#prAud').onclick=()=>{if(P.aud&&!P.aud.closed)P.aud.focus();else openAudience()};
$('#prCur').addEventListener('click',ev=>{if(Date.now()-(P.noClickT||0)<350)return;if(drawingTool())return;if(!handlePresLink(ev))pNext()});
attachDraw($('#prCur'));
function openAudience(){
  let w=null;try{w=window.open('','lousaPlateia','popup=yes,width=1024,height=600')}catch(e){}
  if(!w){toast('O navegador não abriu a janela da plateia. Permita pop-ups ou use a versão local; enquanto isso, ensaie por aqui.');return}
  const doc=w.document;doc.open();doc.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Lousa TeX · Plateia</title></head><body></body></html>');doc.close();
  document.querySelectorAll('style,link[rel="stylesheet"]').forEach(n=>doc.head.appendChild(doc.importNode(n,true)));
  doc.body.style.cssText='margin:0;background:#000;overflow:hidden;height:100vh';
  const cont=doc.createElement('div');cont.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#000;cursor:default';doc.body.appendChild(cont);
  const blk=doc.createElement('div');blk.className='ablack';blk.style.cssText='position:fixed;inset:0;background:#000;z-index:5;display:none';doc.body.appendChild(blk);
  const hint=doc.createElement('div');hint.textContent='Arraste esta janela para o projetor e clique duas vezes para tela cheia';hint.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);background:rgba(255,255,255,.12);color:#fff;font:14px sans-serif;padding:8px 14px;border-radius:8px;z-index:6';
  doc.body.appendChild(hint);setTimeout(()=>hint.remove(),6000);
  P.views.forEach(x=>x.primary=false);const v=makeView(cont,doc);v.primary=true;v.win=w;P.views.push(v);P.aud=w;mountCam();
  doc.addEventListener('keydown',presKey);cont.addEventListener('click',ev=>{if(Date.now()-(P.noClickT||0)<350)return;if(drawingTool())return;if(!handlePresLink(ev))pNext()});attachDraw(cont);cont.dataset.tool=P.tool||'';
  doc.addEventListener('dblclick',()=>{const de=doc.documentElement;if(de.requestFullscreen)de.requestFullscreen().catch(()=>{})});
  doc.addEventListener('pointermove',ev=>laserMove(ev,v));
  w.addEventListener('resize',()=>{if(P.on)renderView(v,P.g,false)});
  w.addEventListener('pagehide',()=>{P.views=P.views.filter(x=>x!==v);P.aud=null;if(P.views[0]){P.views[0].primary=true;if(P.on)renderView(P.views[0],P.g,false)}});
  if(P.on&&P.views.length>1){P.views.forEach(x=>{renderView(x,P.g,false);drawAnnot(x)})}
}
function handlePresLink(ev){
  const a=ev.target.closest&&ev.target.closest('a[href]');
  if(a){const h=a.getAttribute('href');if(h.indexOf('#slide:')===0){ev.preventDefault();const i=deck.slides.findIndex(s=>s.id===h.slice(7));if(i>=0)pGo(i)}return true}
  const d=ev.target.closest&&ev.target.closest('[data-link]');
  if(d){let l;try{l=JSON.parse(d.dataset.link)}catch(e){return false}
    if(l.slide){const i=deck.slides.findIndex(s=>s.id===l.slide);if(i>=0)pGo(i)}else if(l.url){const x=document.createElement('a');x.href=l.url;x.target='_blank';x.rel='noopener';document.body.appendChild(x);x.click();x.remove()}
    return true}
  if(ev.target.closest&&ev.target.closest('video,audio,iframe,.medialink'))return true;
  return false;
}
pres.addEventListener('click',ev=>{if(ev.target.closest('#pbar,#pnotes,.annot-edit'))return;if(Date.now()-(P.noClickT||0)<350)return;if(drawingTool())return;if(P.black){setBlack(false);return}if(handlePresLink(ev))return;if(ev.clientX<innerWidth/4)pPrev();else pNext()});
attachDraw(pres);
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&P.on&&!P.presenter)endPres()});
window.addEventListener('resize',()=>{if(P.on)P.views.forEach(v=>{if(v.doc===document){renderView(v,P.g,false);drawAnnot(v)}})});
function setBlack(on){P.black=on;$('#pblack').hidden=!on||P.presenter;$('#prBlack').classList.toggle('on',on);
  if(P.aud&&!P.aud.closed){const b=P.aud.document.querySelector('.ablack');if(b)b.style.display=on?'block':'none'}}
/* ---------- presentation tools: laser, click marker, pen, highlighter, text, eraser ---------- */
const PCOLORS=['#e5322d','#f4b400','#1e88e5','#2e9e6a','#111111','#ffffff'];
const PEN_W=[3,6,11],HL_W=[16,26,40],TXT_S=[22,32,46];
const drawingTool=()=>!!P.tool&&P.tool!=='laser';
const PT=[['none','Seta normal (Esc)','<path d="M5 3l10.5 6.5-4.8 1.3L8.4 15.5z"/>'],['laser','Ponteiro laser (L)','<circle cx="10" cy="10" r="3.2" fill="currentColor"/><circle cx="10" cy="10" r="6.5"/>'],
  ['spot','Marcar onde clicar (M)','<circle cx="10" cy="10" r="2" fill="currentColor"/><circle cx="10" cy="10" r="5"/><path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3"/>'],
  ['pen','Caneta (D)','<path d="M4 16l1-4 8.2-8.2a1.8 1.8 0 012.6 2.6L7.6 14.6z"/>'],['hl','Marca-texto (H)','<path d="M6 12.5l6.5-8.5 3 2.5-6.5 8.5z"/><path d="M6 12.5l-1 3 2.6-1"/><path d="M3 18h14" stroke-width="2.6"/>'],
  ['text','Escrever texto (T)','<path d="M4.5 5V3.5h11V5M10 3.5v13M7.5 16.5h5"/>'],['zoom','Ampliar região (Z)','<circle cx="8.5" cy="8.5" r="5"/><path d="M12.3 12.3L17 17M6.5 8.5h4M8.5 6.5v4"/>'],['eraser','Borracha (X)','<path d="M8 17h9"/><path d="M3.8 12.6l7.6-7.6a1.6 1.6 0 012.3 0l2.3 2.3a1.6 1.6 0 010 2.3L10 17H8z"/><path d="M7.4 9l4.6 4.6"/>']];
function picon(p){return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
function ptoolsHTML(full){
  let h='';
  if(full)h+='<button type="button" data-pa="prev" title="Anterior" aria-label="Anterior">'+picon('<path d="M12.5 4.5L7 10l5.5 5.5"/>')+'</button><span class="pc" data-pcount></span><button type="button" data-pa="next" title="Próximo" aria-label="Próximo">'+picon('<path d="M7.5 4.5L13 10l-5.5 5.5"/>')+'</button><span class="psep"></span>';
  h+=PT.map(t=>'<button type="button" data-pt="'+t[0]+'" title="'+t[1]+'" aria-label="'+t[1]+'">'+picon(t[2])+'</button>').join('');
  h+='<span class="psep"></span>'+PCOLORS.map(c=>'<button type="button" class="pcol" data-pcol="'+c+'" title="Cor" aria-label="Cor '+c+'" style="--c:'+c+'"><i></i></button>').join('');
  h+='<button type="button" data-pa="size" title="Espessura e tamanho do texto" aria-label="Espessura"><i class="psz"></i></button>'+
    '<button type="button" data-pa="undo" title="Desfazer anotação ('+MOD+'Z)" aria-label="Desfazer anotação">'+picon('<path d="M7 5L4 8l3 3"/><path d="M4 8h8a4 4 0 010 8H9"/>')+'</button>'+
    '<button type="button" data-pa="clear" title="Apagar anotações deste slide (E)" aria-label="Apagar anotações">'+picon('<path d="M4 6h12M8 6V4h4v2M5.8 6l1 11h6.4l1-11"/>')+'</button>';
  h+='<span class="psep"></span><button type="button" data-pa="cam" title="Câmera (mostra você no canto)" aria-label="Câmera">'+picon('<rect x="2.5" y="5.5" width="11" height="9" rx="1.5"/><path d="M13.5 9l4-2.5v7l-4-2.5"/>')+'</button>'+
    '<button type="button" data-pa="rec" title="Parar a gravação" aria-label="Parar a gravação" hidden>'+picon('<circle cx="10" cy="10" r="5" fill="currentColor"/>')+'</button>';
  if(full)h+='<span class="psep"></span><button type="button" data-pa="notes" title="Anotações do apresentador (N)" aria-label="Anotações do apresentador">'+picon('<rect x="4" y="3" width="12" height="14" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/>')+'</button>'+
    (SR&&standalone?'<button type="button" data-pa="caps" title="Legendas (C)" aria-label="Legendas">CC</button>':'')+
    '<button type="button" data-pa="exit" title="Sair (Esc)" aria-label="Sair da apresentação">'+picon('<path d="M5 5l10 10M15 5L5 15"/>')+'</button>';
  return h;
}
function updatePTools(){
  $$('.ptools').forEach(b=>{
    b.querySelectorAll('[data-pt]').forEach(x=>x.classList.toggle('on',(P.tool||'none')===x.dataset.pt));
    b.querySelectorAll('[data-pcol]').forEach(x=>x.classList.toggle('on',x.dataset.pcol===P.color));
    const z=b.querySelector('.psz');if(z){const d=[6,10,15][P.sizeIdx];z.style.width=d+'px';z.style.height=d+'px'}
    const c=b.querySelector('[data-pcount]');if(c&&deck.slides[P.i])c.textContent=(P.i+1)+' / '+deck.slides.length;
    const cc=b.querySelector('[data-pa="caps"]');if(cc)cc.classList.toggle('on',!!P.rec);
    const cm=b.querySelector('[data-pa="cam"]');if(cm)cm.classList.toggle('on',!!REC.cam);
    const rc=b.querySelector('[data-pa="rec"]');if(rc){rc.hidden=!REC.rec;rc.classList.toggle('rec',!!REC.rec)}
  });
}
function setPTool(t,toggle){
  if(toggle&&t&&t===P.tool)t=null;finishTextAnnot();P.tool=t;P.laser=t==='laser';
  P.views.forEach(v=>{let l=v.container.querySelector(':scope>.laser');if(!l){l=v.doc.createElement('div');l.className='laser';v.container.appendChild(l)}l.style.display='none';
    l.style.background=P.color;l.style.boxShadow='0 0 12px 4px '+P.color;v.container.dataset.tool=t||''});
  pres.dataset.tool=t||'';pres.classList.toggle('nocursor',P.laser);updatePTools();
}
function onPTools(ev){
  const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();ev.preventDefault();
  if(b.dataset.pt){setPTool(b.dataset.pt==='none'?null:b.dataset.pt,true);return}
  if(b.dataset.pcol){P.color=b.dataset.pcol;if(!P.tool||P.tool==='eraser')setPTool('pen');else setPTool(P.tool);return}
  switch(b.dataset.pa){
    case 'prev':pPrev();break;case 'next':pNext();break;
    case 'size':P.sizeIdx=(P.sizeIdx+1)%3;updatePTools();break;
    case 'undo':undoAnnot();break;case 'clear':clearAnnot();break;
    case 'cam':toggleCamera();break;case 'rec':stopRecording();toast('Gravação encerrada. Salvando o vídeo…');break;
    case 'notes':$('#pnotes').hidden=!$('#pnotes').hidden;break;case 'caps':toggleCaptions();updatePTools();break;case 'exit':endPres();break;
  }
}
[['#pbar',true],['#prTools',false]].forEach(([s,full])=>{const el=$(s);el.innerHTML=ptoolsHTML(full);el.addEventListener('click',onPTools);el.addEventListener('pointerdown',ev=>ev.stopPropagation())});
function flashBar(){const b=$('#pbar');b.classList.add('show');clearTimeout(P.barT);P.barT=setTimeout(()=>b.classList.remove('show'),2600)}
/* annotations */
function inkFor(sid){return P.ink[sid]||(P.ink[sid]={strokes:[],texts:[]})}
function strokeD(pts){
  if(!pts.length)return '';if(pts.length===1)return 'M'+f2(pts[0][0])+' '+f2(pts[0][1])+'l0.01 0';
  let d='M'+f2(pts[0][0])+' '+f2(pts[0][1]);
  for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;d+='Q'+f2(pts[i][0])+' '+f2(pts[i][1])+' '+f2(mx)+' '+f2(my)}
  const l=pts[pts.length-1];return d+'L'+f2(l[0])+' '+f2(l[1]);
}
function viewPoint(v,ev){const sn=v.slot.querySelector(':scope>.slide')||v.slot;const r=sn.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/(r.width||1),y:(ev.clientY-r.top)*H/(r.height||1)}}
function applyZoom(animate){P.views.forEach(v=>{const sn=v.slot.querySelector(':scope>.slide');if(!sn)return;const s=v.scale;let t='scale('+s+')';
  if(P.zoom){const k=P.zoom.k;let tx=W*s/2-s*k*P.zoom.x,ty=H*s/2-s*k*P.zoom.y;tx=clamp(tx,W*s-s*k*W,0);ty=clamp(ty,H*s-s*k*H,0);t='translate('+tx+'px,'+ty+'px) scale('+(s*k)+')'}
  sn.style.transition=animate?'transform .4s cubic-bezier(.3,.7,.3,1)':'';sn.style.transform=t})}
function annotLayer(v){const sn=v.slot.querySelector('.slide');if(!sn)return null;let L=sn.querySelector(':scope>.annot');
  if(!L){L=v.doc.createElement('div');L.className='annot';L.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"></svg><div class="annot-t"></div>';sn.appendChild(L)}return L}
function drawAnnot(v){
  if(!P.on||!deck.slides[P.i])return;const L=annotLayer(v);if(!L)return;const a=P.ink[deck.slides[P.i].id]||{strokes:[],texts:[]};
  L.querySelector('svg').innerHTML=a.strokes.map(s=>'<path d="'+strokeD(s.pts)+'" fill="none" stroke="'+s.c+'" stroke-width="'+s.w+'" stroke-linecap="round" stroke-linejoin="round"'+(s.t==='hl'?' stroke-opacity=".4"':'')+'/>').join('');
  L.querySelector('.annot-t').innerHTML=a.texts.map(t=>'<div class="atext" style="left:'+f2(t.x)+'px;top:'+f2(t.y)+'px;color:'+t.c+';font-size:'+t.size+'px">'+t.html+'</div>').join('');
}
function drawAnnotAll(){P.views.forEach(drawAnnot)}
const drawAnnotSoon=rafThrottle(drawAnnotAll);
function spawnSpot(p){P.views.forEach(v=>{const sn=v.slot.querySelector('.slide');if(!sn)return;const s=v.doc.createElement('div');s.className='spot';s.style.left=p.x+'px';s.style.top=p.y+'px';
  s.style.setProperty('--c',P.color);s.style.transform='scale('+(1/Math.max(.25,Math.min(1,v.scale*1.4)))+')';sn.appendChild(s);setTimeout(()=>s.remove(),1850)})}
function eraseAt(p){
  const a=inkFor(deck.slides[P.i].id),r=14,n=a.strokes.length+a.texts.length;
  a.strokes=a.strokes.filter(s=>!s.pts.some(q=>Math.hypot(q[0]-p.x,q[1]-p.y)<r+s.w/2));
  a.texts=a.texts.filter(t=>!(p.x>=t.x-r&&p.x<=t.x+t.wd+r&&p.y>=t.y-r&&p.y<=t.y+t.ht+r));
  if(a.strokes.length+a.texts.length!==n)drawAnnotAll();
}
function undoAnnot(){const a=P.ink[deck.slides[P.i].id];if(!a)return;const ls=a.strokes[a.strokes.length-1],lt=a.texts[a.texts.length-1];
  if(ls&&(!lt||ls.t0>lt.t0))a.strokes.pop();else if(lt)a.texts.pop();drawAnnotAll()}
function clearAnnot(){delete P.ink[deck.slides[P.i].id];drawAnnotAll()}
function trailCanvas(v){let c=v.container.querySelector(':scope>.ltrail');if(!c){c=v.doc.createElement('canvas');c.className='ltrail';v.container.appendChild(c)}
  const w=v.doc.defaultView,dpr=w.devicePixelRatio||1,cw=Math.round(w.innerWidth*dpr),ch=Math.round(w.innerHeight*dpr);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch}return c}
const TRAIL_FADE=900;
function drawTrail(){
  P.trailRaf=0;const T=P.trail,now=performance.now();let alive=false;
  if(T&&deck.slides[P.i]&&T.sid!==deck.slides[P.i].id)P.trail=null;
  P.views.forEach(v=>{const c=trailCanvas(v),x=c.getContext('2d'),dpr=v.doc.defaultView.devicePixelRatio||1;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);
    const T=P.trail;if(!T||T.pts.length<2)return;const a=T.up?Math.max(0,1-(now-T.up)/TRAIL_FADE):1;if(a<=0)return;alive=true;
    const sn=v.slot.querySelector(':scope>.slide')||v.slot,rr=sn.getBoundingClientRect(),k=rr.width/W;
    x.setTransform(dpr,0,0,dpr,0,0);x.lineCap='round';x.lineJoin='round';x.beginPath();
    T.pts.forEach((p,i)=>{const X=rr.left+p[0]*k,Y=rr.top+p[1]*k;if(i)x.lineTo(X,Y);else x.moveTo(X,Y)});
    x.strokeStyle=T.c;x.shadowColor=T.c;x.shadowBlur=14;x.globalAlpha=a*.35;x.lineWidth=Math.max(6,14*k);x.stroke();
    x.shadowBlur=6;x.globalAlpha=a;x.lineWidth=Math.max(2.5,5*k);x.stroke();
    x.shadowBlur=0;x.strokeStyle='#fff';x.globalAlpha=a*.75;x.lineWidth=Math.max(1,1.6*k);x.stroke()});
  if(P.trail&&P.trail.up){if(alive)P.trailRaf=requestAnimationFrame(drawTrail);else P.trail=null}
}
const drawTrailSoon=()=>{if(!P.trailRaf)P.trailRaf=requestAnimationFrame(drawTrail)};
function attachDraw(cont){
  cont.style.userSelect='none';cont.style.webkitUserSelect='none';
  cont.addEventListener('pointerdown',ev=>{
    if(P.on&&ev.button===0&&P.tool==='laser'&&!ev.target.closest('.ptools,.annot-edit,#pnotes,button,select,a,video,audio,iframe,.medialink')){
      const v=P.views.find(x=>x.container===cont);if(!v||!v.slot.querySelector('.slide'))return;ev.preventDefault();
      try{cont.setPointerCapture(ev.pointerId)}catch(e){}const p=viewPoint(v,ev);
      P.trail={v:v,c:P.color,sid:deck.slides[P.i].id,pts:[[p.x,p.y]],moved:false};drawTrailSoon();return}
    if(!P.on||ev.button>0||!drawingTool())return;
    if(ev.target.closest('.ptools,.annot-edit,#pnotes,button,select,a,video,audio,iframe,.medialink'))return;
    const v=P.views.find(x=>x.container===cont);if(!v||!v.slot.querySelector('.slide'))return;
    const p=viewPoint(v,ev);ev.preventDefault();
    if(P.tool==='spot'){spawnSpot(p);return}
    if(P.tool==='zoom'){P.zoom=P.zoom?null:{x:p.x,y:p.y,k:2.2};applyZoom(true);return}
    if(P.tool==='text'){startTextAnnot(v,p);return}
    try{cont.setPointerCapture(ev.pointerId)}catch(e){}
    if(P.tool==='eraser'){P.cur={erase:true,v:v};eraseAt(p);return}
    const st={t:P.tool,c:P.color,w:(P.tool==='hl'?HL_W:PEN_W)[P.sizeIdx],pts:[[p.x,p.y]],t0:Date.now()};inkFor(deck.slides[P.i].id).strokes.push(st);P.cur={st:st,v:v};drawAnnotAll();
  });
  cont.addEventListener('pointermove',ev=>{const T=P.trail;if(T&&!T.up&&T.v.container===cont){const p=viewPoint(T.v,ev),l=T.pts[T.pts.length-1];if(Math.hypot(p.x-l[0],p.y-l[1])<1.5)return;T.pts.push([p.x,p.y]);
      if(!T.moved&&Math.hypot(p.x-T.pts[0][0],p.y-T.pts[0][1])>6)T.moved=true;drawTrailSoon();return}
    if(!P.cur||P.cur.v.container!==cont)return;const p=viewPoint(P.cur.v,ev);if(P.cur.erase){eraseAt(p);return}
    const pts=P.cur.st.pts,l=pts[pts.length-1];if(Math.hypot(p.x-l[0],p.y-l[1])<1.5)return;pts.push([p.x,p.y]);drawAnnotSoon()});
  const up=()=>{const T=P.trail;if(T&&!T.up&&T.v.container===cont){if(T.moved)P.noClickT=Date.now();T.up=performance.now();drawTrailSoon()}if(P.cur){P.cur=null;drawAnnotAll()}};cont.addEventListener('pointerup',up);cont.addEventListener('pointercancel',up);
}
function startTextAnnot(v,p){
  finishTextAnnot();const sn=v.slot.querySelector('.slide');const size=TXT_S[P.sizeIdx];
  const ed=v.doc.createElement('div');ed.className='annot-edit';ed.contentEditable='true';ed.spellcheck=false;ed.style.userSelect='text';ed.style.webkitUserSelect='text';
  Object.assign(ed.style,{left:p.x+'px',top:(p.y-size*.65)+'px',color:P.color,fontSize:size+'px',outlineColor:P.color,fontFamily:fontStack(deck.theme.bodyFont)});
  sn.appendChild(ed);P.edit={ed:ed,x:p.x,y:p.y-size*.65,size:size,c:P.color,sid:deck.slides[P.i].id};
  ed.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();finishTextAnnot()}else if(e.key==='Escape'){e.preventDefault();finishTextAnnot(true)}});
  ed.addEventListener('blur',()=>setTimeout(()=>{if(P.edit&&P.edit.ed===ed)finishTextAnnot()},0));
  ['pointerdown','click'].forEach(k=>ed.addEventListener(k,e=>e.stopPropagation()));
  setTimeout(()=>ed.focus(),0);
}
function finishTextAnnot(cancel){
  const E=P.edit;if(!E)return;P.edit=null;const txt=(E.ed.innerText||'').replace(/\u00a0/g,' ').replace(/\s+$/,'');const wd=E.ed.offsetWidth,ht=E.ed.offsetHeight;E.ed.remove();
  if(cancel||!txt.trim())return;
  const tmp=document.createElement('div');tmp.style.cssText='position:absolute;left:-99999px;top:0;white-space:pre;font-weight:600;line-height:1.25;font-size:'+E.size+'px;font-family:'+fontStack(deck.theme.bodyFont);
  tmp.textContent=txt;document.body.appendChild(tmp);
  const t={x:E.x+4,y:E.y,c:E.c,size:E.size,text:txt,html:esc(txt),wd:wd,ht:ht,t0:Date.now()};inkFor(E.sid).texts.push(t);drawAnnotAll();
  if(/\$|\\\(/.test(txt))typeset([tmp]).then(()=>{t.html=tmp.innerHTML;t.wd=tmp.offsetWidth;t.ht=tmp.offsetHeight;tmp.remove();drawAnnotAll()});else tmp.remove();
}
function keepInk(ink){
  let n=0;
  Object.keys(ink).forEach(sid=>{const s=deck.slides.find(x=>x.id===sid);if(!s)return;const a=ink[sid];
    if(a.strokes.length){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;a.strokes.forEach(st=>st.pts.forEach(q=>{x0=Math.min(x0,q[0]-st.w/2);y0=Math.min(y0,q[1]-st.w/2);x1=Math.max(x1,q[0]+st.w/2);y1=Math.max(y1,q[1]+st.w/2)}));
      const w=Math.max(4,x1-x0),h=Math.max(4,y1-y0);
      s.els.push(inkEl({x:Math.round(x0),y:Math.round(y0),w:Math.round(w),h:Math.round(h),vw:+w.toFixed(2),vh:+h.toFixed(2),
        strokes:a.strokes.map(st=>({c:st.c,w:st.w,op:st.t==='hl'?.4:1,d:strokeD(st.pts.map(q=>[q[0]-x0,q[1]-y0]))}))}));n++}
    a.texts.forEach(t=>{s.els.push(box({x:Math.round(t.x-6),y:Math.round(t.y-2),w:Math.round(t.wd+20),h:Math.round(t.ht+6),size:t.size,color:t.c,bold:true,pad:4,fit:'grow',
      html:t.text.split('\n').map(l=>'<div>'+(esc(l)||'<br>')+'</div>').join('')}));n++});
  });
  if(n){rerenderAll();commit();toast('Anotações salvas nos slides.')}
}
function laserMove(ev,src){
  if(!P.on)return;
  if(!P.presenter&&src.doc===document){pres.classList.remove('nocursor');clearTimeout(P.idleT);P.idleT=setTimeout(()=>{if(P.on&&!drawingTool())pres.classList.add('nocursor')},2200);if(P.laser)pres.classList.add('nocursor')}
  if(!P.laser)return;const q=viewPoint(src,ev),x=q.x,y=q.y,inside=x>=0&&y>=0&&x<=W&&y<=H;
  P.views.forEach(v=>{const l=v.container.querySelector(':scope>.laser');if(!l)return;if(!inside){l.style.display='none';return}const sn=v.slot.querySelector(':scope>.slide')||v.slot,rr=sn.getBoundingClientRect();
    l.style.display='block';l.style.left=(rr.left+x*rr.width/W)+'px';l.style.top=(rr.top+y*rr.height/H)+'px'});
}
document.addEventListener('pointermove',ev=>{if(!P.on)return;const v=P.views.find(x=>x.doc===document&&x.slot.contains(ev.target))||P.views.find(x=>x.doc===document);if(v)laserMove(ev,v)});
/* captions */
function toggleCaptions(){if(P.rec){stopCaptions();return}if(!SR){toast('Este navegador não oferece reconhecimento de voz.');return}
  const r=new SR();r.lang='pt-BR';r.continuous=true;r.interimResults=true;let finalTxt='';
  r.onresult=ev=>{let interim='';for(let i=ev.resultIndex;i<ev.results.length;i++){const t=ev.results[i][0].transcript;if(ev.results[i].isFinal)finalTxt=t;else interim+=t}setCaps(interim||finalTxt)};
  r.onerror=e=>{toast(e.error==='not-allowed'?'Sem permissão para usar o microfone aqui.':'Legendas interrompidas ('+e.error+').');stopCaptions()};
  r.onend=()=>{if(P.rec===r&&P.on){try{r.start()}catch(e){}}};
  try{r.start();P.rec=r;updatePTools()}catch(e){toast('Não foi possível iniciar as legendas.')}}
function stopCaptions(){if(P.rec){const r=P.rec;P.rec=null;try{r.stop()}catch(e){}}updatePTools();setCaps('')}
function setCaps(t){const c=$('#pcaps');c.hidden=!t;c.textContent=t;
  if(P.aud&&!P.aud.closed){const d=P.aud.document;let x=d.querySelector('.acaps');if(!x){x=d.createElement('div');x.className='acaps';x.id='pcaps';d.body.appendChild(x)}x.textContent=t;x.hidden=!t}}
/* keys */
function presKey(ev){
  if(ev.target&&ev.target.closest&&ev.target.closest('.annot-edit,select'))return;
  const k=ev.key,lk=k.toLowerCase();
  if((ev.ctrlKey||ev.metaKey)&&lk==='z'){ev.preventDefault();undoAnnot();return}
  if(ev.ctrlKey||ev.metaKey||ev.altKey)return;
  if(k==='Escape'&&P.zoom){ev.preventDefault();P.zoom=null;applyZoom(true);return}
  if(k==='Escape'&&P.tool){ev.preventDefault();setPTool(null);return}
  const tk={l:'laser',m:'spot',d:'pen',h:'hl',t:'text',x:'eraser',z:'zoom'}[lk];if(tk){ev.preventDefault();setPTool(tk,true);return}
  if(lk==='e'){ev.preventDefault();clearAnnot();return}
  if(/^[0-9]$/.test(k)){P.typed+=k;const g=$('#pgoto');g.hidden=false;g.textContent=P.typed;clearTimeout(P.typedT);P.typedT=setTimeout(()=>{P.typed='';g.hidden=true},2000);return}
  if(k==='Enter'&&P.typed){ev.preventDefault();const n=parseInt(P.typed,10)-1;P.typed='';$('#pgoto').hidden=true;pGo(n);return}
  if(['ArrowRight','ArrowDown','PageDown',' ','Enter','n'].includes(k)&&!(k==='n'&&!P.presenter)){ev.preventDefault();pNext()}
  else if(['ArrowLeft','ArrowUp','PageUp','Backspace','p'].includes(k)){ev.preventDefault();pPrev()}
  else if(k==='Home'){pGo(nextIdx(-1,1))}else if(k==='End'){const k2=deck.slides.length-1;showSlide(deck.slides[k2].skip?nextIdx(k2,-1):k2,'all',true)}
  else if(k==='Escape'){endPres()}
  else if(k==='b'||k==='B'||k==='.'){setBlack(!P.black)}
  else if((k==='N')||(k==='n'&&!P.presenter)){$('#pnotes').hidden=!$('#pnotes').hidden}
  else if(k==='c'||k==='C'){toggleCaptions()}
}
