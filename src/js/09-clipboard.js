/* ================= clipboard ================= */
let clipSlides=null;
const isTyping=t=>t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]');
const inThumbs=t=>t&&t.closest&&t.closest('#thumbs');
function copySel(cut,ev){
  const els=selEls();if(!els.length)return false;clip=JSON.stringify(els);
  if(ev&&ev.clipboardData){try{ev.clipboardData.setData('text/plain','LOUSATEX:'+clip)}catch(e){}ev.preventDefault()}
  if(cut)removeEls(els.map(e=>e.id));else toast(els.length>1?els.length+' elementos copiados.':'Copiado.');return true;
}
/* imagens vindas de outros programas e sites */
const IMG_URL_RE=/^(https?:\/\/\S+\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?\S*)?|data:image\/[\w+.-]+;base64,\S+)$/i;
function clipImages(dt){
  if(!dt)return null;const files=[];
  Array.from(dt.files||[]).forEach(f=>{if(/^image\//.test(f.type))files.push(f)});
  if(!files.length)Array.from(dt.items||[]).forEach(i=>{if(i.kind==='file'&&/^image\//.test(i.type)){const f=i.getAsFile();if(f)files.push(f)}});
  if(files.length)return{files:files,urls:[]};
  const html=dt.getData('text/html');let urls=[];
  if(html&&/<img/i.test(html)){try{const d=new DOMParser().parseFromString(html,'text/html');const txt=(d.body.textContent||'').trim();
    if(txt.length<40)urls=Array.from(d.images).map(i=>i.getAttribute('src')).filter(u=>u&&/^(https?:|data:image\/)/i.test(u))}catch(e){}}
  if(!urls.length){const t=(dt.getData('text/uri-list')||dt.getData('text/plain')||'').trim().split(/\r?\n/).filter(l=>l&&l[0]!=='#');if(t.length&&t.every(u=>IMG_URL_RE.test(u.trim())))urls=t.map(u=>u.trim())}
  return urls.length?{files:[],urls:urls}:null;
}
function insertClipImages(r){
  if(editId)exitEdit(true);
  r.files.forEach(f=>readImage(f,addImageCascade));r.urls.forEach(u=>addImageURL(u));
  const n=r.files.length+r.urls.length;if(n>1)toast(n+' imagens coladas.');
}
function pasteEls(json){
  let list;try{list=JSON.parse(json)}catch(e){return}if(!Array.isArray(list))return;
  const here=new Set(slide().els.map(e=>e.id));const off=list.some(e=>here.has(e.id))?20:0;
  const out=cloneSet(list.map(normEl).filter(Boolean),off);addEls(out);clip=JSON.stringify(out);
}
function copySlides(ev,cut){
  const ss=deck.slides.filter(s=>slideSel.has(s.id));clipSlides=JSON.stringify(ss);
  if(ev&&ev.clipboardData){try{ev.clipboardData.setData('text/plain','LOUSATEX-SLIDES:'+clipSlides)}catch(e){}ev.preventDefault()}
  if(cut)delSlides();else toast(ss.length>1?ss.length+' slides copiados.':'Slide copiado.');
}
function pasteSlides(json){
  let list;try{list=JSON.parse(json)}catch(e){return}if(!Array.isArray(list)||!list.length)return;
  const fresh=list.map(s=>cloneSlide(normalize({version:3,slides:[s]}).slides[0]));
  deck.slides.splice(cur+1,0,...fresh);slideSel.clear();fresh.forEach(s=>slideSel.add(s.id));rebuildThumbs();goto(cur+1,true);commit();
  toast(fresh.length>1?fresh.length+' slides colados.':'Slide colado.');
}
document.addEventListener('copy',ev=>{if(P.on||isTyping(ev.target))return;if(inThumbs(ev.target)||(!selIds.length&&document.activeElement&&inThumbs(document.activeElement))){copySlides(ev);return}if(editId)return;copySel(false,ev)});
document.addEventListener('cut',ev=>{if(P.on||isTyping(ev.target))return;if(inThumbs(ev.target)){copySlides(ev,true);return}if(editId)return;copySel(true,ev)});
document.addEventListener('paste',ev=>{
  if(P.on||!$('#modal').hidden||!$('#landing').hidden||!$('#home').hidden)return;
  const cd=ev.clipboardData;const items=cd?Array.from(cd.items):[];
  const t=cd?cd.getData('text/plain'):'';
  const imgs=t.indexOf('LOUSATEX')===0?null:clipImages(cd);void items;
  const tx=curTx();
  if(editId&&tx&&tx.contains(ev.target.nodeType===1?ev.target:ev.target.parentElement)){
    ev.preventDefault();if(imgs){insertClipImages(imgs);return}
    if(t){const e=editEl();
      if(e.type==='table'&&/\t/.test(t)){pasteIntoTable(e,editCell,t);return}
      document.execCommand('insertText',false,t.replace(/\r\n?/g,'\n'));afterEditChange()}
    return;
  }
  if(isTyping(ev.target))return;
  if(t&&t.indexOf('LOUSATEX-SLIDES:')===0){ev.preventDefault();pasteSlides(t.slice(16));return}
  if(imgs){ev.preventDefault();insertClipImages(imgs);return}
  if(t&&t.indexOf('LOUSATEX:')===0){ev.preventDefault();pasteEls(t.slice(9));return}
  if(t&&/\t/.test(t)&&/\n/.test(t.trim()+'\n')){
    const e=tbl();if(e&&cellSel){ev.preventDefault();pasteIntoTable(e,{r:Math.min(cellSel.r0,cellSel.r1),c:Math.min(cellSel.c0,cellSel.c1)},t);return}
    ev.preventDefault();const tb=tableFromTSV(t.trim());if(tb){addEls([tb]);toast('Dados colados como tabela.')}return}
  if(inThumbs(ev.target)&&clipSlides){ev.preventDefault();pasteSlides(clipSlides);return}
  if(t&&t.trim()){ev.preventDefault();addEls([box({x:Math.round(W*.1),y:Math.round(H*.28),w:Math.round(W*.8),h:60,size:26,html:md(t.trim())})]);return}
  if(clip){ev.preventDefault();pasteEls(clip)}
});
function pasteIntoTable(e,at,text){
  if(editId)exitEdit(true);
  const rows=text.replace(/\r/g,'').split('\n').filter((l,i,a)=>l.length||i<a.length-1).map(l=>l.split('\t'));
  while(e.rows<at.r+rows.length)insertRow(e,e.rows);
  const need=Math.max(...rows.map(r=>r.length));while(e.cols<at.c+need)insertCol(e,e.cols);
  rows.forEach((row,i)=>row.forEach((v,j)=>{const c=e.cells[at.r+i][at.c+j];if(c&&!c.hide)c.html=v.trim()?md(v.trim()):''}));
  refreshEl(e);commit();toast('Células preenchidas.');
}
async function pastePlainFromMenu(){
  try{const t=await navigator.clipboard.readText();if(t){if(editId){restoreSel();document.execCommand('insertText',false,t);afterEditChange()}else addEls([box({x:Math.round(W*.1),y:Math.round(H*.28),w:Math.round(W*.8),h:60,size:26,html:md(t.trim())})]);return}}catch(e){}
  if(clip)pasteEls(clip);else toast('Use '+MOD+'Shift+V para colar sem formatação.');
}
async function pasteFromMenu(){
  try{const its=await navigator.clipboard.read();const files=[],urls=[];let text='';
    for(const it of its){const im=it.types.find(t=>/^image\//.test(t));
      if(im){const b=await it.getType(im);files.push(new File([b],'img',{type:b.type||im}));continue}
      if(it.types.includes('text/html')){const h=await (await it.getType('text/html')).text();const r=clipImages({getData:k=>k==='text/html'?h:'',files:[],items:[]});if(r){urls.push(...r.urls);continue}}
      if(it.types.includes('text/plain'))text=await (await it.getType('text/plain')).text()}
    if(files.length||urls.length){insertClipImages({files:files,urls:urls});return}
    if(text.indexOf('LOUSATEX-SLIDES:')===0){pasteSlides(text.slice(16));return}
    if(text.indexOf('LOUSATEX:')===0){pasteEls(text.slice(9));return}
    if(text.trim()&&IMG_URL_RE.test(text.trim())){addImageURL(text.trim());return}
    if(text.trim()&&!clip){addEls([box({x:Math.round(W*.1),y:Math.round(H*.28),w:Math.round(W*.8),h:60,size:26,html:md(text.trim())})]);return}
  }catch(e){}
  if(clip)pasteEls(clip);else toast('Use '+MOD+'V para colar.');
}
