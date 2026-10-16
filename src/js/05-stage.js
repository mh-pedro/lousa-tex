/* ================= stage ================= */
const GHANDLES=['nw','n','ne','e','se','s','sw','w'].map(k=>'<div class="h '+k+'" data-g="'+k+'"></div>').join('');
function renderStage(){
  if(editId)exitEdit(true);if(cropId)exitCrop(true);
  frame.innerHTML='';
  const s=slide(),n=renderSlideNode(s,masterMode?-1:cur,'edit');frame.appendChild(n);stageNode=n;
  overlay=document.createElement('div');overlay.id='overlay';overlay.style.width=W+'px';overlay.style.height=H+'px';
  overlay.innerHTML='<div class="gridbg"></div><div class="ugs"></div><div class="guide v"></div><div class="guide h2"></div><div class="cdots"></div><div class="cbs"></div>'+
    '<div class="gbox" hidden>'+GHANDLES+'</div><div class="mq" hidden></div><svg class="drawline" width="'+W+'" height="'+H+'" hidden><path stroke="#2a6dd4" stroke-width="2" stroke-dasharray="6 5" fill="none"/></svg>';
  frame.appendChild(overlay);
  cellSel=null;selIds=selIds.filter(id=>byId(id));
  fit();markSel();drawGrid();drawGuides();
  typeset([n]).then(()=>{if(stageNode===n){fitNode(n,s,true);drawOverlay()}});
  const nt=$('#notes');nt.disabled=masterMode;if(document.activeElement!==nt)nt.value=masterMode?'':(s.notes||'');
  $('#masterBar').hidden=!masterMode;
}
function fit(){
  const r=stageWrap.getBoundingClientRect();if(!r.width)return;
  if(zoom==='fit'){const pad=r.width<560?24:64;scale=Math.max(.05,Math.min((r.width-pad)/W,(r.height-pad)/H))}else scale=zoom;
  frame.style.width=W*scale+'px';frame.style.height=H*scale+'px';frame.style.setProperty('--inv',1/scale);
  if(stageNode)stageNode.style.transform='scale('+scale+')';if(overlay)overlay.style.transform='scale('+scale+')';
  stageWrap.classList.toggle('zoomed',zoom!=='fit');
  updatePasteboard();
  if(editId)positionPreview();
  rulersSoon();
}
/* área além do slide (pasteboard) */
const stageInner=$('#stageInner');
function contentExtents(){const ex={l:0,t:0,r:0,b:0};if(!prefs.pasteboard||P.on)return ex;
  slide().els.forEach(e=>{const q=bb(e),rad=(e.rot||0)*Math.PI/180,c=Math.abs(Math.cos(rad)),s=Math.abs(Math.sin(rad)),w=q.w*c+q.h*s,h=q.w*s+q.h*c,x=q.x+q.w/2-w/2,y=q.y+q.h/2-h/2;
    ex.l=Math.max(ex.l,-x);ex.t=Math.max(ex.t,-y);ex.r=Math.max(ex.r,x+w-W);ex.b=Math.max(ex.b,y+h-H)});return ex}
function updatePasteboard(){
  document.body.classList.toggle('pb',!!prefs.pasteboard);
  const ex=contentExtents(),px=Math.round(28+(Math.max(ex.l,ex.r)?Math.max(ex.l,ex.r)*scale+24:0)),py=Math.round(28+(Math.max(ex.t,ex.b)?Math.max(ex.t,ex.b)*scale+24:0));
  const pad=py+'px '+px+'px';if(stageInner.style.padding===pad)return;
  const r0=frame.getBoundingClientRect();stageInner.style.padding=pad;const r1=frame.getBoundingClientRect();
  stageWrap.scrollLeft+=r1.left-r0.left;stageWrap.scrollTop+=r1.top-r0.top;
}
const pasteboardSoon=(()=>{let t=0;return()=>{clearTimeout(t);t=setTimeout(()=>{if(!drag)updatePasteboard()},60)}})();
function centerStage(){stageWrap.scrollLeft=(stageWrap.scrollWidth-stageWrap.clientWidth)/2;stageWrap.scrollTop=(stageWrap.scrollHeight-stageWrap.clientHeight)/2}
/* aparência do programa */
const UI_THEMES={auto:'Automático (do sistema)',sage:'Padrão (sálvia)',light:'Claro',gray:'Cinza',sepia:'Sépia',dark:'Noturno',navy:'Azul noturno',black:'Preto (alto contraste)'};
const STAGE_BGS={'':'Do tema',white:'Branco',light:'Cinza claro',mid:'Cinza médio',dark:'Grafite',black:'Preto'};
const STAGE_BG_COL={white:'#ffffff',light:'#e3e6e9',mid:'#a3a9b0',dark:'#3a3f44',black:'#000000'};
function applyUiTheme(){const r=document.documentElement;if(!prefs.uiTheme||prefs.uiTheme==='auto')r.removeAttribute('data-theme');else r.dataset.theme=prefs.uiTheme;
  if(prefs.stageBg&&STAGE_BG_COL[prefs.stageBg])r.style.setProperty('--stage',STAGE_BG_COL[prefs.stageBg]);else r.style.removeProperty('--stage')}
function setUiTheme(t){prefs.uiTheme=t;savePrefs();applyUiTheme();drawRulers&&drawRulers();thumbSoon()}
function setStageBg(t){prefs.stageBg=t;savePrefs();applyUiTheme()}
applyUiTheme();
new ResizeObserver(()=>{fit();if(gridView)renderGridView()}).observe(stageWrap);
function setZoom(z){zoom=z;fit();renderToolbar()}

/* ---------- selection display ---------- */
function select(ids,quiet){
  if(editId&&!ids.includes(editId))exitEdit();
  if(cropId&&!ids.includes(cropId))exitCrop(true);
  const same=ids.length===selIds.length&&ids.every(i=>selIds.includes(i));
  selIds=ids.slice();if(!same)cellSel=null;
  markSel();
  if(!quiet){renderToolbar();if(sideMode==='format'||sideMode==='anim'||sideMode==='comments')renderSide()}
}
function markSel(){
  if(!stageNode)return;const one=selIds.length===1,many=selIds.length>1;
  stageNode.querySelectorAll('.el[data-id]').forEach(d=>{const id=d.dataset.id,s=selIds.includes(id);
    d.classList.toggle('sel',s);d.classList.toggle('single',s&&one);d.classList.toggle('multi',s&&many);d.classList.toggle('editing',id===editId);d.classList.toggle('cropping',id===cropId)});
  markCells();setAnimBadges();drawOverlay();
}
function markCells(){
  if(!stageNode)return;stageNode.querySelectorAll('td.csel').forEach(td=>td.classList.remove('csel'));
  const e=selEls()[0];if(!e||e.type!=='table'||!cellSel||selIds.length!==1)return;const d=elDom(e);if(!d)return;
  const R=selRange(e);if(R.r0===R.r1&&R.c0===R.c1&&editCell)return;
  for(let r=R.r0;r<=R.r1;r++)for(let c=R.c0;c<=R.c1;c++){const td=d.querySelector('td[data-r="'+r+'"][data-c="'+c+'"]');if(td)td.classList.add('csel')}
}
function unionBB(els){const bs=els.map(bb);const x=Math.min(...bs.map(b=>b.x)),y=Math.min(...bs.map(b=>b.y));return{x:x,y:y,w:Math.max(...bs.map(b=>b.x+b.w))-x,h:Math.max(...bs.map(b=>b.y+b.h))-y}}
function bb(e){if(e.type==='line')return{x:Math.min(e.x1,e.x2),y:Math.min(e.y1,e.y2),w:Math.abs(e.x2-e.x1),h:Math.abs(e.y2-e.y1)};return{x:e.x,y:e.y,w:e.w,h:e.h}}
function drawOverlay(){
  if(!overlay)return;
  const gb=overlay.querySelector('.gbox'),els=selEls();
  if(els.length>1){const b=unionBB(els);gb.hidden=false;Object.assign(gb.style,{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'});gb.classList.toggle('nohandles',els.some(e=>e.locked)||!!editId)}
  else gb.hidden=true;
  drawCommentBadges();rulersSoon();
}
const overlaySoon=rafThrottle(drawOverlay);
function setAnimBadges(){
  if(!stageNode)return;frame.classList.toggle('show-anim',sideMode==='anim');
  const order=masterMode?[]:animOrder(slide());
  stageNode.querySelectorAll('.el[data-id]').forEach(d=>{const k=order.findIndex(e=>e.id===d.dataset.id);if(k>=0)d.dataset.anim=k+1;else delete d.dataset.anim});
}
function animOrder(s){return s.els.map((e,i)=>({e:e,i:i})).filter(o=>o.e.anim).sort((a,b)=>((a.e.anim.order||0)-(b.e.anim.order||0))||(a.i-b.i)).map(o=>o.e)}

/* ---------- grid, guides, comment badges, connection dots ---------- */
function drawGrid(){
  if(!overlay)return;const g=overlay.querySelector('.gridbg'),s=prefs.gridSize;g.hidden=!prefs.showGrid;
  g.style.backgroundImage='linear-gradient(to right, rgba(42,109,212,.22) calc(1px * var(--inv)), transparent 0),linear-gradient(to bottom, rgba(42,109,212,.22) calc(1px * var(--inv)), transparent 0)';
  g.style.backgroundSize=s+'px '+s+'px';
}
function drawGuides(){
  if(!overlay)return;const u=overlay.querySelector('.ugs');u.hidden=!prefs.showGuides;
  u.innerHTML=deck.guides.v.map((x,i)=>'<div class="ug v" data-axis="v" data-i="'+i+'" style="left:'+x+'px" title="Arraste para mover; arraste para fora para remover"></div>').join('')+
    deck.guides.h.map((y,i)=>'<div class="ug h" data-axis="h" data-i="'+i+'" style="top:'+y+'px" title="Arraste para mover; arraste para fora para remover"></div>').join('');
}
function drawCommentBadges(){
  if(!overlay)return;const c=overlay.querySelector('.cbs');if(masterMode){c.innerHTML='';return}
  const sid=slide().id,open=deck.comments.filter(k=>k.slideId===sid&&!k.resolved),groups={};
  open.forEach(k=>{const key=k.elId&&byId(k.elId)?k.elId:'_slide';(groups[key]=groups[key]||[]).push(k)});
  c.innerHTML=Object.keys(groups).map(key=>{let x=W-16,y=26;if(key!=='_slide'){const b=bb(byId(key));x=b.x+b.w;y=b.y}
    return '<div class="cbadge" data-el="'+key+'" style="left:'+x+'px;top:'+y+'px" title="Comentários">'+groups[key].length+'</div>'}).join('');
}
function showConnDots(target,side){
  if(!overlay)return;const c=overlay.querySelector('.cdots');
  if(!target){c.innerHTML='';return}
  c.innerHTML=['n','e','s','w'].map(sd=>{const p=connPoint(target,sd);return '<div class="cdot'+(sd===side?' on':'')+'" style="left:'+p[0]+'px;top:'+p[1]+'px"></div>'}).join('');
}

/* ---------- rulers ---------- */
const rulerH=$('#rulerH'),rulerV=$('#rulerV');
function drawRulers(){
  stageArea.classList.toggle('rulers',!!prefs.showRulers);
  if(!prefs.showRulers||!stageNode)return;
  const fr=frame.getBoundingClientRect(),cs=getComputedStyle(document.documentElement);
  const ink=cs.getPropertyValue('--muted').trim()||'#666',soft=cs.getPropertyValue('--sel-soft').trim()||'rgba(42,109,212,.12)',edge=cs.getPropertyValue('--line').trim()||'#ccc';
  const unitPx=prefs.unit==='cm'?37.7953:1;
  const steps=prefs.unit==='cm'?[.1,.25,.5,1,2,5,10,20]:[1,2,5,10,20,25,50,100,200,500,1000];
  const minor=steps.find(st=>st*unitPx*scale>=7)||steps[steps.length-1];
  const ratio=[2,4,5,10,20,40,50,100].find(k=>minor*k*unitPx*scale>=46)||100;
  const els=selEls(),sb=els.length?unionBB(els):null;
  [[rulerH,'h'],[rulerV,'v']].forEach(([cv,o])=>{
    const r=cv.getBoundingClientRect(),dpr=window.devicePixelRatio||1,Wc=Math.round(r.width*dpr),Hc=Math.round(r.height*dpr);
    if(!Wc||!Hc)return;if(cv.width!==Wc)cv.width=Wc;if(cv.height!==Hc)cv.height=Hc;
    const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,r.width,r.height);
    const origin=o==='h'?fr.left-r.left:fr.top-r.top,len=o==='h'?r.width:r.height,total=o==='h'?W:H;
    ctx.fillStyle=edge;const a0=origin,a1=origin+total*scale;
    if(o==='h'){ctx.fillRect(0,0,Math.max(0,a0),20);ctx.fillRect(a1,0,Math.max(0,len-a1),20)}else{ctx.fillRect(0,0,20,Math.max(0,a0));ctx.fillRect(0,a1,20,Math.max(0,len-a1))}
    if(sb){ctx.fillStyle=soft;const a=origin+(o==='h'?sb.x:sb.y)*scale,L=(o==='h'?sb.w:sb.h)*scale;if(o==='h')ctx.fillRect(a,0,L,20);else ctx.fillRect(0,a,20,L)}
    ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=1;ctx.font='10px "IBM Plex Sans", sans-serif';ctx.beginPath();
    const k0=Math.floor((-origin/scale)/unitPx/minor),k1=Math.ceil(((len-origin)/scale)/unitPx/minor);
    for(let k=k0;k<=k1;k++){const u=k*minor,p=Math.round(origin+u*unitPx*scale)+.5,maj=k%ratio===0,tl=maj?9:(k%(ratio/2)===0&&ratio%2===0?6:4);
      if(o==='h'){ctx.moveTo(p,20);ctx.lineTo(p,20-tl)}else{ctx.moveTo(20,p);ctx.lineTo(20-tl,p)}
      if(maj){const lab=prefs.unit==='cm'?String(+u.toFixed(2)).replace('.',','):String(Math.round(u));
        if(o==='h')ctx.fillText(lab,p+3,10);else{ctx.save();ctx.translate(10,p-3);ctx.rotate(-Math.PI/2);ctx.fillText(lab,0,0);ctx.restore()}}}
    ctx.stroke();
  });
}
const rulersSoon=rafThrottle(drawRulers);
stageWrap.addEventListener('scroll',()=>{rulersSoon();if(editId)positionPreview()});

/* ---------- thumbnails ---------- */
const EYE_OFF='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l14 14"/><path d="M8.2 5.3A8 8 0 0 1 18 10a9 9 0 0 1-2.4 3.1M5.2 6.6A9 9 0 0 0 2 10s3 5 8 5a7 7 0 0 0 3-.7"/></svg>';
function rebuildThumbs(){
  thumbSoon.cancel();thumbsEl.innerHTML='';const nodes=[];
  deck.slides.forEach((s,i)=>{
    const b=document.createElement('button');b.type='button';b.draggable=true;b.dataset.i=i;
    b.className='thumb'+(i===cur&&!masterMode?' active':'')+(slideSel.has(s.id)?' msel':'')+(s.skip?' skipped':'');
    const nc=deck.comments.filter(c=>c.slideId===s.id&&!c.resolved).length;
    b.setAttribute('aria-label','Slide '+(i+1)+(s.skip?' (ignorado)':''));
    b.innerHTML='<span class="num">'+(i+1)+(s.skip?EYE_OFF:'')+(nc?'<span title="Comentários" style="width:8px;height:8px;border-radius:50%;background:var(--note);display:block"></span>':'')+'</span><div class="tframe"></div>';
    const n=renderSlideNode(s,i,'view');b.querySelector('.tframe').appendChild(n);nodes.push([n,s]);
    thumbsEl.appendChild(b);
  });
  typeset(nodes.map(x=>x[0])).then(()=>nodes.forEach(([n,s])=>fitNode(n,s,false)));
  if(gridView)renderGridView();
}
function markThumbs(){Array.from(thumbsEl.children).forEach((b,j)=>{const s=deck.slides[j];if(!s)return;b.classList.toggle('active',j===cur&&!masterMode);b.classList.toggle('msel',slideSel.has(s.id))})}
function updateThumb(i){
  if(editId||masterMode)return;const b=thumbsEl.children[i];if(!b||!stageNode)return;const f=b.querySelector('.tframe');f.innerHTML='';f.appendChild(cleanClone(stageNode));
  if(gridView)renderGridView();
}
function cleanClone(n){const c=n.cloneNode(true);c.querySelectorAll('.h,.crz,.rrz,.ghost').forEach(x=>x.remove());
  c.querySelectorAll('.sel,.single,.multi,.editing,.ph,.newempty,.cropping,.csel').forEach(x=>x.classList.remove('sel','single','multi','editing','ph','newempty','cropping','csel'));
  c.querySelectorAll('[contenteditable]').forEach(x=>x.removeAttribute('contenteditable'));c.querySelectorAll('[data-anim]').forEach(x=>x.removeAttribute('data-anim'));
  slide().els.forEach(e=>{if(e.link){const d=c.querySelector('[data-id="'+e.id+'"]');if(d)d.dataset.link=JSON.stringify(e.link)}});
  c.style.transform='';return c}
const thumbSoon=debounce(()=>{if(masterMode)rebuildThumbsSoon();else updateThumb(cur)},260);
const rebuildThumbsSoon=debounce(rebuildThumbs,400);
function syncSlideSel(){const ids=new Set(deck.slides.map(s=>s.id));Array.from(slideSel).forEach(id=>{if(!ids.has(id))slideSel.delete(id)});if(deck.slides[cur])slideSel.add(deck.slides[cur].id)}
function goto(i,keepSel){
  if(editId)exitEdit();if(cropId)exitCrop();thumbSoon.flush();
  if(masterMode){masterMode=false;rebuildThumbs()}
  cur=clamp(i,0,deck.slides.length-1);if(!keepSel)slideSel.clear();slideSel.add(deck.slides[cur].id);
  selIds=[];setTool(null,true);renderStage();markThumbs();
  const t=thumbsEl.children[cur];if(t)t.scrollIntoView({block:'nearest',inline:'nearest'});
  renderToolbar();renderSide();
}
function rerenderAll(){renderStage();rebuildThumbs()}
const rerenderSoon=debounce(rerenderAll,200);

/* thumbnails interaction */
let dragSlides=null,dropAt=null;
thumbsEl.addEventListener('click',ev=>{
  const b=ev.target.closest('.thumb');if(!b)return;const i=+b.dataset.i,s=deck.slides[i];if(!s)return;
  if(ev.shiftKey){const a=Math.min(cur,i),z=Math.max(cur,i);slideSel.clear();for(let k=a;k<=z;k++)slideSel.add(deck.slides[k].id);markThumbs();return}
  if(ev.ctrlKey||ev.metaKey){
    if(slideSel.has(s.id)&&slideSel.size>1){slideSel.delete(s.id);if(i===cur){const f=deck.slides.findIndex(x=>slideSel.has(x.id));goto(f,true)}else markThumbs()}
    else{slideSel.add(s.id);goto(i,true)}
    return;
  }
  goto(i);
});
thumbsEl.addEventListener('contextmenu',ev=>{const b=ev.target.closest('.thumb');if(!b)return;ev.preventDefault();const i=+b.dataset.i;
  if(!slideSel.has(deck.slides[i].id))goto(i);else if(i!==cur)goto(i,true);openMenu(slideCtxItems(),{x:ev.clientX,y:ev.clientY})});
thumbsEl.addEventListener('dragstart',ev=>{const b=ev.target.closest('.thumb');if(!b)return;const s=deck.slides[+b.dataset.i];
  if(!slideSel.has(s.id)){slideSel.clear();slideSel.add(s.id);markThumbs()}
  dragSlides=deck.slides.filter(x=>slideSel.has(x.id)).map(x=>x.id);ev.dataTransfer.effectAllowed='move';try{ev.dataTransfer.setData('text/plain','slides')}catch(e){}});
thumbsEl.addEventListener('dragover',ev=>{if(!dragSlides)return;const b=ev.target.closest('.thumb');if(!b)return;ev.preventDefault();
  const r=b.getBoundingClientRect(),row=getComputedStyle(thumbsEl).flexDirection==='row',after=row?ev.clientX>r.left+r.width/2:ev.clientY>r.top+r.height/2;
  thumbsEl.querySelectorAll('.drop-before,.drop-after').forEach(x=>x.classList.remove('drop-before','drop-after'));
  b.classList.add(after?'drop-after':'drop-before');dropAt=+b.dataset.i+(after?1:0)});
thumbsEl.addEventListener('drop',ev=>{if(!dragSlides)return;ev.preventDefault();const ids=dragSlides;dragSlides=null;if(dropAt!=null)moveSlidesTo(ids,dropAt)});
thumbsEl.addEventListener('dragend',()=>{dragSlides=null;dropAt=null;thumbsEl.querySelectorAll('.drop-before,.drop-after').forEach(x=>x.classList.remove('drop-before','drop-after'))});

/* ---------- grid view ---------- */
const gridEl=$('#gridView');
function renderGridView(){
  if(!gridView)return;gridEl.innerHTML='';
  deck.slides.forEach((s,i)=>{const src=thumbsEl.children[i]&&thumbsEl.children[i].querySelector('.slide');
    const b=document.createElement('button');b.type='button';b.className='gtile'+(i===cur?' active':'');b.dataset.i=i;
    b.innerHTML='<div class="tframe"></div><span>'+(i+1)+(s.skip?' · ignorado':'')+'</span>';if(src)b.querySelector('.tframe').appendChild(src.cloneNode(true));gridEl.appendChild(b)});
}
function toggleGridView(on){gridView=on==null?!gridView:on;gridEl.hidden=!gridView;if(gridView)renderGridView()}
gridEl.addEventListener('click',ev=>{const b=ev.target.closest('.gtile');if(!b)return;toggleGridView(false);goto(+b.dataset.i)});

/* ---------- master ---------- */
function enterMaster(){if(editId)exitEdit();thumbSoon.flush();masterMode=true;selIds=[];renderStage();markThumbs();renderToolbar();renderSide();toast('Os elementos do mestre aparecem atrás do conteúdo de todos os slides.')}
function exitMaster(){if(!masterMode)return;if(editId)exitEdit();masterMode=false;selIds=[];renderStage();rebuildThumbs();renderToolbar();renderSide()}
$('#masterClose').onclick=exitMaster;
