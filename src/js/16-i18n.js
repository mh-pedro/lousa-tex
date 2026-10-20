/* ================= idioma da interface (português / inglês) =================
   A interface é escrita em português. Em inglês, um tradutor percorre o documento e troca os textos
   da interface (e os atributos title, aria-label, placeholder e data-ph) pelas frases do dicionário
   I18N_EN. O conteúdo das apresentações (slides, anotações, comentários, títulos) nunca é traduzido.
   O idioma segue o navegador (prefs.lang = 'auto') ou a escolha feita em Exibir › Idioma. */
const LANG_OPTS=[['auto','Automático (do navegador)'],['pt','Português'],['en','English']];
const I18N_SKIP='.slide,.tx,#notes,#prNotes,#pnotes,#pcaps,.ctext,.hm-meta b,pre,code,textarea,script,style,mjx-container,.ld-bg,svg,[data-noi18n],#print,#tikzHost,#preambleBox,#pvIn,#deckTitle';
const I18N_ATTRS=['title','aria-label','placeholder','data-ph'];
const I18N_ATTR_SKIP='.slide,[data-noi18n]';
/* guarda o texto original de cada nó para poder voltar ao português sem recarregar */
const i18nText=new WeakMap(),i18nAttr=new WeakMap();
function i18nNode(n){
  const v=n.nodeValue,o=i18nText.get(n);
  if(o&&v===o.en)return;
  const en=trEN(v);if(en===v){if(o)i18nText.delete(n);return}
  i18nText.set(n,{pt:v,en:en});n.nodeValue=en;
}
function i18nAttrs(el,inSkip){
  for(const a of I18N_ATTRS){
    if(inSkip&&a!=='data-ph'&&a!=='placeholder')continue;
    const v=el.getAttribute(a);if(v==null)continue;
    let m=i18nAttr.get(el);const o=m&&m[a];if(o&&v===o.en)continue;
    const en=trEN(v);if(en===v)continue;
    if(!m){m={};i18nAttr.set(el,m)}m[a]={pt:v,en:en};el.setAttribute(a,en);
  }
}
function i18nWalk(root){
  if(root.nodeType===3){const p=root.parentElement;if(p&&!p.closest(I18N_SKIP))i18nNode(root);return}
  if(root.nodeType!==1)return;
  const skip0=!!root.closest(I18N_SKIP),askip0=!!root.closest(I18N_ATTR_SKIP);
  i18nAttrs(root,askip0);
  root.querySelectorAll('[title],[aria-label],[placeholder],[data-ph]').forEach(el=>i18nAttrs(el,askip0||!!el.closest(I18N_ATTR_SKIP)));
  if(skip0)return;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeType===1?(n.matches(I18N_SKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_SKIP):NodeFilter.FILTER_ACCEPT});
  let n;while((n=tw.nextNode()))i18nNode(n);
}
function i18nRestore(){
  const tw=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let n;
  while((n=tw.nextNode())){const o=i18nText.get(n);if(o&&n.nodeValue===o.en)n.nodeValue=o.pt;i18nText.delete(n)}
  document.querySelectorAll('[title],[aria-label],[placeholder],[data-ph]').forEach(el=>{const m=i18nAttr.get(el);if(!m)return;
    for(const a in m)if(el.getAttribute(a)===m[a].en)el.setAttribute(a,m[a].pt);i18nAttr.delete(el)});
}
const i18nObs=new MutationObserver(recs=>{
  if(LANG!=='en')return;
  for(const r of recs){
    if(r.type==='childList')r.addedNodes.forEach(i18nWalk);
    else if(r.type==='characterData'){const p=r.target.parentElement;if(p&&!p.closest(I18N_SKIP))i18nNode(r.target)}
    else if(r.type==='attributes'&&r.target.nodeType===1)i18nAttrs(r.target,!!r.target.closest(I18N_ATTR_SKIP));
  }
  i18nObs.takeRecords();
});
function applyLang(){
  document.documentElement.lang=LANG==='en'?'en':'pt-BR';
  document.title=LANG==='en'?'Lousa TeX · LaTeX slides':'Lousa TeX';
  document.querySelectorAll('[data-setlang]').forEach(b=>b.classList.toggle('on',b.dataset.setlang===LANG));
  if(LANG==='en')i18nWalk(document.body);else i18nRestore();
}
function setLang(v){
  prefs.lang=v;savePrefs();const nl=v==='auto'?browserLang():v;if(nl===LANG)return;
  LANG=nl;i18nCache.clear();applyLang();
  if(typeof sideMode!=='undefined'&&sideMode)renderSide();
  if(typeof rebuildThumbsSoon==='function')rebuildThumbsSoon();
}
function langItems(){return LANG_OPTS.map(o=>({label:o[1],checked:(prefs.lang||'auto')===o[0],act:()=>setLang(o[0])}))}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-setlang]');if(!b)return;ev.preventDefault();setLang(b.dataset.setlang)});
i18nObs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:I18N_ATTRS});
applyLang();
