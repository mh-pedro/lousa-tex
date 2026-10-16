/* ================= tools ================= */
function setTool(t,quiet){tool=t;stageWrap.classList.toggle('drawing',!!t);if(!quiet)updateToolbarState()}
function toSlide(ev){const r=frame.getBoundingClientRect();return{x:(ev.clientX-r.left)/scale,y:(ev.clientY-r.top)/scale}}

/* ================= snapping ================= */
const gvEl=()=>overlay.querySelector('.guide.v'),ghEl=()=>overlay.querySelector('.guide.h2');
function hideGuides(){if(overlay){gvEl().style.display='none';ghEl().style.display='none'}}
function snapMove(ids,b,nx,ny){
  if(prefs.snapGrid){const g=prefs.gridSize;nx=Math.round(nx/g)*g;ny=Math.round(ny/g)*g;hideGuides();return[nx,ny]}
  if(!prefs.snapObjects){hideGuides();return[nx,ny]}
  const th=6/scale,xs=[0,W/2,W].concat(prefs.showGuides?deck.guides.v:[]),ys=[0,H/2,H].concat(prefs.showGuides?deck.guides.h:[]);
  slide().els.forEach(o=>{if(ids.includes(o.id))return;const q=bb(o);xs.push(q.x,q.x+q.w/2,q.x+q.w);ys.push(q.y,q.y+q.h/2,q.y+q.h)});
  const best=(pos,size,ts)=>{let r=null;[0,size/2,size].forEach(off=>ts.forEach(t=>{const d=t-(pos+off);if(Math.abs(d)<th&&(!r||Math.abs(d)<Math.abs(r.d)))r={d:d,t:t}}));return r};
  const bx=best(nx,b.w,xs),by=best(ny,b.h,ys);
  gvEl().style.display=bx?'block':'none';ghEl().style.display=by?'block':'none';
  if(bx){gvEl().style.left=bx.t+'px';nx+=bx.d}if(by){ghEl().style.top=by.t+'px';ny+=by.d}
  return[nx,ny];
}
function nearEdge(d,ev){const r=d.getBoundingClientRect(),m=7;return ev.clientX-r.left<m||r.right-ev.clientX<m||ev.clientY-r.top<m||r.bottom-ev.clientY<m}
function rectFrom(a,b){return{x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(b.x-a.x),h:Math.abs(b.y-a.y)}}
function snapAngle(a,b){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ang=Math.round(Math.atan2(dy,dx)/(Math.PI/12))*(Math.PI/12);return{x:a.x+L*Math.cos(ang),y:a.y+L*Math.sin(ang)}}

/* ================= pan: espaço + arrastar ou botão do meio ================= */
let spaceDown=false;
document.addEventListener('keydown',ev=>{if(ev.key===' '&&!P.on&&!editId&&!isTyping(ev.target)&&modal.hidden&&(ev.target===document.body||(ev.target.closest&&ev.target.closest('#stageArea')))){if(!spaceDown){spaceDown=true;stageWrap.classList.add('panready')}ev.preventDefault()}},true);
document.addEventListener('keyup',ev=>{if(ev.key===' '){spaceDown=false;stageWrap.classList.remove('panready')}});
window.addEventListener('blur',()=>{spaceDown=false;stageWrap.classList.remove('panready')});
stageWrap.addEventListener('pointerdown',ev=>{if(!(ev.button===1||(ev.button===0&&spaceDown)))return;ev.preventDefault();ev.stopImmediatePropagation();
  drag={mode:'pan',sx:ev.clientX,sy:ev.clientY,sl:stageWrap.scrollLeft,st:stageWrap.scrollTop,moved:false};stageWrap.classList.add('panning');capture(ev)},true);
stageWrap.addEventListener('auxclick',ev=>{if(ev.button===1)ev.preventDefault()});
/* ================= pointer down ================= */
let lpTimer=null,lastPD=null;
function capture(ev,el){try{(el||stageWrap).setPointerCapture(ev.pointerId)}catch(e){}ev.preventDefault()}
stageWrap.addEventListener('pointerdown',ev=>{
  if(ev.button!==0)return;closePop();
  const now=Date.now(),dbl=lastPD&&now-lastPD.t<450&&Math.hypot(ev.clientX-lastPD.x,ev.clientY-lastPD.y)<6;lastPD={t:now,x:ev.clientX,y:ev.clientY};
  if(dbl){const dd=ev.target.closest('.el[data-id]');if(!(dd&&editId===dd.dataset.id&&ev.target.closest('.tx[contenteditable]'))&&frame.contains(ev.target)&&!ev.target.closest('.h,.ug,.cbadge,.crz,.rrz')){lastPD=null;ev.preventDefault();handleDbl(ev);return}}
  if(ev.pointerType==='touch'){clearTimeout(lpTimer);const x=ev.clientX,y=ev.clientY,tg=ev.target;lpTimer=setTimeout(()=>{if(!drag||!drag.moved){drag=null;stageContext({clientX:x,clientY:y,target:tg,preventDefault(){}})}},560)}
  const t=ev.target;
  if(t.closest('.cbadge')){openSide('comments');return}
  const ug=t.closest('.ug');if(ug){drag={mode:'guide',axis:ug.dataset.axis,i:+ug.dataset.i,moved:false};capture(ev);return}
  const ae=document.activeElement;
  const d=t.closest('.el[data-id]');const inFrame=d&&frame.contains(d);
  const e=inFrame?byId(d.dataset.id):null;
  if(e&&editId===e.id){
    if(t.closest('.tx[contenteditable]'))return;
    if(e.type==='table'&&!t.closest('.h,.crz,.rrz')){const c=cellAtPoint(e,ev.clientX,ev.clientY);if(c){ev.preventDefault();
      if(ev.shiftKey&&editCell){const a0=editCell;exitEdit();cellSel={r0:a0.r,c0:a0.c,r1:c.r,c1:c.c};markCells();renderToolbar();return}
      exitEdit();enterEdit(e,{x:ev.clientX,y:ev.clientY},c);return}}
    if(!t.closest('.h,.crz,.rrz')&&!nearEdge(d,ev)&&e.type==='box'){ev.preventDefault();const tx=d.querySelector('.tx');tx.focus();const r=placeEnd(tx),s=getSelection();s.removeAllRanges();s.addRange(r);return}
  }
  if(ae&&ae!==document.body&&!(editId&&ae.closest&&ae.closest('.tx')))ae.blur();
  const p=toSlide(ev);
  const gh=t.closest('.gbox .h');if(gh){startGroupResize(ev,gh.dataset.g);return}
  if(painter){if(e){applyPainter(e)}else stopPainter();ev.preventDefault();return}
  if(tool){startDraw(ev,p);return}
  if(e){
    const rz=t.closest('.crz,.rrz');if(rz&&e.type==='table'&&!e.locked){if(editId)exitEdit();startTableResize(ev,e,d,rz);return}
    const h=t.closest('.h');
    if(h&&!e.locked){if(editId&&editId!==e.id)exitEdit();startHandle(ev,e,d,h.dataset.dir,p);return}
    if(cropId===e.id){drag={mode:'croppan',e:e,sx:ev.clientX,sy:ev.clientY,c0:Object.assign({},e.crop),moved:false};capture(ev);return}
    if(cropId)exitCrop();
    const id=e.id,members=groupMembers(id),was=selIds.includes(id),wasOnly=was&&selIds.length===1;
    const groupWhole=e.group&&members.length>1&&members.every(m=>selIds.includes(m))&&selIds.length===members.length;
    const dupKey=(ev.ctrlKey||ev.metaKey)&&!ev.shiftKey;
    if(dupKey){if(!was)select(Array.from(new Set(selIds.concat(members))));if(e.locked){ev.preventDefault();return}startMove(ev,p,id,false,false);drag.dup=true;drag.toggleOff=was?members:null;return}
    if(ev.shiftKey){
      if(e.type==='table'&&wasOnly&&ev.shiftKey){const c=cellAtPoint(e,ev.clientX,ev.clientY);if(c){if(!cellSel)cellSel={r0:c.r,c0:c.c,r1:c.r,c1:c.c};else{cellSel.r1=c.r;cellSel.c1=c.c}markCells();renderToolbar();ev.preventDefault();return}}
      const add=!was;select(add?Array.from(new Set(selIds.concat(members))):selIds.filter(x=>!members.includes(x)));if(!add)return;
    }else if(e.type==='table'&&wasOnly&&!nearEdge(d,ev)){
      const c=cellAtPoint(e,ev.clientX,ev.clientY);if(c){cellSel={r0:c.r,c0:c.c,r1:c.r,c1:c.c};markCells();renderToolbar();drag={mode:'cells',e:e,start:c,sx:ev.clientX,sy:ev.clientY,moved:false};capture(ev);return}
    }else if(!was)select(members);
    else if(editId)exitEdit();
    if(e.locked){ev.preventDefault();return}
    startMove(ev,p,id,wasOnly,groupWhole);return;
  }
  if(cropId)exitCrop();
  if(!ev.shiftKey)select([]);
  startMarquee(ev,p);
});
function dupForDrag(g){
  const src=g.items.map(i=>i.e);if(!src.length)return;const copies=cloneSet(src,0),s=slide(),slnum=stageNode.querySelector('.slnum');
  copies.forEach(c=>{s.els.push(c);const d=makeEl(c,true);stageNode.insertBefore(d,slnum);typeset([d]).then(()=>{fitEl(c,d,true);thumbSoon()})});
  g.items=copies.map(c=>({e:c,o:c.type==='line'?{x1:c.x1,y1:c.y1,x2:c.x2,y2:c.y2}:{x:c.x,y:c.y}}));g.id=copies[0].id;selIds=copies.map(c=>c.id);markSel();overlaySoon();
}
function startMove(ev,p,id,wasOnly,groupWhole){
  const els=selEls().filter(e=>!e.locked);
  drag={mode:'move',sx:ev.clientX,sy:ev.clientY,id:id,wasOnly:wasOnly,groupWhole:groupWhole,moved:false,
    items:els.map(e=>({e:e,o:e.type==='line'?{x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2}:{x:e.x,y:e.y}})),bb0:els.length?unionBB(els):{x:0,y:0,w:0,h:0}};
  capture(ev);
}
function startHandle(ev,e,d,dir){
  if(dir==='rot')drag={mode:'rot',e:e,d:d,cx:e.x+e.w/2,cy:e.y+e.h/2,moved:false};
  else if(dir==='p1'||dir==='p2')drag={mode:'pt',e:e,d:d,which:dir,moved:false,att:null};
  else drag={mode:'resize',e:e,d:d,dir:dir,sx:ev.clientX,sy:ev.clientY,o:{x:e.x,y:e.y,w:e.w,h:e.h},c0:e.type==='image'?Object.assign({},e.crop):null,crop:cropId===e.id,
    rowH0:e.type==='table'?e.rowH.slice():null,moved:false};
  capture(ev);
}
function startGroupResize(ev,dir){
  const els=selEls();if(els.some(e=>e.locked))return;
  drag={mode:'gresize',dir:dir,sx:ev.clientX,sy:ev.clientY,b0:unionBB(els),moved:false,items:els.map(e=>({e:e,o:JSON.parse(JSON.stringify({x:e.x,y:e.y,w:e.w,h:e.h,x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,rowH:e.rowH}))}))};
  capture(ev);
}
function startTableResize(ev,e,d,z){
  const i=+z.dataset.i;
  if(z.classList.contains('crz'))drag={mode:'colrz',e:e,d:d,i:i,sx:ev.clientX,w0:e.colW.slice(),moved:false};
  else{const tr=d.querySelectorAll('tr')[i];drag={mode:'rowrz',e:e,d:d,i:i,sy:ev.clientY,h0:tr?tr.offsetHeight:e.rowH[i],moved:false}}
  capture(ev);
}
function startMarquee(ev,p){drag={mode:'marquee',p0:p,base:ev.shiftKey?selIds.slice():[],moved:false};capture(ev)}
function startDraw(ev,p){drag={mode:'draw',p0:p,p1:p,moved:false,pts:[[p.x,p.y]]};capture(ev)}
['rulerH','rulerV'].forEach(id=>$('#'+id).addEventListener('pointerdown',ev=>{
  if(ev.button!==0||!stageNode)return;const axis=id==='rulerH'?'h':'v';const p=toSlide(ev);
  prefs.showGuides=true;savePrefs();deck.guides[axis].push(Math.round(axis==='h'?p.y:p.x));drawGuides();
  drag={mode:'guide',axis:axis,i:deck.guides[axis].length-1,moved:true,fromRuler:true};capture(ev,ev.currentTarget);
}));

/* ================= pointer move ================= */
window.addEventListener('pointermove',ev=>{
  if(lpTimer&&drag&&Math.hypot(ev.clientX-(drag.sx||ev.clientX),ev.clientY-(drag.sy||ev.clientY))>8){clearTimeout(lpTimer);lpTimer=null}
  if(!drag)return;const p=toSlide(ev),g=drag;
  switch(g.mode){
    case 'pan':{g.moved=true;stageWrap.scrollLeft=g.sl-(ev.clientX-g.sx);stageWrap.scrollTop=g.st-(ev.clientY-g.sy);break}
    case 'move':{
      const dx=(ev.clientX-g.sx)/scale,dy=(ev.clientY-g.sy)/scale;
      if(!g.moved&&Math.hypot(ev.clientX-g.sx,ev.clientY-g.sy)<3)return;
      if(!g.moved&&editId)exitEdit();if(!g.moved&&g.dup)dupForDrag(g);g.moved=true;
      let ddx=dx,ddy=dy;
      if(!ev.altKey){const r=snapMove(g.items.map(i=>i.e.id),g.bb0,g.bb0.x+dx,g.bb0.y+dy);ddx=r[0]-g.bb0.x;ddy=r[1]-g.bb0.y}else hideGuides();
      if(ev.shiftKey){if(Math.abs(ddx)>Math.abs(ddy))ddy=0;else ddx=0}
      g.items.forEach(it=>{const e=it.e,o=it.o;if(e.type==='line'){e.x1=Math.round(o.x1+ddx);e.x2=Math.round(o.x2+ddx);e.y1=Math.round(o.y1+ddy);e.y2=Math.round(o.y2+ddy)}else{e.x=Math.round(o.x+ddx);e.y=Math.round(o.y+ddy)}restyle(e,true)});
      syncConnectors(g.items.map(i=>i.e.id));
      if(editId)positionPreview();syncFormat();overlaySoon();break;
    }
    case 'resize':{
      g.moved=true;const e=g.e,o=g.o,dir=g.dir,rot=(e.rot||0)*Math.PI/180,c=Math.cos(rot),s=Math.sin(rot);
      const wx=(ev.clientX-g.sx)/scale,wy=(ev.clientY-g.sy)/scale,lx=wx*c+wy*s,ly=-wx*s+wy*c;
      let nl=0,nt=0,nw=o.w,nh=o.h;
      if(dir.includes('e'))nw=o.w+lx;if(dir.includes('w')){nl=lx;nw=o.w-lx}
      if(dir.includes('s'))nh=o.h+ly;if(dir.includes('n')){nt=ly;nh=o.h-ly}
      const keep=!g.crop&&dir.length===2&&((e.type==='image')!==ev.shiftKey);
      const ctr=!g.crop&&(ev.altKey||ev.ctrlKey||ev.metaKey);
      if(ctr){if(dir.includes('e'))nw=o.w+2*lx;if(dir.includes('w'))nw=o.w-2*lx;if(dir.includes('s'))nh=o.h+2*ly;if(dir.includes('n'))nh=o.h-2*ly}
      if(keep){const ra=o.w/o.h;if(Math.abs(nw-o.w)/o.w>Math.abs(nh-o.h)/o.h)nh=nw/ra;else nw=nh*ra;if(dir.includes('w'))nl=o.w-nw;if(dir.includes('n'))nt=o.h-nh}
      if(g.crop){const c0=g.c0,F=o.w/(1-c0.l-c0.r),G=o.h/(1-c0.t-c0.b);
        let L=c0.l+nl/F,R=c0.r+(o.w-nl-nw)/F,Tp=c0.t+nt/G,B=c0.b+(o.h-nt-nh)/G;
        if(L<0){nl-=L*F;nw+=L*F;L=0}if(R<0){nw+=R*F;R=0}if(Tp<0){nt-=Tp*G;nh+=Tp*G;Tp=0}if(B<0){nh+=B*G;B=0}
        if(1-L-R<.05||1-Tp-B<.05)return;e.crop={l:L,t:Tp,r:R,b:B}}
      if(nw<12){if(dir.includes('w'))nl=o.w-12;nw=12}if(nh<12){if(dir.includes('n'))nt=o.h-12;nh=12}
      if(ctr){nl=(o.w-nw)/2;nt=(o.h-nh)/2}
      const dcx=nl+nw/2-o.w/2,dcy=nt+nh/2-o.h/2,cx=o.x+o.w/2+dcx*c-dcy*s,cy=o.y+o.h/2+dcx*s+dcy*c;
      e.w=Math.round(nw);e.h=Math.round(nh);e.x=Math.round(cx-nw/2);e.y=Math.round(cy-nh/2);
      if(e.type==='table'&&g.rowH0&&dir.match(/[ns]/)){const k=nh/o.h;e.rowH=g.rowH0.map(v=>Math.max(20,Math.round(v*k)))}
      if(e.type==='table')styleEl(g.d,e),fitTable(e,g.d,false);else restyle(e,true);
      syncConnectors([e.id]);syncFormat();overlaySoon();if(editId)positionPreview();break;
    }
    case 'croppan':{
      const e=g.e,c0=g.c0,F=e.w/(1-c0.l-c0.r),G=e.h/(1-c0.t-c0.b);g.moved=true;
      let dl=-(ev.clientX-g.sx)/scale/F,dt=-(ev.clientY-g.sy)/scale/G;
      dl=clamp(dl,-c0.l,c0.r);dt=clamp(dt,-c0.t,c0.b);e.crop={l:c0.l+dl,r:c0.r-dl,t:c0.t+dt,b:c0.b-dt};restyle(e,true);break;
    }
    case 'rot':{
      g.moved=true;const e=g.e;let a=Math.atan2(p.y-g.cy,p.x-g.cx)*180/Math.PI+90;
      if(ev.shiftKey)a=Math.round(a/15)*15;else{const n=Math.round(a/45)*45;if(Math.abs(a-n)<4)a=n}
      a=((a%360)+360)%360;if(a>180)a-=360;e.rot=Math.round(a);restyle(e);syncFormat();overlaySoon();break;
    }
    case 'pt':{
      g.moved=true;const e=g.e,k=g.which==='p1'?['x1','y1','a1']:['x2','y2','a2'],other=g.which==='p1'?{x:e.x2,y:e.y2}:{x:e.x1,y:e.y1};
      let q=ev.shiftKey?snapAngle(other,p):p;const near=ev.altKey?null:nearestConn(q,null);
      if(near){q={x:near.p[0],y:near.p[1]};g.att={id:near.t.id,side:near.side};showConnDots(near.t,near.side)}
      else{g.att=null;const ht=ev.altKey?null:hoverTarget(q,null);showConnDots(ht,null)}
      e[k[0]]=Math.round(q.x);e[k[1]]=Math.round(q.y);e[k[2]]=g.att;restyle(e,true);syncFormat();overlaySoon();break;
    }
    case 'gresize':{
      g.moved=true;const b=g.b0,dir=g.dir,dx=(ev.clientX-g.sx)/scale,dy=(ev.clientY-g.sy)/scale;
      let x0=b.x,y0=b.y,x1=b.x+b.w,y1=b.y+b.h;if(dir.includes('w'))x0+=dx;if(dir.includes('e'))x1+=dx;if(dir.includes('n'))y0+=dy;if(dir.includes('s'))y1+=dy;
      let sx=(x1-x0)/(b.w||1),sy=(y1-y0)/(b.h||1);
      if(dir.length===2&&!ev.shiftKey){const k=Math.max(sx,sy);sx=sy=k;if(dir.includes('w'))x0=b.x+b.w-b.w*k;if(dir.includes('n'))y0=b.y+b.h-b.h*k}
      if(sx<.05||sy<.05)return;
      const ax=dir.includes('w')?b.x+b.w:b.x,ay=dir.includes('n')?b.y+b.h:b.y,fx=v=>Math.round(ax+(v-ax)*sx),fy=v=>Math.round(ay+(v-ay)*sy);
      if(dir==='n'||dir==='s')sx=1;if(dir==='e'||dir==='w')sy=1;
      g.items.forEach(it=>{const e=it.e,o=it.o;
        if(e.type==='line'){e.x1=fx(o.x1);e.y1=fy(o.y1);e.x2=fx(o.x2);e.y2=fy(o.y2)}
        else{e.x=fx(o.x);e.y=fy(o.y);e.w=Math.max(8,Math.round(o.w*sx));e.h=Math.max(8,Math.round(o.h*sy));if(e.type==='table'&&o.rowH)e.rowH=o.rowH.map(v=>Math.max(20,Math.round(v*sy)))}
        restyle(e,true)});
      syncConnectors(g.items.map(i=>i.e.id));overlaySoon();break;
    }
    case 'colrz':{
      g.moved=true;const e=g.e,i=g.i,df=(ev.clientX-g.sx)/scale/e.w,a=g.w0[i],b=g.w0[i+1],min=.04,na=clamp(a+df,min,a+b-min);
      e.colW[i]=na;e.colW[i+1]=a+b-na;const cols=g.d.querySelectorAll('col');if(cols[i])cols[i].style.width=(e.colW[i]*100)+'%';if(cols[i+1])cols[i+1].style.width=(e.colW[i+1]*100)+'%';
      let acc=0;$$('.crz',g.d).forEach((z,j)=>{acc+=e.colW[j];z.style.left=(acc*100)+'%'});fitTable(e,g.d,true);overlaySoon();break;
    }
    case 'rowrz':{
      g.moved=true;const e=g.e,v=Math.max(20,Math.round(g.h0+(ev.clientY-g.sy)/scale));e.rowH[g.i]=v;const tr=g.d.querySelectorAll('tr')[g.i];if(tr)tr.style.height=v+'px';fitTable(e,g.d,true);overlaySoon();break;
    }
    case 'cells':{
      const c=cellAtPoint(g.e,ev.clientX,ev.clientY);if(!c)return;if(c.r!==g.start.r||c.c!==g.start.c)g.moved=true;cellSel={r0:g.start.r,c0:g.start.c,r1:c.r,c1:c.c};markCells();break;
    }
    case 'marquee':{
      g.moved=true;const r=rectFrom(g.p0,p),mq=overlay.querySelector('.mq');mq.hidden=false;mq.classList.remove('draw');
      Object.assign(mq.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
      let hit=slide().els.filter(e=>{const b=bb(e);return b.x<r.x+r.w&&b.x+b.w>r.x&&b.y<r.y+r.h&&b.y+b.h>r.y}).map(e=>e.id);
      hit=Array.from(new Set(hit.flatMap(groupMembers)));selIds=Array.from(new Set(g.base.concat(hit)));markSel();break;
    }
    case 'draw':{
      g.moved=true;let q=p;
      if(tool&&tool.kind==='ink'){const l=g.pts[g.pts.length-1];if(Math.hypot(p.x-l[0],p.y-l[1])>=1.5)g.pts.push([p.x,p.y]);const ln=overlay.querySelector('.drawline');ln.hidden=false;
        ln.firstChild.setAttribute('d',strokeD(g.pts));ln.firstChild.setAttribute('stroke-dasharray','none');ln.firstChild.setAttribute('stroke-width','4');g.p1=p;break}
      if(tool&&tool.kind==='line'){const lp=overlay.querySelector('.drawline').firstChild;lp.setAttribute('stroke-dasharray','6 5');lp.setAttribute('stroke-width','2');if(ev.shiftKey)q=snapAngle(g.p0,p);const near=nearestConn(q,null);if(near){q={x:near.p[0],y:near.p[1]};showConnDots(near.t,near.side)}else showConnDots(null);
        const ln=overlay.querySelector('.drawline');ln.hidden=false;ln.firstChild.setAttribute('d','M'+g.p0.x+' '+g.p0.y+'L'+q.x+' '+q.y)}
      else{if(ev.shiftKey){const s=Math.max(Math.abs(p.x-g.p0.x),Math.abs(p.y-g.p0.y));q={x:g.p0.x+Math.sign(p.x-g.p0.x||1)*s,y:g.p0.y+Math.sign(p.y-g.p0.y||1)*s}}
        const r=ev.altKey?rectFrom({x:2*g.p0.x-q.x,y:2*g.p0.y-q.y},q):rectFrom(g.p0,q),mq=overlay.querySelector('.mq');g.rect=r;mq.hidden=false;mq.classList.add('draw');Object.assign(mq.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'})}
      g.p1=q;break;
    }
    case 'guide':{
      g.moved=true;const v=Math.round(g.axis==='h'?p.y:p.x);deck.guides[g.axis][g.i]=v;
      const el=overlay.querySelector('.ug[data-axis="'+g.axis+'"][data-i="'+g.i+'"]');if(el){if(g.axis==='h')el.style.top=v+'px';else el.style.left=v+'px'}break;
    }
  }
});

/* ================= pointer up ================= */
function endDrag(ev){
  clearTimeout(lpTimer);lpTimer=null;
  if(!drag)return;const g=drag;drag=null;hideGuides();showConnDots(null);
  if(overlay){overlay.querySelector('.mq').hidden=true;overlay.querySelector('.drawline').hidden=true}
  stageWrap.classList.remove('panning');
  switch(g.mode){
    case 'move':
      if(g.moved){detachMoved(g.items.map(i=>i.e));commit();thumbSoon();if(g.dup)toast(g.items.length>1?g.items.length+' elementos duplicados.':'Elemento duplicado.')}
      else if(g.dup){if(g.toggleOff)select(selIds.filter(x=>!g.toggleOff.includes(x)))}
      else if(ev&&!(ev.shiftKey||ev.ctrlKey||ev.metaKey)){
        const e=byId(g.id);
        if(g.groupWhole&&e){select([e.id])}
        else if(g.wasOnly&&e&&e.type==='box')enterEdit(e,{x:ev.clientX,y:ev.clientY});
      }
      break;
    case 'resize':case 'rot':case 'pt':case 'gresize':case 'croppan':
      if(g.moved){if(g.e&&(g.e.type==='box'||g.e.type==='table'))fitEl(g.e,g.d,true);if(g.e&&g.e.type==='chart')restyle(g.e);commit();thumbSoon()}break;
    case 'colrz':case 'rowrz':if(g.moved){refreshEl(g.e);commit()}break;
    case 'cells':
      if(!g.moved&&ev&&!ev.shiftKey){enterEdit(g.e,{x:ev.clientX,y:ev.clientY},g.start)}else renderToolbar();break;
    case 'marquee':renderToolbar();if(sideMode)renderSide();break;
    case 'guide':{
      const v=deck.guides[g.axis][g.i],lim=g.axis==='h'?H:W;
      if(v<0||v>lim){deck.guides[g.axis].splice(g.i,1);drawGuides();if(!g.fromRuler)toast('Guia removida.')}
      if(g.moved)commit();break;
    }
    case 'draw':{
      if(!tool)break;const t=tool;setTool(null);const a=g.p0,b=g.p1;let r=g.rect||rectFrom(a,b);const tiny=r.w<8&&r.h<8;
      if(t.kind==='ink'){if(g.pts.length<2)break;const sw=4;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;g.pts.forEach(q=>{x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])});
        x0-=sw;y0-=sw;x1+=sw;y1+=sw;const w=x1-x0,h=y1-y0;
        addEls([inkEl({x:Math.round(x0),y:Math.round(y0),w:Math.round(w),h:Math.round(h),vw:w,vh:h,strokes:[{c:'accent',w:sw,op:1,d:strokeD(g.pts.map(q=>[q[0]-x0,q[1]-y0]))}]})]);break}
      if(t.kind==='line'){
        const s=nearestConn(a,null),en=nearestConn(b,null);
        const e=lineEl({x1:Math.round(s?s.p[0]:a.x),y1:Math.round(s?s.p[1]:a.y),x2:Math.round(tiny?a.x+220:(en?en.p[0]:b.x)),y2:Math.round(tiny?a.y:(en?en.p[1]:b.y)),
          endCap:t.arrow?'arrow':'none',startCap:t.arrow==='both'?'arrow':'none',route:t.route||'straight',a1:s?{id:s.t.id,side:s.side}:null,a2:!tiny&&en?{id:en.t.id,side:en.side}:null});
        addEls([e]);
      }else if(t.kind==='text'){
        if(tiny||r.w<40)r={x:a.x,y:a.y,w:Math.min(480,W-a.x-10),h:56};
        const e=box({x:Math.round(r.x),y:Math.round(r.y),w:Math.max(60,Math.round(r.w)),h:Math.max(44,Math.round(r.h)),size:28});
        addEls([e],true);const d=elDom(e);if(d)d.classList.add('newempty');
      }else if(t.kind==='shape'){
        if(tiny)r={x:a.x-110,y:a.y-75,w:220,h:150};
        addEls([shapeEl(t.shape,{x:Math.round(r.x),y:Math.round(r.y),w:Math.max(12,Math.round(r.w)),h:Math.max(12,Math.round(r.h))})]);
      }
      break;
    }
  }
}
window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',()=>endDrag(null));

/* ================= double click, drop, wheel, context ================= */
function handleDbl(ev){
  if(tool||painter)return;const d=ev.target.closest('.el[data-id]');
  if(d){const e=byId(d.dataset.id);if(!e||e.locked)return;
    if(e.group&&selIds.length>1)select([e.id]);
    if(e.type==='box'){if(editId!==e.id)enterEdit(e,{x:ev.clientX,y:ev.clientY})}
    else if(e.type==='table'){const c=cellAtPoint(e,ev.clientX,ev.clientY);if(c)enterEdit(e,{x:ev.clientX,y:ev.clientY},c)}
    else if(e.type==='image')enterCrop(e);
    else if(e.type==='chart'||e.type==='media'||e.type==='tikz'){select([e.id]);openSide('format',true);if(e.type==='tikz')setTimeout(()=>{const c=$('#tkCode');if(c)c.focus()},40)}
    return}
  if(ev.target.closest('.ug,.cbadge'))return;
  if(!frame.contains(ev.target))return;
  const p=toSlide(ev);addEls([box({x:Math.round(clamp(p.x-20,0,W-300)),y:Math.round(clamp(p.y-28,0,H-60)),w:440,h:56,size:28})],true);
}
stageWrap.addEventListener('dragover',ev=>{if(ev.dataTransfer&&Array.from(ev.dataTransfer.types||[]).some(t=>t==='Files'||t==='text/uri-list'||t==='text/html'))ev.preventDefault()});
stageWrap.addEventListener('drop',ev=>{const f=ev.dataTransfer&&ev.dataTransfer.files[0];if(!f||/^image\//.test(f.type)){const r=clipImages(ev.dataTransfer);if(r){ev.preventDefault();insertClipImages(r)}return}ev.preventDefault();
  if(/^image\//.test(f.type))readImage(f,addImage);else if(/^(video|audio)\//.test(f.type))insertMediaFromFile(f);else toast('Arraste uma imagem, um vídeo ou um áudio.')});
stageWrap.addEventListener('wheel',ev=>{if(!(ev.ctrlKey||ev.metaKey))return;ev.preventDefault();setZoom(clamp(+(scale*(ev.deltaY<0?1.1:1/1.1)).toFixed(3),.1,4))},{passive:false});
function stageContext(ev){
  const d=ev.target.closest&&ev.target.closest('.el[data-id]');
  if(d&&editId===d.dataset.id&&ev.target.closest('.tx[contenteditable]'))return false;
  ev.preventDefault();
  if(d&&frame.contains(d)){if(!selIds.includes(d.dataset.id))select(groupMembers(d.dataset.id))}else select([]);
  openMenu(selIds.length?elCtxItems():slideBgCtxItems(),{x:ev.clientX,y:ev.clientY});return true;
}
stageWrap.addEventListener('contextmenu',ev=>{stageContext(ev)});
