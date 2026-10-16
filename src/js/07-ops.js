/* ================= element operations ================= */
function refreshEl(e){const d=elDom(e);if(!d)return;fillEl(d,e,true);styleEl(d,e);typeset([d]).then(()=>{fitEl(e,d,true);overlaySoon();thumbSoon()})}
function restyle(e,noSync){const d=elDom(e);if(d)styleEl(d,e);if(!noSync&&e.type!=='line')syncConnectors([e.id])}
function addEls(list,edit){
  if(editId)exitEdit();
  list.forEach(e=>{slide().els.push(e);const d=makeEl(e,true);const slnum=stageNode.querySelector('.slnum');stageNode.insertBefore(d,slnum);
    typeset([d]).then(()=>{fitEl(e,d,true);overlaySoon();thumbSoon()})});
  select(list.map(e=>e.id));commit();
  if(edit&&list.length===1)enterEdit(list[0],'end');
}
function removeEls(ids){
  if(editId&&ids.includes(editId)){editId=null;editCell=null;hidePreview()}
  if(cropId&&ids.includes(cropId))cropId=null;
  ids.forEach(id=>{const d=stageNode.querySelector('[data-id="'+id+'"]');if(d){$$('.tx',d).forEach(clearMath);d.remove()}});
  slide().els=slide().els.filter(e=>!ids.includes(e.id));
  slide().els.forEach(l=>{if(l.type==='line'){if(l.a1&&ids.includes(l.a1.id))l.a1=null;if(l.a2&&ids.includes(l.a2.id))l.a2=null}});
  deck.comments.forEach(c=>{if(ids.includes(c.elId))c.elId=null});
  selIds=[];cellSel=null;markSel();renderToolbar();renderSide();commit();thumbSoon();
}
function moveBy(e,dx,dy){if(e.type==='line'){e.x1+=dx;e.x2+=dx;e.y1+=dy;e.y2+=dy}else{e.x+=dx;e.y+=dy}}
function cloneEl(e,off,keepGroup){const c=JSON.parse(JSON.stringify(e));c.id=uid();if(off)moveBy(c,off,off);c.anim=null;if(!keepGroup)c.group=null;return c}
function cloneSet(els,off){
  const map={},groups={};
  const out=els.map(e=>{const c=cloneEl(e,off,true);map[e.id]=c.id;if(e.group)c.group=groups[e.group]||(groups[e.group]=uid());return c});
  out.forEach(c=>{if(c.type==='line'){['a1','a2'].forEach(k=>{if(c[k])c[k]=map[c[k].id]?{id:map[c[k].id],side:c[k].side}:null})}});
  return out;
}
function duplicateSel(){const els=selEls();if(!els.length)return;if(editId)exitEdit();addEls(cloneSet(els,20))}
function nudge(dx,dy){const els=selEls().filter(e=>!e.locked);els.forEach(e=>{moveBy(e,dx,dy);restyle(e)});detachMoved(els);commitSoon();thumbSoon();syncFormat();overlaySoon()}
function detachMoved(els){const ids=new Set(els.map(e=>e.id));els.forEach(l=>{if(l.type!=='line')return;['a1','a2'].forEach(k=>{if(l[k]&&!ids.has(l[k].id))l[k]=null});restyle(l,true)})}
function reorderDom(){const s=slide(),slnum=stageNode.querySelector('.slnum');s.els.forEach(e=>{const d=elDom(e);if(d)stageNode.insertBefore(d,slnum)})}
function order(how){
  const s=slide(),sel=new Set(selIds);if(!sel.size)return;let a=s.els;
  if(how==='front')a=a.filter(e=>!sel.has(e.id)).concat(a.filter(e=>sel.has(e.id)));
  else if(how==='back')a=a.filter(e=>sel.has(e.id)).concat(a.filter(e=>!sel.has(e.id)));
  else if(how==='forward'){for(let i=a.length-2;i>=0;i--)if(sel.has(a[i].id)&&!sel.has(a[i+1].id)){const t=a[i];a[i]=a[i+1];a[i+1]=t}}
  else if(how==='backward'){for(let i=1;i<a.length;i++)if(sel.has(a[i].id)&&!sel.has(a[i-1].id)){const t=a[i];a[i]=a[i-1];a[i-1]=t}}
  s.els=a;reorderDom();commit();thumbSoon();
}
function alignSel(how,toPage){
  const els=selEls().filter(e=>!e.locked);if(!els.length)return;let ref={x:0,y:0,w:W,h:H};
  if(selEls().length>1&&!toPage)ref=unionBB(selEls());
  els.forEach(e=>{const b=bb(e);let dx=0,dy=0;
    if(how==='left')dx=ref.x-b.x;else if(how==='center')dx=ref.x+ref.w/2-(b.x+b.w/2);else if(how==='right')dx=ref.x+ref.w-(b.x+b.w);
    else if(how==='top')dy=ref.y-b.y;else if(how==='middle')dy=ref.y+ref.h/2-(b.y+b.h/2);else if(how==='bottom')dy=ref.y+ref.h-(b.y+b.h);
    moveBy(e,Math.round(dx),Math.round(dy));restyle(e)});
  detachMoved(els);commit();thumbSoon();syncFormat();overlaySoon();
}
function distribute(axis){
  const els=selEls().filter(e=>!e.locked);if(els.length<3){toast('Selecione pelo menos três elementos para distribuir.');return}
  const k=axis==='h'?'x':'y',s=axis==='h'?'w':'h';
  const items=els.map(e=>({e:e,b:bb(e)})).sort((a,b)=>a.b[k]-b.b[k]);
  const first=items[0].b,last=items[items.length-1].b,span=last[k]+last[s]-first[k],sum=items.reduce((t,o)=>t+o.b[s],0),gap=(span-sum)/(items.length-1);let pos=first[k];
  items.forEach(o=>{const d=Math.round(pos-o.b[k]);moveBy(o.e,axis==='h'?d:0,axis==='h'?0:d);restyle(o.e);pos+=o.b[s]+gap});
  commit();thumbSoon();overlaySoon();
}
function rotateSel(deg){selEls().filter(e=>!e.locked).forEach(e=>{
  if(e.type==='line'){const cx=(e.x1+e.x2)/2,cy=(e.y1+e.y2)/2,r=deg*Math.PI/180;[['x1','y1'],['x2','y2']].forEach(([a,b])=>{const dx=e[a]-cx,dy=e[b]-cy;e[a]=Math.round(cx+dx*Math.cos(r)-dy*Math.sin(r));e[b]=Math.round(cy+dx*Math.sin(r)+dy*Math.cos(r))});e.a1=null;e.a2=null}
  else{let r=((e.rot||0)+deg)%360;if(r>180)r-=360;if(r<=-180)r+=360;e.rot=r}restyle(e)});commit();thumbSoon();syncFormat();overlaySoon()}
function scaleSel(fx,fy){const els=selEls().filter(e=>!e.locked);if(!els.length)return;
  els.forEach(e=>{if(e.type==='line'){const cx=(e.x1+e.x2)/2,cy=(e.y1+e.y2)/2;e.x1=Math.round(cx+(e.x1-cx)*fx);e.x2=Math.round(cx+(e.x2-cx)*fx);e.y1=Math.round(cy+(e.y1-cy)*fy);e.y2=Math.round(cy+(e.y2-cy)*fy)}
    else{const cx=e.x+e.w/2,cy=e.y+e.h/2;e.w=Math.max(8,Math.round(e.w*fx));e.h=Math.max(8,Math.round(e.h*fy));e.x=Math.round(cx-e.w/2);e.y=Math.round(cy-e.h/2)}
    restyle(e);const d=elDom(e);if(d&&(e.type==='box'||e.type==='table'))fitEl(e,d,true)});
  syncConnectors(els.map(e=>e.id));commitSoon();thumbSoon();syncFormat();overlaySoon()}
function flipSel(axis){selEls().filter(e=>!e.locked).forEach(e=>{
  if(e.type==='line'){if(axis==='h'){const t=e.x1;e.x1=e.x2;e.x2=t}else{const t=e.y1;e.y1=e.y2;e.y2=t}e.a1=null;e.a2=null}
  else if(axis==='h')e.flipH=!e.flipH;else e.flipV=!e.flipV;restyle(e)});commit();thumbSoon()}
function groupSel(){const els=selEls();if(els.length<2){toast('Selecione dois ou mais elementos para agrupar.');return}const g=uid();els.forEach(e=>e.group=g);commit();toast('Elementos agrupados.')}
function ungroupSel(){const els=selEls().filter(e=>e.group);if(!els.length){toast('A seleção não tem grupos.');return}els.forEach(e=>e.group=null);commit();toast('Grupo desfeito.')}
function lockSel(){const els=selEls();if(!els.length)return;const v=!els.every(e=>e.locked);els.forEach(e=>{e.locked=v;restyle(e)});markSel();commit();renderToolbar();toast(v?'Bloqueado: não pode ser movido nem redimensionado.':'Desbloqueado.')}
function groupMembers(id){const e=byId(id);if(!e||!e.group)return[id];return slide().els.filter(x=>x.group===e.group).map(x=>x.id)}
function setProp(k,v,types){
  const els=selEls().filter(e=>!types||types.includes(e.type));if(!els.length)return;
  els.forEach(e=>{e[k]=v;if(e.type==='table'||(e.type==='box'&&k==='role'))refreshEl(e);else{restyle(e);if(e.type==='box'&&['pad','size','lh','w','font','ps','fit','shape'].includes(k))fitBox(e,elDom(e),true)}});
  commitSoon();thumbSoon();renderToolbarSoon();overlaySoon();
}
const propOf=k=>{const e=selEls()[0];return e?e[k]:null};

/* ---------- connectors ---------- */
function connPoint(e,side){const cx=e.x+e.w/2,cy=e.y+e.h/2,a=(e.rot||0)*Math.PI/180;let lx=0,ly=0;
  if(side==='n')ly=-e.h/2;else if(side==='s')ly=e.h/2;else if(side==='e')lx=e.w/2;else if(side==='w')lx=-e.w/2;
  return[cx+lx*Math.cos(a)-ly*Math.sin(a),cy+lx*Math.sin(a)+ly*Math.cos(a)]}
function syncConnectors(ids){
  const s=slide();s.els.forEach(l=>{if(l.type!=='line')return;let ch=false;
    [['a1','x1','y1'],['a2','x2','y2']].forEach(([a,x,y])=>{const at=l[a];if(!at)return;if(ids&&!ids.includes(at.id))return;const t=s.els.find(q=>q.id===at.id);
      if(!t||t.type==='line'){l[a]=null;return}const p=connPoint(t,at.side);l[x]=Math.round(p[0]);l[y]=Math.round(p[1]);ch=true});
    if(ch){const d=elDom(l);if(d)styleLine(d,l)}});
}
function nearestConn(p,exceptId){
  let best=null;const th=16/scale;
  slide().els.forEach(t=>{if(t.type==='line'||t.id===exceptId)return;['n','e','s','w'].forEach(sd=>{const q=connPoint(t,sd),d=Math.hypot(q[0]-p.x,q[1]-p.y);if(d<th&&(!best||d<best.d))best={d:d,t:t,side:sd,p:q}})});
  return best;
}
function hoverTarget(p,exceptId){const els=slide().els;for(let i=els.length-1;i>=0;i--){const t=els[i];if(t.type==='line'||t.id===exceptId)continue;const m=12/scale;if(p.x>=t.x-m&&p.x<=t.x+t.w+m&&p.y>=t.y-m&&p.y<=t.y+t.h+m)return t}return null}

/* ---------- crop ---------- */
function enterCrop(e){if(!e||e.type!=='image'||e.locked)return;if(editId)exitEdit();cropId=e.id;selIds=[e.id];markSel();renderToolbar();
  toast('Arraste as alças para cortar e a imagem para reposicionar. Enter ou Esc para concluir.')}
function exitCrop(noCommit){if(!cropId)return;cropId=null;markSel();if(!noCommit){commit();thumbSoon()}renderToolbar()}
function resetImage(e){if(!e||e.type!=="image")return;e.crop={l:0,t:0,r:0,b:0};e.mask=null;e.bright=0;e.contrast=0;e.gray=false;e.reflect=false;
  const im=elDom(e)&&elDom(e).querySelector('.iw img');if(im&&im.naturalWidth)e.h=Math.round(e.w*im.naturalHeight/im.naturalWidth);restyle(e);commit();thumbSoon()}

/* ---------- tables ---------- */
const tbl=()=>{const e=editEl()||selEls()[0];return e&&e.type==='table'?e:null};
function anchorOf(e,r,c){for(let rr=r;rr>=0;rr--)for(let cc=c;cc>=0;cc--){const x=e.cells[rr]&&e.cells[rr][cc];if(x&&!x.hide&&rr+x.rs>r&&cc+x.cs>c)return[rr,cc]}return[r,c]}
function selRange(e){
  let R;if(cellSel)R={r0:Math.min(cellSel.r0,cellSel.r1),r1:Math.max(cellSel.r0,cellSel.r1),c0:Math.min(cellSel.c0,cellSel.c1),c1:Math.max(cellSel.c0,cellSel.c1)};
  else if(editCell)R={r0:editCell.r,r1:editCell.r,c0:editCell.c,c1:editCell.c};
  else return{r0:0,c0:0,r1:e.rows-1,c1:e.cols-1};
  for(let it=0;it<8;it++){let ch=false;
    for(let r=R.r0;r<=R.r1;r++)for(let c=R.c0;c<=R.c1;c++){const a=anchorOf(e,r,c),x=e.cells[a[0]][a[1]];
      if(a[0]<R.r0){R.r0=a[0];ch=true}if(a[1]<R.c0){R.c0=a[1];ch=true}if(a[0]+x.rs-1>R.r1){R.r1=a[0]+x.rs-1;ch=true}if(a[1]+x.cs-1>R.c1){R.c1=a[1]+x.cs-1;ch=true}}
    if(!ch)break}
  R.r1=Math.min(R.r1,e.rows-1);R.c1=Math.min(R.c1,e.cols-1);return R;
}
function selectedCells(e){const R=selRange(e),out=[];for(let r=R.r0;r<=R.r1;r++)for(let c=R.c0;c<=R.c1;c++)if(!e.cells[r][c].hide)out.push([r,c]);return out}
function insertRow(e,k){const row=[];
  for(let c=0;c<e.cols;c++){let crossed=false;if(k>0&&k<e.rows){const a=anchorOf(e,k-1,c),x=e.cells[a[0]][a[1]];if(a[0]+x.rs>k){crossed=true;if(a[1]===c)x.rs++}}
    row.push(cellObj(crossed?{hide:true}:{align:(e.cells[Math.min(k,e.rows-1)][c]||{}).align||'left'}))}
  e.cells.splice(k,0,row);e.rowH.splice(k,0,e.rowH[Math.min(k,e.rows-1)]||44);e.rows++}
function deleteRow(e,k){
  for(let c=0;c<e.cols;c++){const x=e.cells[k][c];
    if(x.hide){const a=anchorOf(e,k,c);if(a[0]<k&&a[1]===c)e.cells[a[0]][a[1]].rs--}
    else if(x.rs>1&&e.cells[k+1]){Object.assign(e.cells[k+1][c],{html:x.html,fill:x.fill,align:x.align,valign:x.valign,rs:x.rs-1,cs:x.cs,hide:false})}}
  e.cells.splice(k,1);e.rowH.splice(k,1);e.rows--}
function insertCol(e,k){
  for(let r=0;r<e.rows;r++){let crossed=false;if(k>0&&k<e.cols){const a=anchorOf(e,r,k-1),x=e.cells[a[0]][a[1]];if(a[1]+x.cs>k){crossed=true;if(a[0]===r)x.cs++}}
    e.cells[r].splice(k,0,cellObj(crossed?{hide:true}:{}))}
  const avg=1/e.cols;e.colW.splice(k,0,avg);const s=e.colW.reduce((a,b)=>a+b,0);e.colW=e.colW.map(v=>v/s);e.cols++}
function deleteCol(e,k){
  for(let r=0;r<e.rows;r++){const x=e.cells[r][k];
    if(x.hide){const a=anchorOf(e,r,k);if(a[1]<k&&a[0]===r)e.cells[a[0]][a[1]].cs--}
    else if(x.cs>1&&e.cells[r][k+1]){Object.assign(e.cells[r][k+1],{html:x.html,fill:x.fill,align:x.align,valign:x.valign,rs:x.rs,cs:x.cs-1,hide:false})}}
  e.cells.forEach(row=>row.splice(k,1));e.colW.splice(k,1);const s=e.colW.reduce((a,b)=>a+b,0)||1;e.colW=e.colW.map(v=>v/s);e.cols--}
function mergeCells(e,R){
  if(R.r0===R.r1&&R.c0===R.c1){toast('Selecione duas ou mais células para mesclar (Shift+clique ou arraste).');return false}
  const a=e.cells[R.r0][R.c0];let extra=[];
  for(let r=R.r0;r<=R.r1;r++)for(let c=R.c0;c<=R.c1;c++){if(r===R.r0&&c===R.c0)continue;const x=e.cells[r][c];if(!x.hide&&x.html&&!isEmptyHTML(x.html))extra.push(x.html);Object.assign(x,{hide:true,rs:1,cs:1,html:''})}
  a.rs=R.r1-R.r0+1;a.cs=R.c1-R.c0+1;if(extra.length)a.html=(a.html||'')+extra.join('');return true;
}
function unmergeCells(e,R){for(let r=R.r0;r<=R.r1;r++)for(let c=R.c0;c<=R.c1;c++){const x=e.cells[r][c];if(!x.hide&&(x.rs>1||x.cs>1)){
  for(let rr=r;rr<r+x.rs;rr++)for(let cc=c;cc<c+x.cs;cc++)if(rr!==r||cc!==c)e.cells[rr][cc].hide=false;x.rs=1;x.cs=1}}}
function tableOp(op){
  const e=tbl();if(!e)return;const keep=editCell;if(editId)exitEdit(true);const R=selRange(e);
  switch(op){
    case 'rowAbove':insertRow(e,R.r0);break;case 'rowBelow':insertRow(e,R.r1+1);break;
    case 'colLeft':insertCol(e,R.c0);break;case 'colRight':insertCol(e,R.c1+1);break;
    case 'delRow':if(e.rows-(R.r1-R.r0+1)<1){removeEls([e.id]);return}for(let r=R.r1;r>=R.r0;r--)deleteRow(e,r);break;
    case 'delCol':if(e.cols-(R.c1-R.c0+1)<1){removeEls([e.id]);return}for(let c=R.c1;c>=R.c0;c--)deleteCol(e,c);break;
    case 'delTable':removeEls([e.id]);return;
    case 'merge':if(!mergeCells(e,R))return;break;case 'unmerge':unmergeCells(e,R);break;
    case 'distRows':{const avg=e.rowH.reduce((a,b)=>a+b,0)/e.rows;e.rowH=e.rowH.map(()=>Math.round(avg));break}
    case 'distCols':e.colW=e.colW.map(()=>1/e.cols);break;
    case 'header':e.header=!e.header;break;case 'band':e.band=!e.band;break;
  }
  cellSel=null;void keep;refreshEl(e);markSel();commit();renderToolbar();
}
function setCellProp(k,v){const e=tbl();if(!e)return;if(editId&&editCell){const keep=editCell;exitEdit(true);cellSel={r0:keep.r,c0:keep.c,r1:keep.r,c1:keep.c}}
  selectedCells(e).forEach(([r,c])=>{e.cells[r][c][k]=v});refreshEl(e);commit();renderToolbarSoon()}
function setCellBorders(mode){
  const e=tbl();if(!e)return;if(editId&&editCell){const k=editCell;exitEdit(true);cellSel={r0:k.r,c0:k.c,r1:k.r,c1:k.c}}
  const R=selRange(e),inR=(r,c)=>r>=R.r0&&r<=R.r1&&c>=R.c0&&c<=R.c1;
  const setSide=(r,c,k,v)=>{const a=anchorOf(e,r,c),x=e.cells[a[0]][a[1]];x.bd=x.bd||{t:true,r:true,b:true,l:true};x.bd[k]=v};
  for(let r=R.r0;r<=R.r1;r++)for(let c=R.c0;c<=R.c1;c++){
    const edge={t:r===R.r0,b:r===R.r1,l:c===R.c0,r:c===R.c1};
    ['t','b','l','r'].forEach(k=>{let v=mode==='all'?true:mode==='none'?false:mode==='outer'?edge[k]:!edge[k];
      if(mode==='inner'&&edge[k])return;if(mode==='outer'&&!edge[k])v=false;
      setSide(r,c,k,v);
      const nb={t:[r-1,c,'b'],b:[r+1,c,'t'],l:[r,c-1,'r'],r:[r,c+1,'l']}[k];
      if(nb[0]>=0&&nb[0]<e.rows&&nb[1]>=0&&nb[1]<e.cols&&!inR(nb[0],nb[1]))setSide(nb[0],nb[1],nb[2],v)})}
  refreshEl(e);commit();
}
function moveCell(dir){
  const e=editEl();if(!e||e.type!=='table'||!editCell)return;let r=editCell.r,c=editCell.c;
  const vis=[];for(let rr=0;rr<e.rows;rr++)for(let cc=0;cc<e.cols;cc++)if(!e.cells[rr][cc].hide)vis.push([rr,cc]);
  const i=vis.findIndex(v=>v[0]===r&&v[1]===c);let j=i+dir;
  if(j>=vis.length){exitEdit(true);insertRow(e,e.rows);refreshEl(e);commit();setTimeout(()=>enterEdit(e,'end',{r:e.rows-1,c:0}),60);return}
  if(j<0)j=0;enterEdit(e,'end',{r:vis[j][0],c:vis[j][1]});
}
function insertTable(rows,cols){
  const w=Math.min(Math.round(W*.75),Math.max(300,cols*160)),e=tableEl(rows,cols,{w:w,x:Math.round((W-w)/2),y:Math.round(H*.24)});
  addEls([e]);setTimeout(()=>enterEdit(e,'end',{r:0,c:0}),80);
}
function tableFromTSV(text){
  const rows=text.replace(/\r/g,'').split('\n').filter(l=>l.length).map(l=>l.split('\t'));if(!rows.length)return null;
  const cols=Math.max(...rows.map(r=>r.length)),e=tableEl(rows.length,cols,{});
  rows.forEach((row,r)=>{for(let c=0;c<cols;c++)e.cells[r][c].html=row[c]&&row[c].trim()?md(row[c].trim()):''});
  e.w=Math.min(Math.round(W*.85),Math.max(320,cols*170));e.x=Math.round((W-e.w)/2);e.y=Math.round(H*.18);return e;
}

/* ---------- format painter ---------- */
const PAINT_KEYS={box:['size','color','font','bold','align','valign','lh','ps','pad','fill','fillOpacity','stroke','strokeW','dash','join','radius','shadow','opacity','outline','outlineW','textShadow','dir'],
  image:['opacity','radius','stroke','strokeW','shadow','bright','contrast','gray','reflect'],line:['stroke','strokeW','dash','cap','startCap','endCap','route','shadow','opacity'],
  table:['size','color','font','borderColor','borderW','pad','headerFill','header','band'],ink:['opacity','shadow'],chart:['size','legend','grid','colors','logY'],media:['opacity','shadow']};
function startPainter(){const e=selEls()[0];if(!e){toast('Selecione o elemento com a formatação que deseja copiar.');return}
  const props={};(PAINT_KEYS[e.type]||[]).forEach(k=>{props[k]=JSON.parse(JSON.stringify(e[k]===undefined?null:e[k]))});
  painter={type:e.type,props:props};stageWrap.classList.add('painting');renderToolbar();toast('Clique no elemento que deve receber a formatação. Esc cancela.')}
function stopPainter(){painter=null;stageWrap.classList.remove('painting');renderToolbar()}
function applyPainter(e){
  if(!painter||!e)return;const p=painter;
  const keys=p.type===e.type?Object.keys(p.props):(PAINT_KEYS[e.type]||[]).filter(k=>k in p.props);
  keys.forEach(k=>{e[k]=JSON.parse(JSON.stringify(p.props[k]))});
  if(e.type==='box'&&p.type==='box')e.html=stripStyle(stripStyle(stripStyle(e.html,'color'),'font-size'),'font-family');
  refreshEl(e);stopPainter();select([e.id]);commit();
}

/* ---------- inserts ---------- */
function readImage(file,cb){
  if(!file||!/^image\//.test(file.type)){toast('Esse arquivo não é uma imagem.');return}
  const fr=new FileReader();
  fr.onload=()=>{let src=fr.result;const im=new Image();
    im.onload=()=>{let nw=im.naturalWidth||400,nh=im.naturalHeight||300;
      if(file.type!=='image/svg+xml'&&Math.max(nw,nh)>1800){const k=1800/Math.max(nw,nh),c=document.createElement('canvas');c.width=Math.round(nw*k);c.height=Math.round(nh*k);
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);src=c.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.9);nw=c.width;nh=c.height}
      cb(src,nw,nh)};
    im.onerror=()=>toast('Não foi possível ler essa imagem.');im.src=src};
  fr.readAsDataURL(file);
}
function addImage(src,nw,nh){const k=Math.min(1,(W*.5)/nw,(H*.66)/nh),w=Math.round(nw*k),h=Math.round(nh*k);addEls([imageEl({src:src,x:Math.round((W-w)/2),y:Math.round((H-h)/2),w:w,h:h})])}
function pickImage(target){replaceTarget=target||null;$('#imgFile').click()}
$('#imgFile').addEventListener('change',ev=>{const f=ev.target.files[0];ev.target.value='';if(!f)return;
  readImage(f,(src,nw,nh)=>{if(replaceTarget){const e=replaceTarget;replaceTarget=null;e.src=src;e.crop={l:0,t:0,r:0,b:0};e.h=Math.round(e.w*nh/nw);const d=elDom(e);if(d){fillEl(d,e,true);styleEl(d,e)}commit();thumbSoon()}else addImage(src,nw,nh)})});
function addImageURL(url,quiet){
  if(/^data:image\//.test(url)){fetch(url).then(r=>r.blob()).then(b=>readImage(new File([b],'img',{type:b.type}),addImageCascade)).catch(()=>toast('Não foi possível ler essa imagem.'));return}
  if(/^https?:/i.test(url))fetch(url,{mode:'cors'}).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>{if(!/^image\//.test(b.type))throw 0;readImage(new File([b],'img',{type:b.type}),addImageCascade)}).catch(()=>addImageURLRaw(url,quiet));
  else addImageURLRaw(url,quiet);
}
let pasteCascade={t:0,n:0};
function addImageCascade(src,nw,nh){const now=Date.now();if(now-pasteCascade.t>1500)pasteCascade.n=0;pasteCascade.t=now;const k=pasteCascade.n++;
  const s=Math.min(1,(W*.5)/nw,(H*.66)/nh),w=Math.round(nw*s),h=Math.round(nh*s);addEls([imageEl({src:src,x:Math.round((W-w)/2)+k*24,y:Math.round((H-h)/2)+k*24,w:w,h:h})])}
function addImageURLRaw(url,quiet){
  const im=new Image();im.onload=()=>addImageCascade(url,im.naturalWidth,im.naturalHeight);
  im.onerror=()=>toast(standalone?'Não consegui carregar essa imagem. Confira o endereço.':'Aqui no Claude só dá para usar imagens enviadas do computador. Na versão local, links de imagem funcionam.');
  im.src=url;
}
function insertWordArt(){const e=box({x:Math.round(W*.15),y:Math.round(H*.36),w:Math.round(W*.7),h:150,size:84,bold:true,align:'center',valign:'middle',color:'accent',outline:'title',outlineW:2,textShadow:true,font:'title',html:'<div>Texto artístico</div>'});
  addEls([e]);setTimeout(()=>enterEdit(e,'all'),40)}
function insertMediaFromFile(f){
  const kind=/^audio\//.test(f.type)?'audio':'video';
  const done=src=>{const e=mediaEl({kind:kind,src:src,title:f.name,h:kind==='audio'?90:360,y:kind==='audio'?Math.round(H/2-45):150});addEls([e])};
  if(f.size<=4*1024*1024){const fr=new FileReader();fr.onload=()=>done(fr.result);fr.readAsDataURL(f)}
  else{done(URL.createObjectURL(f));toast('Arquivo grande: ele toca nesta sessão, mas não fica salvo. Para guardar, use um link.')}
}
$('#mediaFile').addEventListener('change',ev=>{const f=ev.target.files[0];ev.target.value='';if(f){closeModal();insertMediaFromFile(f)}});

/* ---------- diagrams ---------- */
function connectLine(a,sa,b,sb,o){const p=connPoint(a,sa),q=connPoint(b,sb);return lineEl(Object.assign({x1:Math.round(p[0]),y1:Math.round(p[1]),x2:Math.round(q[0]),y2:Math.round(q[1]),a1:{id:a.id,side:sa},a2:{id:b.id,side:sb},endCap:'arrow',stroke:'fg',strokeW:3},o))}
function sideToward(a,b){const dx=(b.x+b.w/2)-(a.x+a.w/2),dy=(b.y+b.h/2)-(a.y+a.h/2);return Math.abs(dx)>=Math.abs(dy)?(dx>0?['e','w']:['w','e']):(dy>0?['s','n']:['n','s'])}
function insertDiagram(kind,n){
  const g=uid(),shapes=[],lines=[],cx=W/2,cy=H/2+20;
  if(kind==='process'){const gap=56,bw=Math.min(240,(W*.86-(n-1)*gap)/n),bh=Math.min(130,bw*.6),x0=(W-(n*bw+(n-1)*gap))/2;
    for(let i=0;i<n;i++){shapes.push(shapeEl('round',{x:Math.round(x0+i*(bw+gap)),y:Math.round(cy-bh/2),w:Math.round(bw),h:Math.round(bh),size:22,color:'fg',html:'<div>Etapa '+(i+1)+'</div>',group:g}))}
    for(let i=1;i<n;i++)lines.push(connectLine(shapes[i-1],'e',shapes[i],'w',{group:g}))}
  else if(kind==='cycle'){const R=Math.min(W,H)*.3,bw=170,bh=86;
    for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;shapes.push(shapeEl('round',{x:Math.round(cx+R*Math.cos(a)*1.25-bw/2),y:Math.round(cy+R*Math.sin(a)-bh/2),w:bw,h:bh,size:20,color:'fg',html:'<div>Fase '+(i+1)+'</div>',group:g}))}
    for(let i=0;i<n;i++){const a=shapes[i],b=shapes[(i+1)%n],sd=sideToward(a,b);lines.push(connectLine(a,sd[0],b,sd[1],{route:'curve',group:g}))}}
  else if(kind==='hierarchy'){const bw=Math.min(200,(W*.86-(n-1)*30)/n),bh=80,top=shapeEl('round',{x:Math.round(cx-110),y:Math.round(H*.24),w:220,h:bh,size:22,color:'fg',html:'<div>Topo</div>',group:g,fill:'accent',fillOpacity:.3});
    shapes.push(top);const x0=(W-(n*bw+(n-1)*30))/2;
    for(let i=0;i<n;i++){const c=shapeEl('round',{x:Math.round(x0+i*(bw+30)),y:Math.round(H*.6),w:Math.round(bw),h:bh,size:20,color:'fg',html:'<div>Item '+(i+1)+'</div>',group:g});shapes.push(c);lines.push(connectLine(top,'s',c,'n',{route:'elbow',endCap:'none',group:g}))}}
  else if(kind==='venn'){n=Math.min(3,Math.max(2,n));const r=Math.min(W,H)*.24,pos=n===2?[[-.55,0],[.55,0]]:[[-.5,-.35],[.5,-.35],[0,.45]];
    pos.forEach((p,i)=>shapes.push(shapeEl('ellipse',{x:Math.round(cx+p[0]*r-r),y:Math.round(cy+p[1]*r-r),w:Math.round(2*r),h:Math.round(2*r),fill:SERIES[i%SERIES.length],fillOpacity:.32,stroke:SERIES[i%SERIES.length],strokeW:2,size:22,color:'fg',
      valign:p[1]<0?'top':'bottom',pad:Math.round(r*.35),html:'<div>Conjunto '+String.fromCharCode(65+i)+'</div>',group:g})))}
  else if(kind==='timeline'){const x0=W*.08,x1=W*.92,y=cy;lines.push(lineEl({x1:Math.round(x0),y1:Math.round(y),x2:Math.round(x1),y2:Math.round(y),endCap:'arrow',stroke:'fg',strokeW:3,group:g}));
    for(let i=0;i<n;i++){const x=x0+(x1-x0)*(i+.5)/n;shapes.push(shapeEl('ellipse',{x:Math.round(x-11),y:Math.round(y-11),w:22,h:22,fill:'accent',fillOpacity:1,strokeW:0,group:g}));
      shapes.push(box({x:Math.round(x-90),y:Math.round(i%2?y+24:y-84),w:180,h:60,size:20,align:'center',valign:i%2?'top':'bottom',html:'<div>'+(2020+i)+'</div>',group:g}))}}
  addEls(shapes.concat(lines));
}
