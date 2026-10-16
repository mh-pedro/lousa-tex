/* ================= text editing (boxes and table cells) ================= */
const editEl=()=>editId?byId(editId):null;
function txOf(e,cell){const d=elDom(e);if(!d)return null;return cell?d.querySelector('.tx[data-r="'+cell.r+'"][data-c="'+cell.c+'"]'):d.querySelector('.tx')}
const curTx=()=>{const e=editEl();return e?txOf(e,editCell):null};
function caretAt(x,y){
  let r=null;
  if(document.caretRangeFromPoint)r=document.caretRangeFromPoint(x,y);
  else if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);if(p){r=document.createRange();r.setStart(p.offsetNode,p.offset);r.collapse(true)}}
  return r;
}
function placeEnd(tx){const r=document.createRange();let n=tx;while(n.lastChild&&n.lastChild.nodeType===1&&n.lastChild.tagName!=='BR')n=n.lastChild;r.selectNodeContents(n);r.collapse(false);return r}
function firstVisibleCell(e){for(let r=0;r<e.rows;r++)for(let c=0;c<e.cols;c++)if(!e.cells[r][c].hide)return{r:r,c:c};return{r:0,c:0}}
function cellAtPoint(e,x,y){const d=elDom(e);if(!d)return null;const el=document.elementFromPoint(x,y);const td=el&&el.closest&&el.closest('td');if(!td||!d.contains(td))return null;return{r:+td.dataset.r,c:+td.dataset.c}}
function enterEdit(e,where,cell){
  if(!e||e.locked||(e.type!=='box'&&e.type!=='table'))return;
  if(e.role==='refs'||e.role==='toc'){toast(e.role==='refs'?'Esta lista é gerada a partir das citações. Use Inserir › Referências bibliográficas.':'O sumário é gerado a partir dos slides com layout "Cabeçalho de seção".');return}
  if(e.type==='table'){if(!cell)cell=firstVisibleCell(e);if(e.cells[cell.r][cell.c].hide){const a=anchorOf(e,cell.r,cell.c);cell={r:a[0],c:a[1]}}}else cell=null;
  if(editId&&(editId!==e.id||JSON.stringify(editCell)!==JSON.stringify(cell)))exitEdit();
  if(cropId)exitCrop();
  setTool(null,true);selIds=[e.id];editId=e.id;editCell=cell;cellSel=cell?{r0:cell.r,c0:cell.c,r1:cell.r,c1:cell.c}:null;
  const d=elDom(e),tx=txOf(e,cell);if(!d||!tx){editId=null;editCell=null;return}
  clearMath(tx);tx.innerHTML=(cell?e.cells[cell.r][cell.c].html:e.html)||'';tx.classList.add('tex2jax_ignore');
  tx.contentEditable='true';tx.spellcheck=!!prefs.spell;tx.lang='pt-BR';d.classList.add('editing');markSel();
  tx.focus({preventScroll:true});
  let r=null;
  if(where&&where.x!=null){r=caretAt(where.x,where.y);if(r&&!tx.contains(r.startContainer))r=null}
  if(!r){if(where==='all'){r=document.createRange();r.selectNodeContents(tx)}else r=placeEnd(tx)}
  const s=getSelection();s.removeAllRanges();s.addRange(r);savedRange=r.cloneRange();
  fitEl(e,d,true);renderToolbar();schedulePreview();
}
function exitEdit(noCommit){
  if(!editId)return;const id=editId,cell=editCell;editId=null;editCell=null;hidePreview();
  const e=byId(id),d=elDom(e);if(!e||!d){markSel();return}
  const tx=txOf(e,cell);if(!tx){markSel();return}
  fixFontTags(tx,e.size);pendingSize=null;
  const html=sanitizeHTML(tx.innerHTML),clean=isEmptyHTML(html)?'':html;
  tx.removeAttribute('contenteditable');tx.classList.remove('tex2jax_ignore');d.classList.remove('editing','newempty');
  if(tx.contains(document.activeElement))tx.blur();
  if(cell){e.cells[cell.r][cell.c].html=clean;clearMath(tx);tx.innerHTML=clean;typeset([tx]).then(()=>{fitTable(e,d,true);drawOverlay();thumbSoon()})}
  else{
    e.html=clean;invalidatePlan();
    if(!e.html&&e.shape==='text'&&!e.role){slide().els=slide().els.filter(x=>x!==e);d.remove();selIds=selIds.filter(x=>x!==id)}
    else{fillEl(d,e);styleBox(d,e);typeset([d]).then(()=>{fitBox(e,d,true);drawOverlay();thumbSoon()})}
  }
  markSel();
  if(!noCommit){commit();thumbSoon();renderToolbar()}
}
document.addEventListener('selectionchange',()=>{
  if(!editId)return;const s=getSelection();if(!s.rangeCount)return;const r=s.getRangeAt(0),tx=curTx();
  if(tx&&tx.contains(r.commonAncestorContainer)){savedRange=r.cloneRange();toolbarStateSoon()}
});
function restoreSel(){const tx=curTx();if(!tx)return false;tx.focus({preventScroll:true});if(savedRange&&tx.contains(savedRange.commonAncestorContainer)){const s=getSelection();s.removeAllRanges();s.addRange(savedRange)}return true}
function afterEditChange(){
  const e=editEl();if(!e)return;const tx=curTx(),d=elDom(e);fixFontTags(tx,e.size);
  if(e.type==='box'){fitBox(e,d,true);if(tx)tx.classList.toggle('ph',!!e.role&&!tx.textContent.length)}else fitTable(e,d,true);
  const s=getSelection();if(s.rangeCount)savedRange=s.getRangeAt(0).cloneRange();
  schedulePreview();toolbarStateSoon();overlaySoon();
}
function exec(cmd,val){
  if(!restoreSel())return;
  document.execCommand('styleWithCSS',false,true);
  if(cmd==='fontSizePx'){pendingSize=val;document.execCommand('fontSize',false,'7');fixFontTags(curTx(),editEl().size)}
  else document.execCommand(cmd,false,val==null?null:val);
  afterEditChange();
}
/* operations on whole elements (no caret) */
function textTargets(e){
  const d=elDom(e);if(!d)return[];
  if(e.type==='table')return selectedCells(e).map(([r,c])=>({tx:d.querySelector('.tx[data-r="'+r+'"][data-c="'+c+'"]'),get:()=>e.cells[r][c].html,set:h=>{e.cells[r][c].html=h}}));
  if(e.type==='box')return[{tx:d.querySelector('.tx'),get:()=>e.html,set:h=>{e.html=h}}];
  return[];
}
function applyWhole(e,cmd,val){
  textTargets(e).forEach(t=>{
    if(!t.tx||!t.get())return;clearMath(t.tx);t.tx.innerHTML=t.get();t.tx.classList.add('tex2jax_ignore');t.tx.contentEditable='true';t.tx.focus({preventScroll:true});
    const r=document.createRange();r.selectNodeContents(t.tx);const s=getSelection();s.removeAllRanges();s.addRange(r);
    document.execCommand('styleWithCSS',false,true);document.execCommand(cmd,false,val==null?null:val);
    t.set(sanitizeHTML(t.tx.innerHTML));t.tx.removeAttribute('contenteditable');t.tx.classList.remove('tex2jax_ignore');t.tx.blur();s.removeAllRanges();
  });
  refreshEl(e);
}
function transformHTML(e,fn){textTargets(e).forEach(t=>{t.set(fn(t.get()||''))});refreshEl(e)}
const textEls=()=>selEls().filter(e=>e.type==='box'||e.type==='table');
function textCmd(cmd,val){
  if(editId){exec(cmd,val);return}
  const els=textEls();els.forEach(e=>applyWhole(e,cmd,val));if(els.length)commit();
}
function setTextColor(c){
  if(editId){exec('foreColor',resolveColor(c||'fg'));return}
  textEls().forEach(e=>{if(e.type==='table'&&cellSel)applyWhole(e,'foreColor',resolveColor(c||'fg'));else{e.color=c;transformHTML(e,h=>stripStyle(h,'color'))}});commit();renderToolbar();
}
function setHighlight(c){
  const v=c?resolveColor(c):'transparent';
  if(editId){exec('hiliteColor',v);return}
  textEls().forEach(e=>{if(c)applyWhole(e,'hiliteColor',v);else transformHTML(e,h=>stripStyle(h,'background-color'))});commit();
}
function setFont(f){
  if(editId){exec('fontName',f==='title'?deck.theme.titleFont:f==='body'?deck.theme.bodyFont:f);return}
  textEls().forEach(e=>{e.font=f;transformHTML(e,h=>stripStyle(h,'font-family'))});commit();renderToolbar();
}
function setSize(px){
  px=clamp(Math.round(px),6,400);if(!isFinite(px))return;
  if(editId){
    if(savedRange&&!savedRange.collapsed){exec('fontSizePx',px);return}
    const e=editEl();e.size=px;styleEl(elDom(e),e);afterEditChange();updateToolbarState();return;
  }
  textEls().forEach(e=>{e.size=px;transformHTML(e,h=>stripStyle(h,'font-size'));styleEl(elDom(e),e)});commit();updateToolbarState();
}
const SIZE_STEPS=[8,9,10,11,12,14,16,18,20,22,24,26,28,32,36,40,44,48,54,60,72,84,96,120,144,180];
function stepSize(dir){const st=readState();const s=st.size||28;const n=dir>0?SIZE_STEPS.find(v=>v>s):SIZE_STEPS.slice().reverse().find(v=>v<s);setSize(n||s+dir*2)}
function clearFormat(){
  if(editId){exec('removeFormat');return}
  textEls().forEach(e=>transformHTML(e,plainHTML));commit();
}
function caseInRange(r,mode){
  const root=r.commonAncestorContainer.nodeType===1?r.commonAncestorContainer:r.commonAncestorContainer.parentNode;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode()){if(r.intersectsNode(w.currentNode))nodes.push(w.currentNode)}
  if(root.nodeType===3&&!nodes.length)nodes.push(root);
  nodes.forEach(n=>{const a=n===r.startContainer?r.startOffset:0,b=n===r.endContainer?r.endOffset:n.nodeValue.length,s=n.nodeValue;
    const mid=s.slice(a,b);let out='',last=0;mid.replace(MATH_RE,(m,off)=>{out+=changeCase(mid.slice(last,off),mode)+m;last=off+m.length;return m});out+=changeCase(mid.slice(last),mode);
    n.nodeValue=s.slice(0,a)+out+s.slice(b)});
}
function setCase(mode){
  if(editId){restoreSel();const s=getSelection();let r=s.rangeCount?s.getRangeAt(0):null;const tx=curTx();
    if(!r||r.collapsed){r=document.createRange();r.selectNodeContents(tx)}caseInRange(r,mode);afterEditChange();return}
  textEls().forEach(e=>transformHTML(e,h=>{const d=document.createElement('div');d.innerHTML=h;mapTextOutsideMath(d,t=>changeCase(t,mode));return d.innerHTML}));commit();
}
function inList(){const s=getSelection();if(!s.rangeCount)return false;let n=s.getRangeAt(0).startContainer;if(n.nodeType===3)n=n.parentElement;return !!(n&&n.closest&&n.closest('li'))}
function blocksInSelection(tx){const s=getSelection();if(!s.rangeCount)return[];const r=s.getRangeAt(0);return Array.from(tx.children).filter(b=>r.intersectsNode(b))}
function indent(dir){
  const step=1.5;
  const shift=b=>{const cur=parseFloat(b.style.marginLeft)||0;const v=Math.max(0,cur+dir*step);b.style.marginLeft=v?v+'em':''};
  if(editId){restoreSel();if(inList()){exec(dir>0?'indent':'outdent');return}const tx=curTx();let bl=blocksInSelection(tx);if(!bl.length&&tx.firstElementChild)bl=[tx.firstElementChild];bl.forEach(shift);afterEditChange();return}
  textEls().forEach(e=>transformHTML(e,h=>{const d=document.createElement('div');d.innerHTML=h;Array.from(d.children).forEach(shift);return sanitizeHTML(d.innerHTML)}));commit();
}
const BULLETS=[['disc','●','Círculo cheio'],['circle','○','Círculo vazio'],['square','■','Quadrado'],['"– "','–','Traço'],['"➤ "','➤','Seta'],['"✓ "','✓','Visto']];
const NUMBERS=[['decimal','1. 2. 3.'],['lower-alpha','a. b. c.'],['upper-alpha','A. B. C.'],['lower-roman','i. ii. iii.'],['upper-roman','I. II. III.']];
function setListStyle(type,ordered){
  const tag=ordered?'OL':'UL';
  const apply=root=>{root.querySelectorAll('ul,ol').forEach(l=>{if(l.tagName===tag)l.style.listStyleType=type})};
  if(editId){
    restoreSel();const s=getSelection();let n=s.rangeCount?s.getRangeAt(0).startContainer:null;if(n&&n.nodeType===3)n=n.parentElement;
    let list=n&&n.closest?n.closest('ul,ol'):null;
    if(!list||list.tagName!==tag){exec(ordered?'insertOrderedList':'insertUnorderedList');const s2=getSelection();n=s2.rangeCount?s2.getRangeAt(0).startContainer:null;if(n&&n.nodeType===3)n=n.parentElement;list=n&&n.closest?n.closest('ul,ol'):null}
    if(list)list.style.listStyleType=type;afterEditChange();return;
  }
  textEls().forEach(e=>{const has=textTargets(e).some(t=>(t.get()||'').indexOf('<'+tag.toLowerCase())>=0);if(!has)applyWhole(e,ordered?'insertOrderedList':'insertUnorderedList');
    transformHTML(e,h=>{const d=document.createElement('div');d.innerHTML=h;apply(d);return sanitizeHTML(d.innerHTML)})});commit();
}
/* tamanho e cor do marcador das listas */
const MARK_SIZES=[['0.7','Pequeno'],['1','Normal'],['1.3','Grande'],['1.6','Muito grande']];
function setListMarker(prop,val){
  const apply=l=>{if(val)l.style.setProperty(prop,val);else l.style.removeProperty(prop)};
  if(editId){restoreSel();const s=getSelection();let n=s.rangeCount?s.getRangeAt(0).startContainer:null;if(n&&n.nodeType===3)n=n.parentElement;
    const tx=curTx();let lists=[];const l0=n&&n.closest?n.closest('ul,ol'):null;
    if(l0&&tx&&tx.contains(l0)){let top=l0;while(top.parentElement&&top.parentElement.closest('ul,ol')&&tx.contains(top.parentElement))top=top.parentElement.closest('ul,ol');lists=[top].concat(Array.from(top.querySelectorAll('ul,ol')))}
    else if(tx)lists=Array.from(tx.querySelectorAll('ul,ol'));
    if(!lists.length){toast('Coloque o cursor numa lista.');return}lists.forEach(apply);afterEditChange();return}
  const els=textEls();if(!els.length){toast('Selecione uma caixa com lista.');return}
  els.forEach(e=>transformHTML(e,h=>{const d=document.createElement('div');d.innerHTML=h;d.querySelectorAll('ul,ol').forEach(apply);return sanitizeHTML(d.innerHTML)}));commit();
}
function markerColorPop(anchor){colorPop(anchor||toolbar,null,c=>setListMarker('--mk-c',c?resolveColor(c):''),{none:'Cor de destaque do tema (padrão)'})}
const markerItems=()=>[{label:'Tamanho do marcador',icon:'ul',sub:MARK_SIZES.map(m=>({label:m[1],act:()=>setListMarker('--mk-s',m[0]==='1'?'':m[0]+'em')}))},{label:'Cor do marcador…',icon:'fill',act:()=>markerColorPop()}];
function caretInMath(){
  const tx=curTx();if(!tx||!savedRange)return false;
  const r=document.createRange();r.setStart(tx,0);try{r.setEnd(savedRange.startContainer,savedRange.startOffset)}catch(e){return false}
  const s=r.toString();let inl=false,dis=false;
  for(let i=0;i<s.length;i++){const c=s[i];
    if(c==='\\'){const n=s[i+1];if(n==='('&&!dis)inl=true;else if(n===')')inl=false;else if(n==='['&&!inl)dis=true;else if(n===']')dis=false;i++;continue}
    if(c==='$'){if(s[i+1]==='$'&&!inl){dis=!dis;i++}else if(!dis)inl=!inl}}
  return inl||dis;
}
function moveCaret(n){const s=getSelection();if(s.modify)for(let i=0;i<n;i++)s.modify('move','backward','character')}
function insertTeX(snippet){
  if(!editId){addEls([box({x:Math.round(W*.2),y:Math.round(H*.42),w:Math.round(W*.6),h:100,size:36,align:'center',valign:'middle',html:'<div>'+esc('$$'+snippet+'$$')+'</div>'})]);return}
  restoreSel();const inside=caretInMath();document.execCommand('insertText',false,inside?snippet:'$'+snippet+'$');afterEditChange();
}
function inlineMath(){
  if(!editId){insertTeX('x');return}
  restoreSel();const t=getSelection().toString();
  if(t)document.execCommand('insertText',false,'$'+t+'$');else{document.execCommand('insertText',false,'$$');moveCaret(1)}
  afterEditChange();
}
function displayMath(){
  if(!editId){insertTeX('\\int_{-\\infty}^{\\infty} e^{-x^2}\\,\\mathrm{d}x = \\sqrt{\\pi}');return}
  restoreSel();document.execCommand('insertText',false,'$$  $$');moveCaret(3);afterEditChange();
}
function insertChars(ch){
  if(editId){restoreSel();document.execCommand('insertText',false,ch);afterEditChange();return}
  const e=box({x:Math.round(W/2-100),y:Math.round(H/2-30),w:200,h:60,size:40,align:'center',html:'<div>'+esc(ch)+'</div>'});addEls([e]);
}

/* ---------- LaTeX preview bubble ---------- */
const pv=$('#pv'),pvIn=$('#pvIn'),pvBox=$('#pvBox');
function hidePreview(){pv.hidden=true;clearMath(pvIn);pvIn.innerHTML=''}
const schedulePreview=debounce(updatePreview,260);
function updatePreview(){
  if(!editId||!prefs.livePreview){hidePreview();return}const e=editEl(),tx=curTx();if(!e||!tx){hidePreview();return}
  if(!/\$|\\\(|\\\[/.test(tx.textContent)){hidePreview();return}
  clearMath(pvIn);pvIn.innerHTML=sanitizeHTML(tx.innerHTML);
  const cs=getComputedStyle(tx);
  pvIn.className='tx';pvIn.setAttribute('style','');
  Object.assign(pvIn.style,{position:'absolute',left:'0',top:'0',transformOrigin:'0 0',width:tx.offsetWidth+'px',fontSize:cs.fontSize,fontFamily:cs.fontFamily,color:cs.color,lineHeight:cs.lineHeight,fontWeight:cs.fontWeight,textAlign:cs.textAlign,padding:cs.padding});
  pvIn.style.setProperty('--ps',cs.getPropertyValue('--ps'));
  pvBox.style.background=slide().bg||deck.theme.bg;pvBox.style.setProperty('--accent',deck.theme.accent);
  pv.hidden=false;
  typeset([pvIn]).then(()=>{if(!editId||pv.hidden)return;positionPreview()});
}
function positionPreview(){
  if(pv.hidden||!editId)return;const tx=curTx();if(!tx)return;
  const wpx=tx.offsetWidth,r=tx.getBoundingClientRect(),natH=Math.max(20,pvIn.offsetHeight),pad=8,gap=10,chrome=40;
  const base=Math.min(Math.max(scale,.45),1);
  const fitV=h=>Math.min(base,(innerWidth-40)/wpx,h/natH),fitH=w=>Math.min(base,w/wpx,(innerHeight-2*pad-chrome)/natH);
  const opts=[['below',fitV(innerHeight-r.bottom-gap-pad-chrome)],['above',fitV(r.top-gap-pad-chrome)],['right',fitH(innerWidth-r.right-gap-pad-24)],['left',fitH(r.left-gap-pad-24)]];
  const best=opts.find(o=>o[1]>=base*.999)||opts.reduce((a,b)=>b[1]>a[1]?b:a);
  const s=Math.max(best[1],.3);
  pvIn.style.transform='scale('+s+')';pvBox.style.width=wpx*s+'px';pvBox.style.height=natH*s+'px';
  const pw=pv.offsetWidth,ph=pv.offsetHeight;let x,y;
  if(best[0]==='below'){x=r.left;y=r.bottom+gap}else if(best[0]==='above'){x=r.left;y=r.top-gap-ph}else if(best[0]==='right'){x=r.right+gap;y=r.top}else{x=r.left-gap-pw;y=r.top}
  pv.style.left=clamp(x,pad,Math.max(pad,innerWidth-pw-pad))+'px';pv.style.top=clamp(y,pad,Math.max(pad,innerHeight-ph-pad))+'px';
}
frame.addEventListener('input',ev=>{if(editId&&ev.target.closest&&ev.target.closest('.tx'))afterEditChange()});

/* ---------- links ---------- */
function currentLinkNode(){const tx=curTx();if(!tx||!savedRange)return null;let n=savedRange.startContainer;if(n.nodeType===3)n=n.parentElement;const a=n&&n.closest&&n.closest('a');return a&&tx.contains(a)?a:null}
function linkPop(anchor){
  const obj=!editId?selEls()[0]:null;
  if(!editId&&!obj){toast('Selecione um texto ou um elemento para criar o link.');return}
  let curHref='';if(editId){const a=currentLinkNode();curHref=a?a.getAttribute('href'):''}else if(obj.link)curHref=obj.link.url||('#slide:'+obj.link.slide);
  const slideId=curHref.indexOf('#slide:')===0?curHref.slice(7):'';
  const n=document.createElement('div');n.className='ppanel linkpanel';
  n.innerHTML='<label class="lab">Endereço da Web ou e-mail<input id="lkUrl" placeholder="https://… ou mailto:…" value="'+esc(slideId?'':curHref)+'"></label>'+
    '<label class="lab">Ou um slide desta apresentação<select id="lkSlide"><option value="">Nenhum</option>'+deck.slides.map((s,i)=>'<option value="'+s.id+'"'+(s.id===slideId?' selected':'')+'>Slide '+(i+1)+': '+esc(slideTitle(s).slice(0,40))+'</option>').join('')+'</select></label>'+
    '<div class="btns"><button type="button" class="btn primary" id="lkApply">Aplicar</button>'+(curHref?'<button type="button" class="btn" id="lkRemove">Remover link</button>':'')+'</div>';
  openPopNode(n,anchor);setTimeout(()=>{const u=$('#lkUrl');if(u)u.focus()},0);
  const apply=()=>{
    const sid=$('#lkSlide').value;let url=$('#lkUrl').value.trim();
    if(!sid&&!url){closePop();return}
    if(url&&!/^(https?:|mailto:)/i.test(url))url=(/@/.test(url)&&!/\//.test(url)?'mailto:':'https://')+url;
    const href=sid?'#slide:'+sid:url;closePop();
    if(editId){restoreSel();const s=getSelection();
      if(s.isCollapsed){const a=currentLinkNode();if(a){a.setAttribute('href',href)}else{const label=sid?slideTitle(deck.slides.find(x=>x.id===sid)):url.replace(/^mailto:/,'');document.execCommand('insertHTML',false,'<a href="'+esc(href)+'">'+esc(label)+'</a>&nbsp;')}}
      else document.execCommand('createLink',false,href);
      afterEditChange();
    }else{selEls().forEach(e=>{e.link=sid?{slide:sid}:{url:url}});commit();toast('Link aplicado. Ele funciona no modo apresentação.')}
  };
  $('#lkApply').onclick=apply;$('#lkUrl').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();apply()}});
  const rm=$('#lkRemove');if(rm)rm.onclick=()=>{closePop();
    if(editId){restoreSel();const a=currentLinkNode();if(a){const r=document.createRange();r.selectNodeContents(a);const s=getSelection();s.removeAllRanges();s.addRange(r)}document.execCommand('unlink');afterEditChange()}
    else{selEls().forEach(e=>{e.link=null});commit()}};
}
function slideTitle(s){if(!s)return '';const t=s.els.find(e=>e.type==='box'&&e.role==='title');const txt=t?textOf(t.html).trim():'';
  if(txt)return txt;const any=s.els.find(e=>e.type==='box'&&textOf(e.html).trim());return any?textOf(any.html).trim():'Sem título'}
