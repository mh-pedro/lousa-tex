/* ================= element rendering ================= */
function dashArr(d,w){return d==='dash'?(w*3.2)+' '+(w*2.2):d==='dot'?'0.01 '+(w*2.2):d==='dashdot'?(w*4)+' '+(w*2)+' 0.01 '+(w*2):''}
const flipT=e=>(e.flipH?'scaleX(-1) ':'')+(e.flipV?'scaleY(-1)':'');
function styleCommon(d,e,autoH){
  const st=d.style;st.left=e.x+'px';st.top=e.y+'px';st.width=e.w+'px';st.height=autoH?'auto':e.h+'px';
  st.transform=e.rot?'rotate('+e.rot+'deg)':'';st.opacity=e.opacity==null||e.opacity>=1?'':e.opacity;
  d.classList.toggle('locked',!!e.locked);
}
function styleBox(d,e){
  styleCommon(d,e);d.style.justifyContent={top:'flex-start',middle:'center',bottom:'flex-end'}[e.valign]||'flex-start';
  const svg=d.querySelector('.shp');svg.innerHTML='<path d="'+shapeD(e.shape,e.w,e.h,e.radius)+'"/>';const g=svg.firstChild;
  g.setAttribute('fill',e.fill?resolveColor(e.fill):'none');if(e.fill)g.setAttribute('fill-opacity',e.fillOpacity);if(EVENODD.has(e.shape))g.setAttribute('fill-rule','evenodd');
  if(e.stroke&&e.strokeW>0){g.setAttribute('stroke',resolveColor(e.stroke));g.setAttribute('stroke-width',e.strokeW);g.setAttribute('stroke-linejoin',e.join||'round');
    const da=dashArr(e.dash,e.strokeW);if(da){g.setAttribute('stroke-dasharray',da);g.setAttribute('stroke-linecap','round')}}
  svg.style.transform=flipT(e);svg.style.transformOrigin='50% 50%';svg.style.filter=e.shadow?'drop-shadow(0 6px 14px rgba(0,0,0,.28))':'';
  const tx=d.querySelector('.tx'),ts=tx.style;
  ts.padding=e.pad+'px';ts.fontSize=e.size+'px';ts.fontFamily=fontStack(fontName(e));ts.color=textColor(e);ts.textAlign=e.align;ts.lineHeight=e.lh;ts.fontWeight=e.bold?'700':'400';
  ts.direction=e.dir==='rtl'?'rtl':'';ts.setProperty('--ps',(e.ps||0)+'em');
  ts.webkitTextStroke=e.outline&&e.outlineW>0?(e.outlineW*2)+'px '+resolveColor(e.outline):'';ts.paintOrder=e.outline&&e.outlineW>0?'stroke fill':'';
  ts.textShadow=e.textShadow?'0 3px 8px rgba(0,0,0,.35)':'';
  tx.dataset.ph=e.role?PH[e.role]||'':'';
  if(!d.classList.contains('editing'))tx.classList.toggle('ph',!!e.role&&isEmptyHTML(e.html));
  if(e.fit==='shrink')fitBox(e,d,false);
}
function fitBox(e,d,mutate){
  const tx=d&&d.querySelector('.tx');if(!tx)return;
  if(e.fit==='shrink'){
    tx.style.fontSize=e.size+'px';
    if(tx.offsetHeight>e.h+1){let lo=.15,hi=1;for(let i=0;i<8;i++){const m=(lo+hi)/2;tx.style.fontSize=(e.size*m)+'px';if(tx.offsetHeight>e.h+1)hi=m;else lo=m}tx.style.fontSize=(e.size*lo)+'px'}
  }else if(e.fit==='grow'&&mutate!==false){const need=Math.ceil(tx.offsetHeight);if(need>e.h+1){e.h=need;d.style.height=need+'px';const svg=d.querySelector('.shp');if(svg)styleBox(d,e)}}
}
function styleImage(d,e){
  styleCommon(d,e);
  const iw=d.querySelector('.iw'),img=iw.querySelector('img'),c=e.crop||{l:0,t:0,r:0,b:0},fw=1/Math.max(.02,1-c.l-c.r),fh=1/Math.max(.02,1-c.t-c.b);
  Object.assign(img.style,{width:fw*100+'%',height:fh*100+'%',left:(-c.l*fw*100)+'%',top:(-c.t*fh*100)+'%'});
  const f=[];if(e.bright)f.push('brightness('+(1+e.bright/100)+')');if(e.contrast)f.push('contrast('+(1+e.contrast/100)+')');if(e.gray)f.push('grayscale(1)');img.style.filter=f.join(' ');
  img.alt=e.alt||'';
  iw.style.transform=flipT(e);
  iw.style.borderRadius=e.mask?'':(e.radius||0)+'px';
  iw.style.clipPath=e.mask?"path('"+shapeD(e.mask,e.w,e.h,e.radius)+"')":'';
  iw.style.boxShadow=!e.mask&&e.stroke&&e.strokeW>0?'inset 0 0 0 '+e.strokeW+'px '+resolveColor(e.stroke):'';
  d.style.filter=e.shadow?'drop-shadow(0 8px 16px rgba(0,0,0,.3))':'';
  d.style.webkitBoxReflect=e.reflect?'below 3px linear-gradient(transparent 58%, rgba(255,255,255,.38))':'';
  const gh=d.querySelector('.ghost');if(gh)Object.assign(gh.style,{width:fw*e.w+'px',height:fh*e.h+'px',left:(-c.l*fw*e.w)+'px',top:(-c.t*fh*e.h)+'px'});
}
function lineGeom(e){const pad=Math.max(20,e.strokeW*5);return{x:Math.min(e.x1,e.x2)-pad,y:Math.min(e.y1,e.y2)-pad,w:Math.abs(e.x2-e.x1)+2*pad,h:Math.abs(e.y2-e.y1)+2*pad}}
function routeHoriz(e,ax,ay,bx,by){const s=e.a1&&e.a1.side;if(s==='e'||s==='w')return true;if(s==='n'||s==='s')return false;return Math.abs(bx-ax)>=Math.abs(by-ay)}
function linePath(e,ax,ay,bx,by){
  if(e.route==='straight'||!e.route||(ax===bx&&ay===by))return{d:'M'+f2(ax)+' '+f2(ay)+'L'+f2(bx)+' '+f2(by),s:[bx-ax,by-ay],f:[bx-ax,by-ay]};
  const hz=routeHoriz(e,ax,ay,bx,by);
  if(e.route==='elbow'){
    if(hz){const mx=(ax+bx)/2;return{d:'M'+f2(ax)+' '+f2(ay)+'H'+f2(mx)+'V'+f2(by)+'H'+f2(bx),s:[mx-ax||1,0],f:[bx-mx||1,0]}}
    const my=(ay+by)/2;return{d:'M'+f2(ax)+' '+f2(ay)+'V'+f2(my)+'H'+f2(bx)+'V'+f2(by),s:[0,my-ay||1],f:[0,by-my||1]};
  }
  if(hz){const mx=(ax+bx)/2;return{d:'M'+f2(ax)+' '+f2(ay)+'C'+f2(mx)+' '+f2(ay)+' '+f2(mx)+' '+f2(by)+' '+f2(bx)+' '+f2(by),s:[mx-ax||1,0],f:[bx-mx||1,0]}}
  const my=(ay+by)/2;return{d:'M'+f2(ax)+' '+f2(ay)+'C'+f2(ax)+' '+f2(my)+' '+f2(bx)+' '+f2(my)+' '+f2(bx)+' '+f2(by),s:[0,my-ay||1],f:[0,by-my||1]};
}
function capSVG(type,px,py,ux,uy,sw,col){
  const hl=Math.max(11,sw*3.4),hw=Math.max(7,sw*2.3),r=Math.max(4.5,sw*1.8),nx=-uy,ny=ux;
  switch(type){
    case 'arrow':{const bx=px-ux*hl,by=py-uy*hl;return{svg:'<path d="M'+f2(px)+' '+f2(py)+'L'+f2(bx+nx*hw)+' '+f2(by+ny*hw)+'L'+f2(bx-nx*hw)+' '+f2(by-ny*hw)+'Z" fill="'+col+'"/>',cut:hl*.8}}
    case 'open':{const bx=px-ux*hl,by=py-uy*hl;return{svg:'<path d="M'+f2(bx+nx*hw)+' '+f2(by+ny*hw)+'L'+f2(px)+' '+f2(py)+'L'+f2(bx-nx*hw)+' '+f2(by-ny*hw)+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>',cut:0}}
    case 'circle':return{svg:'<circle cx="'+f2(px)+'" cy="'+f2(py)+'" r="'+f2(r)+'" fill="'+col+'"/>',cut:r};
    case 'square':return{svg:'<path d="M'+f2(px+(ux+nx)*r)+' '+f2(py+(uy+ny)*r)+'L'+f2(px+(ux-nx)*r)+' '+f2(py+(uy-ny)*r)+'L'+f2(px-(ux+nx)*r)+' '+f2(py-(uy+ny)*r)+'L'+f2(px-(ux-nx)*r)+' '+f2(py-(uy-ny)*r)+'Z" fill="'+col+'"/>',cut:r};
    case 'diamond':{const q=r*1.35;return{svg:'<path d="M'+f2(px+ux*q)+' '+f2(py+uy*q)+'L'+f2(px+nx*q*.7)+' '+f2(py+ny*q*.7)+'L'+f2(px-ux*q)+' '+f2(py-uy*q)+'L'+f2(px-nx*q*.7)+' '+f2(py-ny*q*.7)+'Z" fill="'+col+'"/>',cut:q}}
  }
  return{svg:'',cut:0};
}
function styleLine(d,e){
  const g=lineGeom(e),st=d.style;st.left=g.x+'px';st.top=g.y+'px';st.width=g.w+'px';st.height=g.h+'px';st.opacity=e.opacity==null||e.opacity>=1?'':e.opacity;
  d.classList.toggle('locked',!!e.locked);
  const ax=e.x1-g.x,ay=e.y1-g.y,bx=e.x2-g.x,by=e.y2-g.y,sw=e.strokeW,col=resolveColor(e.stroke);
  const p0=linePath(e,ax,ay,bx,by),nrm=v=>{const L=Math.hypot(v[0],v[1])||1;return[v[0]/L,v[1]/L]};
  const uf=nrm(p0.f),us=nrm(p0.s);
  const ce=capSVG(e.endCap,bx,by,uf[0],uf[1],sw,col),cs=capSVG(e.startCap,ax,ay,-us[0],-us[1],sw,col);
  const p=linePath(e,ax+us[0]*cs.cut,ay+us[1]*cs.cut,bx-uf[0]*ce.cut,by-uf[1]*ce.cut);
  const da=dashArr(e.dash,sw);
  d.querySelector('svg').innerHTML='<g'+(e.shadow?' style="filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))"':'')+'><path d="'+p.d+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="'+(e.cap||'round')+'" stroke-linejoin="round"'+(da?' stroke-dasharray="'+da+'"':'')+'/>'+cs.svg+ce.svg+'</g>'+
    '<path class="hit" d="'+p0.d+'" stroke="transparent" stroke-width="'+Math.max(16,sw+12)+'" fill="none" pointer-events="stroke"/>';
  const h1=d.querySelector('.h[data-dir="p1"]'),h2=d.querySelector('.h[data-dir="p2"]');
  if(h1){h1.style.left=ax+'px';h1.style.top=ay+'px';h2.style.left=bx+'px';h2.style.top=by+'px';h1.classList.toggle('att',!!e.a1);h2.classList.toggle('att',!!e.a2)}
}
function cellFill(e,r,cell){
  if(cell.fill)return resolveColor(cell.fill);
  if(e.header&&r===0)return resolveColor(e.headerFill||'accent');
  if(e.band&&r>0&&r%2===0)return mixHex(resolveColor('fg'),resolveColor('bg'),.93);
  return null;
}
function tableHTML(e){
  const bc=resolveColor(e.borderColor||'muted'),bw=e.borderW||0;
  let h='<table class="tb"><colgroup>'+e.colW.map(f=>'<col style="width:'+(f*100).toFixed(4)+'%">').join('')+'</colgroup><tbody>';
  for(let r=0;r<e.rows;r++){
    h+='<tr style="height:'+e.rowH[r]+'px">';
    for(let c=0;c<e.cols;c++){
      const cell=e.cells[r][c];if(cell.hide)continue;const fill=cellFill(e,r,cell),hd=e.header&&r===0;
      const bd=cell.bd,side=k=>(!bd||bd[k])&&bw?bw+'px solid '+bc:'0 none';
      h+='<td data-r="'+r+'" data-c="'+c+'"'+(cell.rs>1?' rowspan="'+cell.rs+'"':'')+(cell.cs>1?' colspan="'+cell.cs+'"':'')+' style="border-top:'+side('t')+';border-right:'+side('r')+';border-bottom:'+side('b')+';border-left:'+side('l')+';'+(fill?'background:'+fill+';':'')+
        'vertical-align:'+cell.valign+';text-align:'+cell.align+';padding:'+e.pad+'px;'+(hd?'font-weight:700;':'')+(fill&&lum(fill)<.35?'color:#ffffff;':'')+'"><div class="tx" data-r="'+r+'" data-c="'+c+'">'+xform(cell.html||'',e.id+':'+r+':'+c)+'</div></td>';
    }
    h+='</tr>';
  }
  return h+'</tbody></table>';
}
function fillTable(d,e,interactive){
  const w=d.querySelector('.tbw');$$('.tx',w).forEach(clearMath);w.innerHTML=tableHTML(e);
  $$('.crz,.rrz',d).forEach(x=>x.remove());
  if(interactive){
    let acc=0;for(let i=0;i<e.cols-1;i++){acc+=e.colW[i];const z=document.createElement('div');z.className='crz';z.dataset.i=i;z.style.left=(acc*100)+'%';d.appendChild(z)}
    for(let i=0;i<e.rows;i++){const z=document.createElement('div');z.className='rrz';z.dataset.i=i;d.appendChild(z)}
  }
}
function fitTable(e,d,mutate){
  const t=d&&d.querySelector('table');if(!t)return;
  if(mutate!==false)e.h=Math.round(d.offsetHeight);
  const trs=t.querySelectorAll('tr');$$('.rrz',d).forEach(z=>{const tr=trs[+z.dataset.i];if(tr)z.style.top=(tr.offsetTop+tr.offsetHeight)+'px'});
}
function styleTable(d,e){
  styleCommon(d,e,true);
  d.style.fontSize=e.size+'px';d.style.fontFamily=fontStack(fontName(e));d.style.color=textColor(e);d.style.lineHeight=1.2;
}
/* ---------- charts ---------- */
const SERIES=['accent','#2f6db3','#2e9e6a','#c9732a','#8b5cf6','#d14d72','#3aa6b9','#7a7a7a'];
function parseTSV(t){return String(t||'').replace(/\r/g,'').split('\n').filter(l=>l.trim()).map(l=>l.split(l.indexOf('\t')>=0?'\t':(l.indexOf(';')>=0?';':',')).map(s=>s.trim()))}
function niceNum(x,round){if(!(x>0))return 1;const ex=Math.floor(Math.log10(x)),f=x/Math.pow(10,ex);let nf;if(round)nf=f<1.5?1:f<3?2:f<7?5:10;else nf=f<=1?1:f<=2?2:f<=5?5:10;return nf*Math.pow(10,ex)}
function niceTicks(min,max,n){if(!isFinite(min)||!isFinite(max)){min=0;max=1}if(min===max){min-=1;max+=1}
  const st=niceNum(niceNum(max-min,false)/Math.max(1,n-1),true),lo=Math.floor(min/st+1e-9)*st,hi=Math.ceil(max/st-1e-9)*st,t=[];
  for(let v=lo;v<=hi+st*.5;v+=st)t.push(+v.toPrecision(12));return{lo:lo,hi:hi,t:t}}
const svgLine=(x1,y1,x2,y2,c)=>'<line x1="'+f2(x1)+'" y1="'+f2(y1)+'" x2="'+f2(x2)+'" y2="'+f2(y2)+'" stroke="'+c+'" stroke-width="1"/>';
let chartLabels=[];
const labW=(s,fs)=>String(s).replace(/\\[a-zA-Z]+/g,'x').replace(/[{}$^_\\]/g,'').length*fs*.5;
function chartSVG(e){
  chartLabels=[];const LB=(k,x,y,s,t,anchor,bold,rot)=>chartLabels.push({k:k,x:x,y:y,s:s,t:String(t),a:anchor||'start',b:!!bold,r:!!rot});
  const w=e.w,h=e.h,fs=e.size||16,fg=resolveColor('fg'),bg=resolveColor('bg'),gridC=mixHex(fg,bg,.84),axisC=mixHex(fg,bg,.5);
  if(e.kind==='fn')return fnSVG(e,LB);
  const T=(x,y,s,txt,anchor,fill,attr)=>'<text x="'+f2(x)+'" y="'+f2(y)+'" font-size="'+f2(s)+'" fill="'+(fill||fg)+'" text-anchor="'+(anchor||'start')+'"'+(attr||'')+'>'+esc(txt)+'</text>';
  const rows=parseTSV(e.data);
  if(rows.length<2||rows[0].length<2)return T(w/2,h/2,fs,'Sem dados: edite em Opções de formato','middle',axisC);
  const head=rows[0],body=rows.slice(1),ns=head.length-1,col=i=>resolveColor((e.colors&&e.colors[i])||SERIES[i%SERIES.length]);
  let out='',top=fs*.5,left=fs*.4,right=fs*.9,bottom=fs*.4;
  if(e.title){LB('title',w/2,top+fs*.8,fs*1.25,e.title,'middle',true);top+=fs*1.9}
  const cw=s=>labW(s,fs)*1.05;
  const items=e.kind==='pie'?body.map((r,i)=>[r[0],col(i)]):head.slice(1).map((s,i)=>[s,col(i)]);
  if(e.legend&&(e.kind==='pie'||ns>1)){
    const tot=items.reduce((a,it)=>a+cw(it[0])*.85+fs*1.7,0);let x=Math.max(left,(w-tot)/2);const y=top+fs*.8;
    items.forEach((it,ii)=>{out+='<rect x="'+f2(x)+'" y="'+f2(y-fs*.62)+'" width="'+f2(fs*.7)+'" height="'+f2(fs*.7)+'" rx="2" fill="'+it[1]+'"/>';LB('lg'+ii,x+fs*.95,y-fs*.27,fs*.85,it[0]);x+=cw(it[0])*.85+fs*1.7});
    top+=fs*1.7;
  }
  if(e.kind==='pie'){
    const vals=body.map(r=>Math.max(0,num(r[1])||0)),tot=vals.reduce((a,b)=>a+b,0)||1;
    const R=Math.max(10,Math.min(w-left-right,h-top-bottom)/2*.92),cx=w/2,cy=top+(h-top-bottom)/2;let a=-Math.PI/2;
    vals.forEach((v,i)=>{const da=v/tot*2*Math.PI;if(da<=0)return;const a2=a+da;
      if(da>=2*Math.PI-1e-6)out+='<circle cx="'+f2(cx)+'" cy="'+f2(cy)+'" r="'+f2(R)+'" fill="'+col(i)+'"/>';
      else out+='<path d="M'+f2(cx)+' '+f2(cy)+'L'+f2(cx+R*Math.cos(a))+' '+f2(cy+R*Math.sin(a))+'A'+f2(R)+' '+f2(R)+' 0 '+(da>Math.PI?1:0)+' 1 '+f2(cx+R*Math.cos(a2))+' '+f2(cy+R*Math.sin(a2))+'Z" fill="'+col(i)+'" stroke="'+bg+'" stroke-width="2"/>';
      const am=a+da/2,lr=R*.64;if(v/tot>.04)out+=T(cx+lr*Math.cos(am),cy+lr*Math.sin(am)+fs*.32,fs*.85,Math.round(v/tot*100)+'%','middle',lum(col(i))<.4?'#ffffff':'#1b1b1b',' font-weight="600"');
      a=a2});
    return out;
  }
  const scatter=e.kind==='scatter',horiz=e.kind==='barh',isBar=e.kind==='bar'||horiz||e.kind==='area';
  const labels=body.map(r=>r[0]),series=[];for(let s=0;s<ns;s++)series.push(body.map(r=>num(r[s+1])));
  const numX=scatter||((e.kind==='line'||e.kind==='area')&&labels.length>1&&labels.every(l=>isFinite(num(l))));
  const xs=numX?body.map(r=>num(r[0])):null;
  let all=[];series.forEach(s=>s.forEach(v=>{if(isFinite(v))all.push(v)}));if(!all.length)all=[0,1];
  let vmin=Math.min(...all),vmax=Math.max(...all);if(isBar){vmin=Math.min(0,vmin);vmax=Math.max(0,vmax)}
  const log=!!e.logY&&(e.kind==='line'||scatter)&&vmin>0;
  let yt;
  if(log){const lo=Math.floor(Math.log10(vmin));let hi=Math.ceil(Math.log10(vmax));if(hi<=lo)hi=lo+1;yt={lo:Math.pow(10,lo),hi:Math.pow(10,hi),t:[]};for(let p=lo;p<=hi;p++)yt.t.push(Math.pow(10,p))}
  else yt=niceTicks(vmin,vmax,6);
  const valW=Math.max(...yt.t.map(v=>cw(fmtNum(v)))),catW=Math.max(...labels.map(cw));
  if(horiz)left+=Math.min(catW,w*.32)+fs*.5;else left+=valW+fs*.5;
  bottom+=fs*1.5;if(e.yTitle)left+=fs*1.3;if(e.xTitle)bottom+=fs*1.3;
  const px=left,py=top+fs*.4,pw=Math.max(10,w-left-right),ph=Math.max(10,h-py-bottom);
  const V=v=>log?Math.log10(v):v,vlo=V(yt.lo),vhi=V(yt.hi),span=(vhi-vlo)||1;
  const ypos=v=>py+ph-(V(v)-vlo)/span*ph,xpos=v=>px+(V(v)-vlo)/span*pw;
  yt.t.forEach(v=>{if(horiz){const x=xpos(v);if(e.grid)out+=svgLine(x,py,x,py+ph,gridC);out+=T(x,py+ph+fs*1.1,fs*.8,fmtNum(v),'middle',axisC)}
    else{const y=ypos(v);if(e.grid)out+=svgLine(px,y,px+pw,y,gridC);out+=T(px-fs*.4,y+fs*.3,fs*.8,fmtNum(v),'end',axisC)}});
  const n=Math.max(1,labels.length);
  if(numX){
    const xv=xs.filter(isFinite),xt=niceTicks(xv.length?Math.min(...xv):0,xv.length?Math.max(...xv):1,6),X=v=>px+(v-xt.lo)/((xt.hi-xt.lo)||1)*pw;
    xt.t.forEach(v=>{const x=X(v);if(e.grid)out+=svgLine(x,py,x,py+ph,gridC);out+=T(x,py+ph+fs*1.1,fs*.8,fmtNum(v),'middle',axisC)});
    series.forEach((s,si)=>{
      const pts=s.map((v,i)=>isFinite(v)&&isFinite(xs[i])?[X(xs[i]),ypos(v)]:null).filter(Boolean).sort((a,b)=>a[0]-b[0]);
      if(!scatter&&pts.length){const dd='M'+pts.map(p=>f2(p[0])+' '+f2(p[1])).join('L');
        if(e.kind==='area'){const yb=ypos(Math.max(yt.lo,Math.min(0,yt.hi)));out+='<path d="'+dd+'L'+f2(pts[pts.length-1][0])+' '+f2(yb)+'L'+f2(pts[0][0])+' '+f2(yb)+'Z" fill="'+col(si)+'" fill-opacity=".22"/>'}
        out+='<path d="'+dd+'" fill="none" stroke="'+col(si)+'" stroke-width="'+f2(Math.max(2,fs*.16))+'" stroke-linejoin="round" stroke-linecap="round"/>'}
      if(e.kind!=='area')pts.forEach(p=>{out+='<circle cx="'+f2(p[0])+'" cy="'+f2(p[1])+'" r="'+f2(fs*(scatter?.28:.24))+'" fill="'+col(si)+'"/>'})});
    const y0=!log&&yt.lo<=0&&yt.hi>=0?ypos(0):py+ph;out+=svgLine(px,y0,px+pw,y0,axisC);
  }else if(horiz){
    const bh=ph/n,b=bh*.72/ns;
    labels.forEach((lab,i)=>{out+=T(px-fs*.4,py+bh*(i+.5)+fs*.3,fs*.8,lab,'end');
      series.forEach((s,si)=>{const v=s[i];if(!isFinite(v))return;const x0=xpos(0),x1=xpos(v);
        out+='<rect x="'+f2(Math.min(x0,x1))+'" y="'+f2(py+bh*i+bh*.14+b*si)+'" width="'+f2(Math.abs(x1-x0))+'" height="'+f2(b*.92)+'" fill="'+col(si)+'"/>'})});
    out+=svgLine(xpos(0),py,xpos(0),py+ph,axisC);
  }else{
    const band=pw/n,step=Math.max(1,Math.ceil(n/Math.max(1,Math.floor(pw/(Math.min(catW,pw)*.9+fs)))));
    labels.forEach((lab,i)=>{if(i%step===0)out+=T(px+band*(i+.5),py+ph+fs*1.1,fs*.8,lab,'middle')});
    if(e.kind==='bar'){const b=band*.72/ns;series.forEach((s,si)=>s.forEach((v,i)=>{if(!isFinite(v))return;const y0=ypos(0),y1=ypos(v);
      out+='<rect x="'+f2(px+band*i+band*.14+b*si)+'" y="'+f2(Math.min(y0,y1))+'" width="'+f2(b*.92)+'" height="'+f2(Math.abs(y1-y0))+'" fill="'+col(si)+'"/>'}))}
    else series.forEach((s,si)=>{const pts=s.map((v,i)=>isFinite(v)?[px+band*(i+.5),ypos(v)]:null).filter(Boolean);if(!pts.length)return;
      const dd='M'+pts.map(p=>f2(p[0])+' '+f2(p[1])).join('L');
      if(e.kind==='area'){const yb=ypos(0);out+='<path d="'+dd+'L'+f2(pts[pts.length-1][0])+' '+f2(yb)+'L'+f2(pts[0][0])+' '+f2(yb)+'Z" fill="'+col(si)+'" fill-opacity=".22"/>'}
      out+='<path d="'+dd+'" fill="none" stroke="'+col(si)+'" stroke-width="'+f2(Math.max(2,fs*.16))+'" stroke-linejoin="round" stroke-linecap="round"/>';
      if(e.kind==='line')pts.forEach(p=>{out+='<circle cx="'+f2(p[0])+'" cy="'+f2(p[1])+'" r="'+f2(fs*.24)+'" fill="'+col(si)+'"/>'})});
    const y0=!log&&yt.lo<=0&&yt.hi>=0?ypos(0):py+ph;out+=svgLine(px,y0,px+pw,y0,axisC);
  }
  if(e.xTitle)LB('xt',px+pw/2,h-fs*.8,fs*.85,e.xTitle,'middle');
  if(e.yTitle)LB('yt',fs*1.05,py+ph/2,fs*.85,e.yTitle,'middle',false,true);
  return out;
}
function fnSVG(e,LB){
  const w=e.w,h=e.h,fs=e.size||16,fg=resolveColor('fg'),bg=resolveColor('bg'),gridC=mixHex(fg,bg,.84),axisC=mixHex(fg,bg,.5);
  const T=(x,y,s,txt,anchor,fill)=>'<text x="'+f2(x)+'" y="'+f2(y)+'" font-size="'+f2(s)+'" fill="'+(fill||fg)+'" text-anchor="'+(anchor||'start')+'">'+esc(txt)+'</text>';
  const col=i=>resolveColor((e.colors&&e.colors[i])||SERIES[i%SERIES.length]);
  const lines=String(e.fns||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const k=l.indexOf('|');return{src:(k>=0?l.slice(0,k):l).trim(),label:k>=0?l.slice(k+1).trim():''}});
  let x0=evalConst(e.xMin),x1=evalConst(e.xMax);if(!isFinite(x0))x0=-10;if(!isFinite(x1))x1=10;if(x1<=x0)x1=x0+1;
  const logX=!!e.logX&&x0>0,logY=!!e.logY,n=clamp(+e.samples||400,20,4000);
  const fns=lines.map(l=>{try{return{f:compileExpr(l.src),label:l.label||l.src}}catch(err){return{f:null,label:l.label||l.src,err:err.message}}});
  const xs=[];for(let i=0;i<=n;i++){const t=i/n;xs.push(logX?Math.pow(10,Math.log10(x0)+t*(Math.log10(x1)-Math.log10(x0))):x0+t*(x1-x0))}
  const ys=fns.map(F=>F.f?xs.map(x=>{let y;try{y=F.f(x)}catch(er){y=NaN}return logY&&!(y>0)?NaN:y}):[]);
  let y0=evalConst(e.yMin),y1=evalConst(e.yMax);
  if(!isFinite(y0)||!isFinite(y1)){const all=[];ys.forEach(a=>a.forEach(v=>{if(isFinite(v))all.push(logY?Math.log10(v):v)}));all.sort((a,b)=>a-b);
    let lo=all.length?all[Math.floor(all.length*.02)]:-1,hi=all.length?all[Math.ceil(all.length*.98)-1]:1;if(all.length<50&&all.length){lo=all[0];hi=all[all.length-1]}
    if(hi-lo<1e-12){lo-=1;hi+=1}const pad=(hi-lo)*.08;if(!isFinite(y0))y0=logY?Math.pow(10,lo-pad):lo-pad;if(!isFinite(y1))y1=logY?Math.pow(10,hi+pad):hi+pad}
  if(y1<=y0)y1=y0+1;
  let top=fs*.5,left=fs*.4,right=fs*.9,bottom=fs*.4,out='';
  if(e.title){LB('title',w/2,top+fs*.8,fs*1.25,e.title,'middle',true);top+=fs*1.9}
  if(e.legend&&fns.length>1){const cw=s=>labW(s,fs)*.85+fs*1.7;const tot=fns.reduce((a,F)=>a+cw(F.label),0);let x=Math.max(left,(w-tot)/2);const y=top+fs*.8;
    fns.forEach((F,i)=>{out+='<rect x="'+f2(x)+'" y="'+f2(y-fs*.38)+'" width="'+f2(fs*.9)+'" height="'+f2(fs*.18)+'" fill="'+col(i)+'"/>';LB('lg'+i,x+fs*1.15,y-fs*.27,fs*.85,F.label);x+=cw(F.label)});top+=fs*1.7}
  const tk=(a,b,lg)=>{if(lg){const lo=Math.floor(Math.log10(a)),hi=Math.ceil(Math.log10(b)),t=[];for(let p=lo;p<=hi;p++){const v=Math.pow(10,p);if(v>=a*0.999&&v<=b*1.001)t.push(v)}return t}return niceTicks(a,b,6).t.filter(v=>v>=a-1e-9*(b-a)&&v<=b+1e-9*(b-a))};
  const yt=tk(y0,y1,logY),xt=tk(x0,x1,logX);
  left+=Math.max(...yt.map(v=>labW(fmtNum(v),fs*.8)))+fs*.6;bottom+=fs*1.5;if(e.yTitle)left+=fs*1.3;if(e.xTitle)bottom+=fs*1.3;
  const px=left,py=top+fs*.4,pw=Math.max(10,w-left-right),ph=Math.max(10,h-py-bottom);
  const X=v=>px+(logX?(Math.log10(v)-Math.log10(x0))/(Math.log10(x1)-Math.log10(x0)):(v-x0)/(x1-x0))*pw;
  const Y=v=>py+ph-(logY?(Math.log10(v)-Math.log10(y0))/(Math.log10(y1)-Math.log10(y0)):(v-y0)/(y1-y0))*ph;
  yt.forEach(v=>{const y=Y(v);if(e.grid)out+=svgLine(px,y,px+pw,y,gridC);out+=T(px-fs*.4,y+fs*.3,fs*.8,fmtNum(v),'end',axisC)});
  xt.forEach(v=>{const x=X(v);if(e.grid)out+=svgLine(x,py,x,py+ph,gridC);out+=T(x,py+ph+fs*1.1,fs*.8,fmtNum(v),'middle',axisC)});
  if(!logY&&y0<0&&y1>0)out+=svgLine(px,Y(0),px+pw,Y(0),axisC);else out+=svgLine(px,py+ph,px+pw,py+ph,axisC);
  if(!logX&&x0<0&&x1>0)out+=svgLine(X(0),py,X(0),py+ph,axisC);else out+=svgLine(px,py,px,py+ph,axisC);
  const cid='fnclip'+e.id;out+='<defs><clipPath id="'+cid+'"><rect x="'+f2(px)+'" y="'+f2(py)+'" width="'+f2(pw)+'" height="'+f2(ph)+'"/></clipPath></defs><g clip-path="url(#'+cid+')">';
  const span=(logY?Math.log10(y1)-Math.log10(y0):y1-y0);
  ys.forEach((arr,i)=>{let d='',pen=false;arr.forEach((y,j)=>{if(!isFinite(y)){pen=false;return}const yy=Y(y);
      if(Math.abs(yy-py-ph/2)>ph*4){pen=false;return}
      if(pen&&j>0&&isFinite(arr[j-1])&&Math.abs(Y(arr[j-1])-yy)>ph*1.5)pen=false;
      d+=(pen?'L':'M')+f2(X(xs[j]))+' '+f2(yy);pen=true});
    out+='<path d="'+d+'" fill="none" stroke="'+col(i)+'" stroke-width="'+f2(Math.max(2,fs*.16))+'" stroke-linejoin="round" stroke-linecap="round"/>'});
  out+='</g>';void span;
  const bad=fns.find(F=>!F.f);if(bad)out+=T(px+8,py+fs,fs*.8,'Erro em "'+bad.label+'": '+bad.err,'start','#c5221f');
  if(e.xTitle)LB('xt',px+pw/2,h-fs*.8,fs*.85,e.xTitle,'middle');
  if(e.yTitle)LB('yt',fs*1.05,py+ph/2,fs*.85,e.yTitle,'middle',false,true);
  return out;
}
function styleChart(d,e){
  styleCommon(d,e);const svg=d.querySelector('svg');svg.style.fontFamily=fontStack(deck.theme.bodyFont);svg.innerHTML=chartSVG(e);
  let L=d.querySelector(':scope>.chl');if(!L){L=document.createElement('div');L.className='chl';d.insertBefore(L,svg.nextSibling)}
  const old={};L.querySelectorAll('[data-k]').forEach(n=>{old[n.dataset.k]=n});const fresh=[];
  chartLabels.forEach(l=>{let n=old[l.k];
    if(n&&n.dataset.t===l.t)delete old[l.k];else{if(n){clearMath(n);n.remove();delete old[l.k]}n=document.createElement('div');n.className='chlab';n.dataset.k=l.k;n.dataset.t=l.t;n.textContent=l.t;L.appendChild(n);fresh.push(n)}
    Object.assign(n.style,{left:f2(l.x)+'px',top:f2(l.y)+'px',fontSize:f2(l.s)+'px',fontWeight:l.b?'700':'400',
      transform:'translate('+(l.a==='middle'?'-50%':l.a==='end'?'-100%':'0')+',-50%)'+(l.r?' rotate(-90deg)':'')})});
  Object.keys(old).forEach(k=>{clearMath(old[k]);old[k].remove()});
  if(fresh.length&&d.isConnected)typeset(fresh);
}
/* ---------- media ---------- */
function ytId(u){const m=String(u||'').match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:null}
function mediaLabel(e){return e.title||((e.kind==='youtube'?'Vídeo do YouTube':e.kind==='audio'?'Áudio':'Vídeo')+(e.url?' · '+e.url.replace(/^https?:\/\//,'').slice(0,48):''))}
function fillMedia(d,e){
  const id=e.kind==='youtube'?ytId(e.url):null,bg=id?' style="background-image:url(https://img.youtube.com/vi/'+id+'/hqdefault.jpg)"':'';
  d.querySelector('.mw').innerHTML='<div class="media-ph"'+bg+'><div class="play"><svg viewBox="0 0 20 20" fill="currentColor">'+
    (e.kind==='audio'?'<path d="M3.5 7.5h3l4-3.5v12l-4-3.5h-3z"/><path d="M13.5 6.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="1.6" fill="none"/>':'<path d="M6.5 4.5l9 5.5-9 5.5z"/>')+
    '</svg></div><div class="cap">'+esc(mediaLabel(e))+'</div></div>';
}
function liveMedia(e){
  if(e.kind==='youtube'){
    const id=ytId(e.url);
    if(!standalone||!id){const a=document.createElement('a');a.className='medialink';a.href=e.url||'#';a.target='_blank';a.rel='noopener';a.textContent=id?'Abrir o vídeo no YouTube':'Vídeo sem link válido';return a}
    const f=document.createElement('iframe');f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
    const p=new URLSearchParams({rel:'0'});if(e.start)p.set('start',Math.floor(e.start));if(e.end)p.set('end',Math.floor(e.end));if(e.autoplay)p.set('autoplay','1');if(e.muted)p.set('mute','1');if(e.loop){p.set('loop','1');p.set('playlist',id)}
    f.src='https://www.youtube.com/embed/'+id+'?'+p;return f;
  }
  const m=document.createElement(e.kind==='audio'?'audio':'video');m.controls=true;m.playsInline=true;m.preload='metadata';m.src=e.src||e.url;m.muted=!!e.muted;m.loop=!!e.loop&&!e.end;
  if(e.start)m.addEventListener('loadedmetadata',()=>{try{m.currentTime=e.start}catch(x){}},{once:true});
  if(e.end)m.addEventListener('timeupdate',()=>{if(m.currentTime>=e.end){if(e.loop){m.currentTime=e.start||0}else m.pause()}});
  if(e.autoplay)m.dataset.autoplay='1';
  return m;
}
function styleInk(d,e){styleCommon(d,e);const svg=d.querySelector('svg');svg.setAttribute('viewBox','0 0 '+e.vw+' '+e.vh);svg.setAttribute('preserveAspectRatio','none');
  svg.style.transform=flipT(e);svg.style.filter=e.shadow?'drop-shadow(0 3px 5px rgba(0,0,0,.35))':'';
  svg.innerHTML=(e.strokes||[]).map(s=>'<path d="'+s.d+'" fill="none" stroke="'+resolveColor(s.c)+'" stroke-width="'+s.w+'" stroke-linecap="round" stroke-linejoin="round"'+(s.op<1?' stroke-opacity="'+s.op+'"':'')+'/>').join('')}
function styleTikz(d,e){styleCommon(d,e);d.style.color=e.themeInk?resolveColor('fg'):'#000000';const w=d.querySelector('.tkw');w.style.transform=flipT(e)}
function fillTikz(d,e){d.classList.toggle('compiling',tikzBusy.has(e.id));d.querySelector('.tkw').innerHTML=e.svg||'<div class="tk-ph"><b>TikZ</b><span>'+(e.err?'Erro: '+esc(e.err.slice(0,160)):'Clique duas vezes para escrever o código')+'</span></div>'}
/* ---------- dispatch ---------- */
function styleEl(d,e){
  switch(e.type){case 'box':styleBox(d,e);break;case 'image':styleImage(d,e);break;case 'line':styleLine(d,e);break;
    case 'table':styleTable(d,e);break;case 'chart':styleChart(d,e);break;case 'ink':styleInk(d,e);break;case 'tikz':styleTikz(d,e);break;case 'media':styleCommon(d,e);break}
}
function fillEl(d,e,interactive){
  if(e.type==='box'){const tx=d.querySelector('.tx');clearMath(tx);const auto=e.role==='refs'||e.role==='toc';tx.innerHTML=auto?autoHTML(e.role):xform(e.html||'',e.id);tx.classList.toggle('ph',!auto&&!!e.role&&isEmptyHTML(e.html))}
  else if(e.type==='image'){const im=d.querySelector('.iw img');if(im.getAttribute('src')!==e.src)im.src=e.src;const gh=d.querySelector('.ghost');if(gh&&gh.getAttribute('src')!==e.src)gh.src=e.src}
  else if(e.type==='table')fillTable(d,e,interactive);
  else if(e.type==='media')fillMedia(d,e);
  else if(e.type==='tikz')fillTikz(d,e);
}
function makeEl(e,interactive){
  const d=document.createElement('div');d.className='el '+e.type;d.dataset.id=e.id;
  switch(e.type){
    case 'box':d.innerHTML='<svg class="shp" xmlns="http://www.w3.org/2000/svg"></svg><div class="tx"></div>';break;
    case 'image':d.innerHTML='<div class="iw"><img alt="" draggable="false"></div>'+(interactive?'<img class="ghost" alt="" draggable="false">':'');break;
    case 'line':case 'chart':case 'ink':d.innerHTML='<svg xmlns="http://www.w3.org/2000/svg"></svg>';break;
    case 'table':d.innerHTML='<div class="tbw"></div>';break;
    case 'media':d.innerHTML='<div class="mw"></div>';break;
    case 'tikz':d.innerHTML='<div class="tkw"></div>';break;
  }
  if(interactive)d.insertAdjacentHTML('beforeend',e.type==='line'?'<div class="h pt" data-dir="p1"></div><div class="h pt" data-dir="p2"></div>':
    ['nw','n','ne','e','se','s','sw','w','rot'].map(k=>'<div class="h '+k+'" data-dir="'+k+'"></div>').join(''));
  fillEl(d,e,interactive);styleEl(d,e);return d;
}
function fitEl(e,d,mutate){if(!e||!d)return;if(e.type==='box')fitBox(e,d,mutate);else if(e.type==='table')fitTable(e,d,mutate)}
function fitNode(n,s,mutate){if(!n||!n.isConnected)return;s.els.forEach(e=>{if(e.type==='box'||e.type==='table'){const d=n.querySelector('[data-id="'+e.id+'"]');if(d&&e.id!==editId)fitEl(e,d,mutate)}})}
function slideBgCss(n,s){
  const t=deck.theme;let img=null,fit='cover';
  if(s.bgImage){img=s.bgImage;fit=s.bgFit}else if(!s.bg&&t.bgImage){img=t.bgImage;fit=t.bgFit}
  n.style.backgroundColor=s.bg||t.bg;n.style.backgroundImage=img?'url("'+img+'")':'';n.style.backgroundSize=fit==='stretch'?'100% 100%':(fit||'cover');
}
const NUM_POS={br:'Inferior direito',bc:'Inferior central',bl:'Inferior esquerdo',tr:'Superior direito',tc:'Superior central',tl:'Superior esquerdo'};
function styleSlnum(k,t){
  const pos=t.numPos||'br',m=t.numBgOn?24:34,v=t.numBgOn?16:20;Object.assign(k.style,{left:'auto',right:'auto',top:'auto',bottom:'auto',transform:'',whiteSpace:'nowrap',lineHeight:'1.2'});
  if(pos[0]==='b')k.style.bottom=v+'px';else k.style.top=v+'px';
  if(pos[1]==='r')k.style.right=m+'px';else if(pos[1]==='l')k.style.left=m+'px';else{k.style.left='50%';k.style.transform='translateX(-50%)'}
  k.style.fontSize=(+t.numSize||16)+'px';k.style.fontFamily=t.numFont?fontStack(t.numFont):'';k.style.fontWeight=t.numBold?'700':'';
  k.style.color=t.numColor?resolveColor(t.numColor):(t.numBgOn?'#ffffff':resolveColor('muted'));
  k.style.background=t.numBgOn?resolveColor(t.numBgColor||'accent'):'';k.style.padding=t.numBgOn?'.18em .7em':'';k.style.borderRadius=t.numBgOn?(t.numBgShape==='square'?'.25em':'999px'):'';
}
function renderSlideNode(s,i,mode){
  const n=document.createElement('div'),t=deck.theme;n.className='slide';
  n.style.width=W+'px';n.style.height=H+'px';slideBgCss(n,s);
  n.style.color=t.fg;n.style.fontFamily=fontStack(t.bodyFont);n.style.setProperty('--accent',t.accent);
  if(s!==deck.master&&!s.hideMaster)deck.master.els.forEach(e=>{const d=makeEl(e,false);d.classList.add('mst');d.removeAttribute('data-id');d.dataset.mid=e.id;n.appendChild(d)});
  s.els.forEach(e=>{const d=makeEl(e,mode==='edit');if(mode!=='edit'&&e.link)d.dataset.link=JSON.stringify(e.link);n.appendChild(d)});
  if(t.showNumbers&&s!==deck.master&&i>0){const k=document.createElement('div');k.className='slnum';k.textContent=t.numFormat==='nN'?(i+1)+' / '+deck.slides.length:String(i+1);styleSlnum(k,t);n.appendChild(k)}
  if(s!==deck.master&&i>=0){
    if(t.progress==='bar'){const b=document.createElement('div');b.className='progbar';b.style.width=((i+1)/deck.slides.length*100)+'%';b.style.background=t.accent;n.appendChild(b)}
    if(t.refFooter){const keys=slideCites(s);if(keys.length){const f=document.createElement('div');f.className='reffoot';f.style.color=resolveColor('muted');
      f.innerHTML=keys.map(k=>{const r=refByKey(k);return '<div>['+citeNum(k)+'] '+(r?esc(refShort(r)):'Referência "'+esc(k)+'" não encontrada')+'</div>'}).join('');n.appendChild(f)}}
  }
  return n;
}
