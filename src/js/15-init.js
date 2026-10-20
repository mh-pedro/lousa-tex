/* ================= keyboard ================= */
document.addEventListener('keydown',ev=>{
  if(landingOn()){if(ev.key==='Escape'&&modal.hidden)showHome();return}
  if(homeOn()){if(ev.key==='Escape'&&modal.hidden&&!(ev.target.closest&&ev.target.closest('input')))hideHome();return}
  if(P.on){if(P.presenter&&ev.target.closest&&ev.target.closest('select'))return;presKey(ev);return}
  if(!modal.hidden){if(ev.key==='Escape')closeModal();return}
  if(!pop.hidden&&ev.key==='Escape'){ev.preventDefault();closePop();return}
  const k=ev.key,lk=k.toLowerCase(),mod=ev.ctrlKey||ev.metaKey,alt=ev.altKey;
  const inEdit=!!(editId&&ev.target.closest&&ev.target.closest('.tx[contenteditable]'));
  const typing=!inEdit&&isTyping(ev.target);
  /* global */
  if(k==='F5'||(mod&&k==='Enter'&&!inEdit)){ev.preventDefault();startPres(ev.shiftKey?0:cur);return}
  if(mod&&alt&&lk==='p'){ev.preventDefault();startPres(cur,true);return}
  if(alt&&(k==='/'||ev.code==='Slash')&&!mod){ev.preventDefault();cmdPalette();return}
  if(mod&&(k==='/'||ev.code==='Slash')){ev.preventDefault();openSide('keys');return}
  if(mod&&lk==='s'){ev.preventDefault();commitSoon.flush();saveSoon.flush();if(driveIdOf()&&driveOn()){driveSave().then(()=>toast('Salvo no Google Drive.')).catch(driveErr)}else if(standalone)saveToFile(ev.shiftKey);else toast('Salvo automaticamente neste navegador.');return}
  if(mod&&lk==='o'){ev.preventDefault();openFileSmart();return}
  if(mod&&lk==='p'&&!alt){ev.preventDefault();if(standalone)printModal();else toast('Imprimir e PDF estão disponíveis na versão local.');return}
  if(mod&&alt&&ev.shiftKey&&lk==='h'){ev.preventDefault();versionsModal();return}
  if(mod&&(lk==='h'||(lk==='f'&&!typing))){ev.preventDefault();openSide('find',true);return}
  if(mod&&alt&&lk==='m'){ev.preventDefault();startComment();return}
  if(mod&&ev.shiftKey&&lk==='m'){ev.preventDefault();inlineMath();return}
  if(mod&&!alt&&lk==='k'&&!typing){ev.preventDefault();linkPop(toolbar);return}
  if(mod&&(k==='='||k==='+')){ev.preventDefault();setZoom(clamp(+(scale*1.2).toFixed(3),.1,4));return}
  if(mod&&(k==='-'||k==='_')&&!typing){ev.preventDefault();setZoom(clamp(+(scale/1.2).toFixed(3),.1,4));return}
  if(mod&&!alt&&(k==='0'||ev.code==='Digit0')&&!inEdit){ev.preventDefault();setZoom('fit');return}
  if(mod&&alt&&k==='1'){ev.preventDefault();toggleGridView();return}
  if(mod&&lk==='m'&&!typing&&!alt){ev.preventDefault();addSlide();return}
  if(gridView&&k==='Escape'){toggleGridView(false);return}
  const textish=inEdit||(!typing&&textEls().length>0);
  if(textish&&mod){
    if(ev.shiftKey&&(k==='>'||k==='.'||k==='<'||k===',')){ev.preventDefault();stepSize(k==='>'||k==='.'?1:-1);return}
    if(!ev.shiftKey&&k==='.'){ev.preventDefault();textCmd('superscript');return}
    if(!ev.shiftKey&&k===','){ev.preventDefault();textCmd('subscript');return}
    if(k==='\\'){ev.preventDefault();clearFormat();return}
    if(k===']'){ev.preventDefault();indent(1);return}if(k==='['){ev.preventDefault();indent(-1);return}
    if(ev.shiftKey&&['l','e','r','j'].includes(lk)){ev.preventDefault();alignText({l:'left',e:'center',r:'right',j:'justify'}[lk]);return}
    if(ev.shiftKey&&(k==='7'||k==='&')){ev.preventDefault();textCmd('insertOrderedList');return}
    if(ev.shiftKey&&(k==='8'||k==='*')){ev.preventDefault();textCmd('insertUnorderedList');return}
  }
  if(alt&&ev.shiftKey&&k==='5'&&textish){ev.preventDefault();textCmd('strikeThrough');return}
  if(inEdit){
    if(k==='Escape'){ev.preventDefault();const id=editId;exitEdit();if(byId(id))select([id]);return}
    if(k==='Tab'){ev.preventDefault();const e=editEl();if(e&&e.type==='table'){moveCell(ev.shiftKey?-1:1);return}if(inList())exec(ev.shiftKey?'outdent':'indent');return}
    if(mod&&(lk==='b'||lk==='i'||lk==='u')){ev.preventDefault();exec({b:'bold',i:'italic',u:'underline'}[lk]);return}
    return;
  }
  if(typing){if(k==='Escape')ev.target.blur();return}
  if(mod&&lk==='z'){ev.preventDefault();if(ev.shiftKey)redo();else undo();return}
  if(mod&&lk==='y'){ev.preventDefault();redo();return}
  if(mod&&alt&&lk==='c'){ev.preventDefault();startPainter();return}
  if(mod&&alt&&lk==='v'){ev.preventDefault();if(painter&&selEls()[0])applyPainter(selEls()[0]);return}
  if(mod&&lk==='g'){ev.preventDefault();if(ev.shiftKey)ungroupSel();else groupSel();return}
  if((ev.shiftKey&&k==='F10')||k==='ContextMenu'){ev.preventDefault();const e0=selEls()[0],d=(e0&&elDom(e0))||frame,r=d.getBoundingClientRect();stageContext({clientX:r.left+Math.min(r.width/2,40),clientY:r.top+Math.min(r.height/2,30),target:d,preventDefault(){}});return}
  if(ev.target.closest&&ev.target.closest('#thumbs')){
    if(k==='Delete'||k==='Backspace'){ev.preventDefault();delSlides();focusThumb()}
    else if((k==='ArrowDown'||k==='ArrowRight')&&mod){ev.preventDefault();moveSlides('down');focusThumb()}
    else if((k==='ArrowUp'||k==='ArrowLeft')&&mod){ev.preventDefault();moveSlides('up');focusThumb()}
    else if(k==='ArrowDown'||k==='ArrowRight'){ev.preventDefault();goto(cur+1);focusThumb()}
    else if(k==='ArrowUp'||k==='ArrowLeft'){ev.preventDefault();goto(cur-1);focusThumb()}
    else if(mod&&lk==='d'){ev.preventDefault();dupSlides();focusThumb()}
    else if(mod&&lk==='a'){ev.preventDefault();deck.slides.forEach(s=>slideSel.add(s.id));markThumbs()}
    return;
  }
  if(k==='Escape'){if(painter){stopPainter();return}if(cropId){exitCrop();return}if(tool){setTool(null);return}if(cellSel&&tbl()){cellSel=null;markCells();renderToolbar();return}if(selIds.length){select([]);return}return}
  if(mod&&lk==='a'){ev.preventDefault();select(slide().els.map(e=>e.id));return}
  const els=selEls();
  if(k==='Tab'&&!mod&&!alt){const L=slide().els;if(!L.length)return;ev.preventDefault();const i=L.findIndex(e=>e.id===selIds[selIds.length-1]);
    const n=i<0?(ev.shiftKey?L.length-1:0):(i+(ev.shiftKey?-1:1)+L.length)%L.length;select(groupMembers(L[n].id));return}
  if(cropId&&k==='Enter'){ev.preventDefault();exitCrop();return}
  if(els.length){
    if(k==='Delete'||k==='Backspace'){ev.preventDefault();const e=tbl();if(e&&cellSel&&selIds.length===1){selectedCells(e).forEach(([r,c])=>{e.cells[r][c].html=''});refreshEl(e);commit();return}removeEls(selIds.slice());return}
    if(mod&&lk==='d'){ev.preventDefault();duplicateSel();return}
    if(alt&&!mod&&(k==='ArrowLeft'||k==='ArrowRight')){ev.preventDefault();rotateSel((k==='ArrowRight'?1:-1)*(ev.shiftKey?1:15));return}
    if(mod&&alt&&'kjbwiq'.includes(lk)&&lk){ev.preventDefault();const f=ev.shiftKey?1.01:1.1,m={k:[f,f],j:[1/f,1/f],b:[f,1],w:[1/f,1],i:[1,f],q:[1,1/f]}[lk];scaleSel(m[0],m[1]);return}
    if(mod&&(k==='ArrowUp'||k==='ArrowDown')){ev.preventDefault();order(k==='ArrowUp'?(ev.shiftKey?'front':'forward'):(ev.shiftKey?'back':'backward'));return}
    if(mod&&(lk==='b'||lk==='i'||lk==='u')){ev.preventDefault();textCmd({b:'bold',i:'italic',u:'underline'}[lk]);return}
    if(k.indexOf('Arrow')===0){ev.preventDefault();const st=ev.shiftKey?10:1;nudge(k==='ArrowLeft'?-st:k==='ArrowRight'?st:0,k==='ArrowUp'?-st:k==='ArrowDown'?st:0);return}
    const one=els.length===1?els[0]:null;
    if(k==='Enter'&&one){ev.preventDefault();if(one.type==='box')enterEdit(one,'end');else if(one.type==='table')enterEdit(one,'end',cellSel?{r:Math.min(cellSel.r0,cellSel.r1),c:Math.min(cellSel.c0,cellSel.c1)}:null);else if(one.type==='image')enterCrop(one);return}
    if(one&&(one.type==='box'||one.type==='table')&&!one.locked&&k.length===1&&!mod&&!alt){ev.preventDefault();
      if(one.type==='table'){const c=cellSel?{r:Math.min(cellSel.r0,cellSel.r1),c:Math.min(cellSel.c0,cellSel.c1)}:firstVisibleCell(one);enterEdit(one,'end',c)}else enterEdit(one,'end');
      document.execCommand('insertText',false,k);afterEditChange();return}
  }else{
    if(mod&&lk==='d'){ev.preventDefault();dupSlides();return}
    if(mod&&(k==='ArrowUp'||k==='ArrowDown')){ev.preventDefault();moveSlides(k==='ArrowUp'?'up':'down');return}
    if(k==='Home'){ev.preventDefault();goto(0);return}if(k==='End'){ev.preventDefault();goto(deck.slides.length-1);return}
    if(k==='ArrowDown'||k==='PageDown'){ev.preventDefault();goto(cur+1)}else if(k==='ArrowUp'||k==='PageUp'){ev.preventDefault();goto(cur-1)}
  }
});
function focusThumb(){const t=thumbsEl.children[cur];if(t)t.focus()}

/* ================= start ================= */
function initialDeck(){
  if(window.__LOUSA_DECK&&Array.isArray(window.__LOUSA_DECK.slides)){const d=window.__LOUSA_DECK;window.__LOUSA_DECK=null;if(!d.id)d.id=uid();return d}
  const id=lsGet(KEY_CUR);if(id){const d=loadDeckById(id);if(d&&Array.isArray(d.slides)&&d.slides.length)return d}
  const l=libList();if(l[0]){const d=loadDeckById(l[0].id);if(d)return d}
  for(const k of [KEY_OLD2,KEY_OLD1]){try{const s=lsGet(k);if(s){const d=JSON.parse(s);if(d&&Array.isArray(d.slides)&&d.slides.length)return d}}catch(e){}}
  return sampleDeck();
}
deck=normalize(initialDeck());setSizeGlobals();titleIn.value=deck.title;
slideSel.add(deck.slides[0].id);resetHistory();
updateTikzFonts();applyPrefsUI();applyPreamble();renderStage();rebuildThumbs();renderToolbar();updateCommentCount();
saveDeckNow();addVersion('',false);
window.mathReady.then(()=>{if(window.__mjFailed)toast('O MathJax não carregou. Verifique a conexão; o LaTeX aparece como texto.')});
driveBoot();
planSig=planSignature();
setupLaunchQueue();
if(standalone&&!window.__LOUSA_FROM_FILE&&!new URLSearchParams(location.search).get('state')){const h=location.hash;if(h==='#arquivos')showHome();else if(h!=='#editor'){if(prefs.homeSeen)showHome();else showLanding()}}
$('#top .mark').style.cursor='pointer';$('#top .mark').title='Minhas apresentações';$('#top .mark').addEventListener('click',showHome);
if(window.__LOUSA_FROM_FILE){FS.fromFile=true;FS.deckId=deck.id;FS.name=decodeURIComponent(location.pathname.split('/').pop()||'');setSaveState('Aberto de '+FS.name);toast('Arquivo antigo (.lousa.html) aberto. Use Ctrl+S para salvar no formato atual, .lousa.',7000)}
