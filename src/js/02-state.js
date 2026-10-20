/* ================= state ================= */
let deck,cur=0,selIds=[],editId=null,editCell=null,tool=null,scale=1,zoom='fit',stageNode=null,overlay=null,sideMode=null,masterMode=false,gridView=false;
let hist=[],hi=-1,preErr='',clip=null,savedRange=null,pendingSize=null,replaceTarget=null,drag=null,activeMenu=null,cropId=null,cellSel=null,painter=null;
const slideSel=new Set();
const prefs={showNotes:true,showRail:true,showRulers:false,showGuides:true,showGrid:false,snapGrid:false,snapObjects:true,gridSize:40,unit:'px',spell:false,livePreview:true,autoVersionMin:10,presenterFont:16,uiTheme:'auto',stageBg:'',pasteboard:true,lang:'auto'};
try{Object.assign(prefs,JSON.parse(lsGet(UIKEY)||'{}'))}catch(e){}
const browserLang=()=>{const l=(navigator.languages&&navigator.languages[0])||navigator.language||'pt';return /^pt/i.test(l)?'pt':'en'};
LANG=(prefs.lang==='pt'||prefs.lang==='en')?prefs.lang:browserLang();document.documentElement.lang=LANG==='en'?'en':'pt-BR';
function savePrefs(){try{lsSet(UIKEY,JSON.stringify(prefs))}catch(e){}}

const frame=$('#frame'),stageWrap=$('#stageWrap'),stageArea=$('#stageArea'),thumbsEl=$('#thumbs'),toolbar=$('#toolbar'),pop=$('#pop'),pres=$('#pres'),side=$('#side'),sideBody=$('#sideBody');
const slide=()=>masterMode?deck.master:deck.slides[cur];
const byId=id=>slide().els.find(e=>e.id===id)||null;
const selEls=()=>selIds.map(byId).filter(Boolean);
const selBoxes=()=>selEls().filter(e=>e.type==='box');
const elDom=e=>stageNode&&e?stageNode.querySelector('[data-id="'+e.id+'"]'):null;
const findSlideOf=elId=>deck.slides.find(s=>s.els.some(e=>e.id===elId))||(deck.master.els.some(e=>e.id===elId)?deck.master:null);

function resolveColor(c){
  if(!c)return 'none';const t=deck.theme;
  if(c==='fg')return t.fg;if(c==='title')return t.title;if(c==='accent')return t.accent;if(c==='bg')return t.bg;
  if(c==='muted')return mixHex(t.fg,t.bg,.42);return c;
}
const fontKey=e=>e.font||(e.role==='title'?'title':'body');
const fontName=e=>{const f=fontKey(e);return f==='title'?deck.theme.titleFont:f==='body'?deck.theme.bodyFont:f};
const fontStack=name=>FONTS[name]||("'"+name+"',serif");
const textColor=e=>resolveColor(e.color||(e.role==='title'?'title':'fg'));
function setSizeGlobals(){W=deck.size.w;H=deck.size.h;
  $('#dynStyle').textContent='#thumbs{--ts:'+(150/W)+';--ar:'+(H/W)+'}#gridView{--tsg:'+(240/W)+';--ar:'+(H/W)+'}@media (max-width:900px){#thumbs{--ts:'+(112/W)+'}}'+
    '@media print{@page{size:'+W+'px '+H+'px;margin:0}.ppage{width:'+W+'px;height:'+H+'px}}';
}

/* ================= library, saving, versions ================= */
function libList(){try{const l=JSON.parse(lsGet(KEY_LIB)||'[]');return Array.isArray(l)?l:[]}catch(e){return[]}}
function libSave(l){try{lsSet(KEY_LIB,JSON.stringify(l))}catch(e){}}
function libTouch(d){const l=libList();const i=l.findIndex(x=>x.id===d.id);
  const item={id:d.id,title:d.title,updated:Date.now(),created:i>=0?l[i].created:Date.now(),slides:d.slides.length};
  if(i>=0)l.splice(i,1);l.unshift(item);libSave(l)}
function loadDeckById(id){try{const s=lsGet(KEY_DECK+id);return s?JSON.parse(s):null}catch(e){return null}}
function verList(id){try{const l=JSON.parse(lsGet(KEY_VER+id)||'[]');return Array.isArray(l)?l:[]}catch(e){return[]}}
function verSave(id,l){
  for(let tries=0;tries<40;tries++){
    try{lsSet(KEY_VER+id,JSON.stringify(l));return true}
    catch(e){let k=-1;for(let i=l.length-1;i>=0;i--)if(!l[i].name){k=i;break}if(k<0)k=l.length-1;if(k<0)return false;l.splice(k,1)}
  }
  return false;
}
function addVersion(name,force){
  const l=verList(deck.id),now=Date.now(),data=JSON.stringify(deck);
  if(!force&&!name&&l[0]&&now-l[0].t<prefs.autoVersionMin*60000)return;
  if(l[0]&&l[0].data===data&&!name)return;
  l.unshift({id:uid(),t:now,name:name||'',data:data});
  let unnamed=0;for(let i=0;i<l.length;i++){if(!l[i].name){unnamed++;if(unnamed>25){l.splice(i,1);i--}}}
  verSave(deck.id,l);
}
let saveWarned=false;
function setSaveState(t){$('#saveState').textContent=t}
function draftState(){
  if(typeof driveIdOf==='function'&&driveIdOf())return 'Salvando no Drive…';
  if(typeof FS!=='undefined'&&FS.deckId===deck.id&&(FS.handle||FS.fromFile))return FS.canWrite?'Salvo em '+FS.name:'Aberto de '+FS.name+' · Ctrl+S salva';
  return 'Não salvo · Ctrl+S salva no computador';
}
function saveDeckNow(){
  const data=JSON.stringify(deck);
  for(let tries=0;tries<2;tries++){
    try{lsSet(KEY_DECK+deck.id,data);lsSet(KEY_CUR,deck.id);libTouch(deck);setSaveState(draftState());saveWarned=false;return true}
    catch(e){const l=verList(deck.id).filter(v=>v.name);try{lsSet(KEY_VER+deck.id,JSON.stringify(l))}catch(e2){lsDel(KEY_VER+deck.id)}}
  }
  setSaveState('Não salvo');
  if(!saveWarned){toast('Sem espaço para salvar no navegador (imagens ou vídeos grandes). Use Arquivo › Baixar ou Copiar conteúdo.');saveWarned=true}
  return false;
}
const saveSoon=debounce(()=>{if(saveDeckNow())addVersion()},700);

/* ================= history ================= */
let driveHook=()=>{};
function commit(){
  commitSoon.cancel();const s=JSON.stringify(deck);if(hist[hi]===s)return;
  hist.length=hi+1;hist.push(s);if(hist.length>200)hist.shift();hi=hist.length-1;invalidatePlan();refreshPlanSoon();
  setSaveState('Salvando…');saveSoon();undoUI();driveHook();if(typeof pasteboardSoon==='function')pasteboardSoon();if(typeof fileSaveSoon==='function')fileSaveSoon();
}
const commitSoon=debounce(commit,450);
function undoUI(){const u=toolbar.querySelector('[data-cmd="undo"]'),r=toolbar.querySelector('[data-cmd="redo"]');if(u)u.disabled=hi<=0;if(r)r.disabled=hi>=hist.length-1}
function restore(){invalidatePlan();
  const prevPre=deck.preamble,prevSize=deck.size.w+'x'+deck.size.h;deck=JSON.parse(hist[hi]);invalidatePlan();
  cur=Math.min(cur,deck.slides.length-1);
  if(deck.size.w+'x'+deck.size.h!==prevSize)setSizeGlobals();
  if(deck.preamble!==prevPre)applyPreamble();
  syncSlideSel();$('#deckTitle').value=deck.title;rerenderAll();renderToolbar();renderSide();updateCommentCount();saveSoon();undoUI();
}
function undo(){if(editId)exitEdit();commitSoon.flush();if(hi>0){hi--;restore()}}
function redo(){if(editId)exitEdit();commitSoon.flush();if(hi<hist.length-1){hi++;restore()}}
function resetHistory(){hist=[JSON.stringify(deck)];hi=0;undoUI()}
