/* ================= slides ================= */
const selSlideIdxs=()=>deck.slides.map((s,i)=>slideSel.has(s.id)?i:-1).filter(i=>i>=0);
function cloneSlide(s){const c=JSON.parse(JSON.stringify(s));c.id=uid();const map={};c.els.forEach(e=>{const n=uid();map[e.id]=n;e.mk=e.mk||e.id;e.id=n});
  c.els.forEach(e=>{if(e.type==='line'){['a1','a2'].forEach(k=>{if(e[k])e[k]=map[e[k].id]?{id:map[e[k].id],side:e[k].side}:null})}});return c}
function addSlide(layout){
  if(editId)exitEdit();if(masterMode)exitMaster();thumbSoon.flush();
  const curL=deck.slides[cur].layout;layout=layout||(curL==='title'||curL==='section'||curL==='blank'?'titleBody':curL||'titleBody');
  deck.slides.splice(cur+1,0,makeSlide(LAYOUTS[layout]?layout:'titleBody'));rebuildThumbs();goto(cur+1);commit();
}
function dupSlides(){
  if(editId)exitEdit();thumbSoon.flush();const idx=selSlideIdxs();const copies=idx.map(i=>cloneSlide(deck.slides[i]));const at=Math.max(...idx)+1;
  deck.slides.splice(at,0,...copies);slideSel.clear();copies.forEach(c=>slideSel.add(c.id));cur=at;rebuildThumbs();goto(at,true);commit();
}
function delSlides(){
  const idx=selSlideIdxs();if(idx.length>=deck.slides.length){toast('A apresentação precisa de pelo menos um slide.');return}
  if(editId)exitEdit(true);const ids=new Set(idx.map(i=>deck.slides[i].id));
  deck.slides=deck.slides.filter(s=>!ids.has(s.id));deck.comments=deck.comments.filter(c=>!ids.has(c.slideId));
  cur=Math.min(idx[0],deck.slides.length-1);slideSel.clear();rebuildThumbs();goto(cur);commit();updateCommentCount();
}
function moveSlidesTo(ids,to){
  if(editId)exitEdit();thumbSoon.flush();
  const moving=deck.slides.filter(s=>ids.includes(s.id));if(!moving.length)return;
  const before=deck.slides.slice(0,to).filter(s=>!ids.includes(s.id)).length,rest=deck.slides.filter(s=>!ids.includes(s.id));
  rest.splice(before,0,...moving);
  if(rest.every((s,i)=>s===deck.slides[i]))return;
  deck.slides=rest;cur=deck.slides.indexOf(moving[0]);rebuildThumbs();goto(cur,true);commit();
}
function moveSlides(where){
  const idx=selSlideIdxs(),ids=idx.map(i=>deck.slides[i].id);let to;
  if(where==='up')to=Math.max(0,idx[0]-1);else if(where==='down')to=Math.min(deck.slides.length,idx[idx.length-1]+2);else if(where==='top')to=0;else to=deck.slides.length;
  moveSlidesTo(ids,to);
}
function toggleSkip(){const idx=selSlideIdxs();const v=!deck.slides[idx[0]].skip;idx.forEach(i=>{deck.slides[i].skip=v});rebuildThumbs();commit();
  toast(v?(idx.length>1?'Slides ignorados':'Slide ignorado')+' na apresentação.':(idx.length>1?'Slides reativados.':'Slide reativado.'))}
function applyLayoutTo(s,key){
  const tpl=layoutEls(key),used=new Set();
  tpl.forEach(t=>{const ex=s.els.find(e=>e.type==='box'&&e.role===t.role&&!used.has(e.id));
    if(ex){used.add(ex.id);Object.assign(ex,{x:t.x,y:t.y,w:t.w,h:t.h,align:t.align,valign:t.valign,size:t.size,fit:t.fit})}else{used.add(t.id);s.els.push(t)}});
  s.els=s.els.filter(e=>!(e.role&&!used.has(e.id)&&isEmptyHTML(e.html)));s.layout=key;
}
function applyLayout(key){if(editId)exitEdit();const targets=masterMode?[]:deck.slides.filter(s=>slideSel.has(s.id));targets.forEach(s=>applyLayoutTo(s,key));
  renderStage();if(targets.length>1)rebuildThumbs();else thumbSoon();commit()}
function resetSlide(){if(masterMode)return;deck.slides.filter(s=>slideSel.has(s.id)).forEach(s=>applyLayoutTo(s,s.layout||'blank'));renderStage();rebuildThumbs();commit();toast('Posições redefinidas pelo layout.')}
function slidesForBg(){return masterMode?[deck.master]:deck.slides.filter(s=>slideSel.has(s.id))}
function setSlideBg(c){slidesForBg().forEach(s=>{s.bg=c;if(c)s.bgImage=null});renderStage();if(slideSel.size>1)rebuildThumbs();else thumbSoon();commit()}
function resetSlideBg(){slidesForBg().forEach(s=>{s.bg=null;s.bgImage=null});renderStage();rebuildThumbs();commit()}
let bgTarget='slide';
function pickBgImage(target){bgTarget=target||'slide';$('#bgFile').click()}
$('#bgFile').addEventListener('change',ev=>{const f=ev.target.files[0];ev.target.value='';if(!f)return;
  readImage(f,src=>{if(bgTarget==='theme'){deck.theme.bgImage=src;deck.theme.bgFit=deck.theme.bgFit||'cover'}else slidesForBg().forEach(s=>{s.bgImage=src});rerenderAll();renderSide();commit()})});
function changeSize(w,h,name,scaleContent){
  w=Math.round(clamp(w,200,4000));h=Math.round(clamp(h,200,4000));if(editId)exitEdit();
  if(scaleContent){const sx=w/W,sy=h/H,sc=e=>{if(e.type==='line'){e.x1=Math.round(e.x1*sx);e.x2=Math.round(e.x2*sx);e.y1=Math.round(e.y1*sy);e.y2=Math.round(e.y2*sy)}
      else{e.x=Math.round(e.x*sx);e.y=Math.round(e.y*sy);e.w=Math.round(e.w*sx);e.h=Math.round(e.h*sy);if(e.type==='table')e.rowH=e.rowH.map(v=>Math.round(v*sy))}};
    deck.slides.forEach(s=>s.els.forEach(sc));deck.master.els.forEach(sc);deck.guides.v=deck.guides.v.map(v=>Math.round(v*sx));deck.guides.h=deck.guides.h.map(v=>Math.round(v*sy))}
  deck.size={w:w,h:h,name:name||''};setSizeGlobals();rerenderAll();commit();toast('Tamanho da página: '+w+' × '+h+' px.');
}

/* ================= comments ================= */
function updateCommentCount(){const n=deck.comments.filter(c=>!c.resolved).length;$('#cmtCount').textContent=n?n:'';drawCommentBadges()}
let commentDraftFor=null;
function startComment(){if(masterMode){toast('Comentários ficam nos slides, não no mestre.');return}const e=selEls()[0];commentDraftFor={slideId:slide().id,elId:e?e.id:null};openSide('comments',true);
  setTimeout(()=>{const t=$('#cmtNew');if(t)t.focus()},30)}
function addComment(text){if(!text.trim())return;const c={id:uid(),slideId:commentDraftFor?commentDraftFor.slideId:slide().id,elId:commentDraftFor?commentDraftFor.elId:null,text:text.trim(),time:Date.now(),resolved:false,replies:[]};
  deck.comments.push(c);commentDraftFor=null;commit();updateCommentCount();rebuildThumbsSoon();renderSide()}

/* ================= find and replace ================= */
const findState={q:'',r:'',cs:false,notes:true,results:[],idx:-1};
function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function findAll(){
  const out=[];const q=findState.q;if(!q)return out;const re=new RegExp(escRe(q),findState.cs?'g':'gi');
  const scan=(html,where)=>{const t=textOf(html);let m;re.lastIndex=0;while((m=re.exec(t))){out.push(Object.assign({text:t,at:m.index,len:m[0].length},where));if(!m[0].length)break}};
  deck.slides.forEach((s,si)=>{s.els.forEach(e=>{if(e.type==='box')scan(e.html,{si:si,el:e.id});else if(e.type==='table')e.cells.forEach((row,r)=>row.forEach((c,cc)=>{if(!c.hide)scan(c.html,{si:si,el:e.id,cell:{r:r,c:cc}})}))});
    if(findState.notes&&s.notes)scan(esc(s.notes),{si:si,notes:true})});
  return out;
}
function replaceInHTML(html,once){
  const re=new RegExp(escRe(findState.q),findState.cs?(once?'':'g'):(once?'i':'gi'));let done=false,count=0;
  const d=document.createElement('div');d.innerHTML=html||'';
  const w=document.createTreeWalker(d,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{if(once&&done)return;const v=n.nodeValue.replace(re,()=>{count++;done=true;return findState.r});if(v!==n.nodeValue)n.nodeValue=v});
  return{html:d.innerHTML,count:count};
}
function replaceAll(){
  if(!findState.q)return;if(editId)exitEdit();let n=0;
  deck.slides.forEach(s=>{s.els.forEach(e=>{if(e.type==='box'){const r=replaceInHTML(e.html);e.html=r.html;n+=r.count}else if(e.type==='table')e.cells.forEach(row=>row.forEach(c=>{if(!c.hide){const r=replaceInHTML(c.html);c.html=r.html;n+=r.count}}))});
    if(findState.notes&&s.notes){const re=new RegExp(escRe(findState.q),findState.cs?'g':'gi');s.notes=s.notes.replace(re,()=>{n++;return findState.r})}});
  rerenderAll();commit();toast(n?n+' substituições feitas.':'Nada encontrado.');renderSide();
}
function replaceOne(){
  const res=findState.results[findState.idx];if(!res){toast('Escolha um resultado na lista.');return}if(editId)exitEdit();
  const s=deck.slides[res.si];
  if(res.notes){const re=new RegExp(escRe(findState.q),findState.cs?'':'i');s.notes=s.notes.replace(re,findState.r)}
  else{const e=s.els.find(x=>x.id===res.el);if(!e)return;if(res.cell){const c=e.cells[res.cell.r][res.cell.c];c.html=replaceInHTML(c.html,true).html}else e.html=replaceInHTML(e.html,true).html}
  if(res.si===cur)renderStage();rebuildThumbs();commit();renderSide();
}
function gotoResult(i){const res=findState.results[i];if(!res)return;findState.idx=i;if(cur!==res.si||masterMode)goto(res.si);
  if(res.el){const e=byId(res.el);if(e){select([e.id]);if(res.cell){cellSel={r0:res.cell.r,c0:res.cell.c,r1:res.cell.r,c1:res.cell.c};markCells()}}}
  else{const nt=$('#notes');nt.focus();nt.setSelectionRange(res.at,res.at+res.len)}
  renderSide();
}

/* ================= library and versions ================= */
function openDeck(d,msg){
  if(editId)exitEdit(true);commitSoon.flush();saveSoon.flush();
  FS.handle=null;FS.deckId=null;
  try{d=normalize(d)}catch(e){toast('Não reconheci esse conteúdo como uma apresentação do Lousa TeX.');return}
  deck=d;cur=0;selIds=[];masterMode=false;slideSel.clear();slideSel.add(deck.slides[0].id);setSizeGlobals();
  $('#deckTitle').value=deck.title;applyPreamble();rerenderAll();renderToolbar();renderSide();updateCommentCount();resetHistory();saveDeckNow();addVersion('',true);
  closeModal();if(msg)toast(msg);
}
function newDeck(){openDeck({version:3,id:uid(),title:i18n('Apresentação sem título'),size:Object.assign({},deck.size),theme:Object.assign({},deck.theme),preamble:deck.preamble,slides:[makeSlide('title')]},'Nova apresentação criada.')}
function copyDeck(src){const d=JSON.parse(JSON.stringify(src||deck));d.id=uid();d.title=i18n('Cópia de')+' '+(d.title||i18n('apresentação'));d.comments=[];openDeck(d,'Cópia criada e aberta.')}
function deleteDeckFromLib(id){lsDel(KEY_DECK+id);lsDel(KEY_VER+id);libSave(libList().filter(x=>x.id!==id))}
function parseDeckText(text){let d;text=String(text||'');
  if(/^\s*</.test(text)){const m=/<script type="application\/json" id="lousa-deck">([\s\S]*?)<\/script>/.exec(text);if(!m)return null;text=m[1]}
  try{d=JSON.parse(text)}catch(e){return null}return d&&Array.isArray(d.slides)?d:null}
$('#deckFile').addEventListener('change',ev=>{const f=ev.target.files[0];ev.target.value='';if(!f)return;const fr=new FileReader();
  fr.onload=()=>{const d=parseDeckText(fr.result);if(!d){toast('Não reconheci esse arquivo como uma apresentação do Lousa TeX.');return}
    if(deckFileMode==='import'){importSource=normalize(d);openImportModal(true)}else{d.id=uid();openDeck(d,'Apresentação aberta.')}};fr.readAsText(f)});
let deckFileMode='open',importSource=null;
function openFilePicker(mode){deckFileMode=mode||'open';$('#deckFile').click()}

/* ================= export ================= */
function htmlToLatex(html){
  const d=document.createElement('div');d.innerHTML=html||'';
  const escT=s=>{let out='',last=0;s.replace(MATH_RE,(m,off)=>{out+=escText(s.slice(last,off))+m;last=off+m.length;return m});return out+escText(s.slice(last))};
  const escText=s=>s.replace(/\\/g,'\\textbackslash{}').replace(/([&%#_{}])/g,'\\$1').replace(/~/g,'\\textasciitilde{}').replace(/\^/g,'\\textasciicircum{}').replace(/\u00a0/g,'~');
  const walk=n=>{
    if(n.nodeType===3)return escT(n.nodeValue);if(n.nodeType!==1)return '';
    const inner=Array.from(n.childNodes).map(walk).join('');
    switch(n.tagName){
      case 'B':return '\\textbf{'+inner+'}';case 'I':return '\\emph{'+inner+'}';case 'U':return '\\underline{'+inner+'}';case 'S':return inner;
      case 'SUB':return '\\textsubscript{'+inner+'}';case 'SUP':return '\\textsuperscript{'+inner+'}';case 'BR':return '\\\\\n';
      case 'A':{const h=n.getAttribute('href')||'';if(h.indexOf('#slide:')===0)return inner;return '\\href{'+h.replace(/([%#])/g,'\\$1')+'}{'+inner+'}'}
      case 'SPAN':{const c=n.style.color;return c?'\\textcolor[HTML]{'+toHex(c).slice(1).toUpperCase()+'}{'+inner+'}':inner}
      case 'UL':return '\n\\begin{itemize}\n'+Array.from(n.children).map(li=>'  \\item '+walk(li).trim()).join('\n')+'\n\\end{itemize}\n';
      case 'OL':return '\n\\begin{enumerate}\n'+Array.from(n.children).map(li=>'  \\item '+walk(li).trim()).join('\n')+'\n\\end{enumerate}\n';
      case 'LI':return inner;case 'DIV':return inner.trim()?inner+'\n\n':'';
    }
    return inner;
  };
  return Array.from(d.childNodes).map(walk).join('').replace(/\n{3,}/g,'\n\n').trim();
}
function tableToLatex(e){
  const cols=e.cols,spec='|'+e.colW.map(f=>'p{'+(f*.95).toFixed(2)+'\\linewidth}').join('|')+'|';
  let s='\\begin{tabular}{'+spec+'}\n\\hline\n';
  for(let r=0;r<e.rows;r++){const parts=[];for(let c=0;c<cols;c++){const x=e.cells[r][c];if(x.hide){const a=anchorOf(e,r,c);if(a[0]<r&&a[1]===c)parts.push('');continue}
      let t=htmlToLatex(x.html).replace(/\n+/g,' ');if(e.header&&r===0)t='\\textbf{'+t+'}';if(x.cs>1)t='\\multicolumn{'+x.cs+'}{|c|}{'+t+'}';if(x.rs>1)t='\\multirow{'+x.rs+'}{*}{'+t+'}';parts.push(t)}
    s+=parts.join(' & ')+' \\\\ \\hline\n'}
  return s+'\\end{tabular}';
}
function beamerTikzPreamble(){
  const tk=[];deck.slides.forEach(s=>s.els.forEach(e=>{if(e.type==='tikz')tk.push(e)}));const fn=deck.slides.some(s=>s.els.some(e=>e.type==='chart'&&e.kind==='fn'));
  const imp=deck.texPkgs.map(c=>'% Pacote '+c.name+' (importado no Lousa TeX)\n\\makeatletter\n'+c.code+'\n\\makeatother\n').join('');
  if(!tk.length&&!fn)return imp;
  const pk=new Set(['tikz']),libs=new Set(),custom=new Set();if(fn)pk.add('pgfplots');
  tk.forEach(e=>{(e.pkgs||[]).forEach(n=>{if(TIKZ_NATIVE[n]||n==='tikz-feynman')pk.add(n);else custom.add(n)});String(e.libs||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(l=>libs.add(l))});
  let out='\\usepackage{'+Array.from(pk).join(',')+'}\n';if(pk.has('pgfplots'))out+='\\pgfplotsset{compat=1.18}\n';if(libs.size)out+='\\usetikzlibrary{'+Array.from(libs).join(',')+'}\n';
  out+=imp;void custom;
  if(pk.has('tikz-feynman'))out+='% tikz-feynman: para posicionamento automático compile com LuaLaTeX\n';
  return out;
}
function beamerBib(){const pl=plan();const keys=pl.cites.length?pl.cites:deck.refs.map(r=>r.key);if(!keys.length)return '';
  return '\\begin{thebibliography}{'+keys.length+'}\n'+keys.map(k=>{const r=refByKey(k);return '\\bibitem{'+k+'} '+(r?htmlToLatex(esc(refFull(r))):k)}).join('\n')+'\n\\end{thebibliography}'}
function fnToPgf(e){const lines=String(e.fns||'').split('\n').map(l=>l.trim()).filter(Boolean);
  return '\\begin{center}\n\\begin{tikzpicture}\n\\begin{axis}[width=0.8\\linewidth,height=0.55\\textheight,trig format plots=rad,domain='+e.xMin+':'+e.xMax+',samples=200'+(e.yMin!==''?',ymin='+e.yMin:'')+(e.yMax!==''?',ymax='+e.yMax:'')+
    (e.xTitle?',xlabel={'+e.xTitle+'}':'')+(e.yTitle?',ylabel={'+e.yTitle+'}':'')+(e.title?',title={'+e.title+'}':'')+(e.grid?',grid=major':'')+(e.logY?',ymode=log':'')+(e.logX?',xmode=log':'')+(lines.length>1&&e.legend?',legend pos=outer north east':'')+']\n'+
    lines.map(l=>{const k=l.indexOf('|'),f=(k>=0?l.slice(0,k):l).trim(),lab=k>=0?l.slice(k+1).trim():'';return '  \\addplot[thick] {'+f.replace(/\bpi\b/g,'pi').replace(/\bln\(/g,'ln(')+'};'+(lab&&e.legend&&lines.length>1?'\\addlegendentry{'+lab+'}':'')}).join('\n')+'\n\\end{axis}\n\\end{tikzpicture}\n\\end{center}'}
function exportBeamer(){
  if(editId)exitEdit();
  const ratio=Math.abs(W/H-16/9)<.05?'169':Math.abs(W/H-16/10)<.05?'1610':Math.abs(W/H-4/3)<.05?'43':'169';
  let s='% Exportado do Lousa TeX em '+new Date().toLocaleString('pt-BR')+'\n\\documentclass[aspectratio='+ratio+']{beamer}\n\\usepackage['+(LANG==='en'?'english':'brazil')+']{babel}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n'+
    '\\usepackage{amsmath,amssymb,braket,cancel,multirow,xcolor,hyperref'+((deck.packages||[]).length?','+deck.packages.join(','):'')+'}\n\\usetheme{default}\n\\setbeamertemplate{navigation symbols}{}\n'+(deck.theme.showNumbers?'\\setbeamertemplate{footline}[frame number]\n':'')+
    beamerTikzPreamble()+(deck.preamble?'% Preâmbulo do Lousa TeX\n'+deck.preamble+'\n':'')+'\\title{'+htmlToLatex(esc(deck.title))+'}\n\\date{}\n\n\\begin{document}\n';
  deck.slides.forEach((sl,i)=>{
    if(sl.skip)s+='% (slide ignorado na apresentação)\n';
    const title=sl.els.find(e=>e.type==='box'&&e.role==='title');
    const rest=sl.els.filter(e=>e!==title).slice().sort((a,b)=>(bb(a).y-bb(b).y)||(bb(a).x-bb(b).x));
    if(sl.layout==='section'&&title)s+='\n\\section{'+htmlToLatex(title.html).replace(/\n+/g,' ')+'}';
    s+='\n% ---- Slide '+(i+1)+' ----\n\\begin{frame}'+(title&&!isEmptyHTML(title.html)?'{'+htmlToLatex(title.html).replace(/\n+/g,' ')+'}':'')+'\n';
    rest.forEach(e=>{
      if(e.type==='box'&&e.role==='refs'){s+=beamerBib()+'\n';return}
      if(e.type==='box'&&e.role==='toc'){s+='\\tableofcontents\n';return}
      if(e.type==='tikz'){s+='\\begin{center}\n'+(e.code||'')+'\n\\end{center}\n\n';return}
      if(e.type==='chart'&&e.kind==='fn'){s+=fnToPgf(e)+'\n';return}
      if(e.type==='box'&&!isEmptyHTML(e.html)){let t=htmlToLatex(e.html);if(e.anim&&e.anim.byPara)t=t.replace(/\\begin\{(itemize|enumerate)\}/g,'\\begin{$1}[<+->]');
        s+=(e.align==='center'?'\\begin{center}\n'+t+'\n\\end{center}':t)+'\n\n'}
      else if(e.type==='table')s+='\\begin{center}\n'+tableToLatex(e)+'\n\\end{center}\n\n';
      else if(e.type==='image')s+='% Imagem: salve-a como arquivo e use \\includegraphics[width=0.5\\linewidth]{imagem}\n';
      else if(e.type==='chart')s+='% Gráfico "'+(e.title||CHART_KINDS[e.kind])+'": recrie com pgfplots ou insira como imagem\n';
      else if(e.type==='media')s+='% Mídia: '+(e.url||e.title||'arquivo local')+'\n';
    });
    if(sl.notes)s+='\\note{'+htmlToLatex(esc(sl.notes)).replace(/\n+/g,' \\\\ ')+'}\n';
    s+='\\end{frame}\n';
  });
  if(deck.refs.length&&!deck.slides.some(x=>x.els.some(e=>e.role==='refs')))s+='\n\\begin{frame}[allowframebreaks]{Referências}\n'+beamerBib()+'\n\\end{frame}\n';
  s+='\n\\end{document}\n';
  saveFile(slug(deck.title)+'.tex',s,'application/x-tex');
}
function exportText(){
  if(editId)exitEdit();let s=deck.title+'\n'+'='.repeat(Math.min(60,deck.title.length))+'\n';
  deck.slides.forEach((sl,i)=>{s+='\n--- Slide '+(i+1)+(sl.skip?' (ignorado)':'')+' ---\n';
    sl.els.slice().sort((a,b)=>(bb(a).y-bb(b).y)||(bb(a).x-bb(b).x)).forEach(e=>{
      if(e.type==='box'&&!isEmptyHTML(e.html))s+=htmlText(e.html)+'\n';
      else if(e.type==='table')s+=e.cells.map(row=>row.filter(c=>!c.hide).map(c=>textOf(c.html).trim()).join('\t')).join('\n')+'\n';
      else if(e.type==='chart')s+='[Gráfico] '+(e.title||'')+'\n'+e.data+'\n'});
    if(sl.notes)s+='\nAnotações: '+sl.notes+'\n'});
  saveFile(slug(deck.title)+'.txt',s,'text/plain;charset=utf-8');
}
function htmlText(html){const d=document.createElement('div');d.innerHTML=html;d.querySelectorAll('li').forEach(li=>li.insertAdjacentText('afterbegin','• '));
  return Array.from(d.querySelectorAll(':scope > div, li')).map(n=>n.tagName==='LI'?n.textContent:n.textContent).filter(t=>t.trim()).join('\n')||d.textContent}
function exportJSON(){if(editId)exitEdit();commitSoon.flush();saveFile(slug(deck.title)+'.lousa',JSON.stringify(deck),'application/json')}
function printDeck(withNotes){
  if(editId)exitEdit();thumbSoon.flush();
  chain.then(()=>{const p=$('#print');p.innerHTML='';
    Array.from(thumbsEl.children).forEach((b,i)=>{const s=b.querySelector('.slide');if(!s)return;const c=s.cloneNode(true);c.style.transform='none';
      if(withNotes){const pg=document.createElement('div');pg.className='npage';const k=Math.min(1,(793-106)/W);const box=document.createElement('div');box.className='nslide';box.style.width=W*k+'px';box.style.height=H*k+'px';
        c.style.transform='scale('+k+')';box.appendChild(c);pg.innerHTML='<h4>Slide '+(i+1)+'</h4>';pg.appendChild(box);const nt=document.createElement('div');nt.className='ntext';nt.textContent=deck.slides[i].notes||'';pg.appendChild(nt);p.appendChild(pg)}
      else{const pg=document.createElement('div');pg.className='ppage';pg.appendChild(c);p.appendChild(pg)}});
    const st=$('#dynStyle');const base=st.textContent;if(withNotes)st.textContent=base.replace(/@page\{size:[^}]*\}/,'@page{size:A4 portrait;margin:0}');
    window.print();if(withNotes)setTimeout(()=>{st.textContent=base},500);
  });
}
window.addEventListener('afterprint',()=>{$('#print').innerHTML='';setSizeGlobals()});
