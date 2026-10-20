/* ================= tradução: núcleo (o tradutor do documento fica em 16-i18n.js) ================= */
const I18N_RE=(()=>{
  const esc=k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),w=/[\p{L}\d]/u;
  const ks=Object.keys(I18N_EN).sort((a,b)=>b.length-a.length);
  return new RegExp(ks.map(k=>(w.test(k[0])?'(?<![\\p{L}\\d])':'')+esc(k)+(w.test(k[k.length-1])?'(?![\\p{L}\\d])':'')).join('|'),'gu');
})();
const i18nCache=new Map();
function trEN(s){
  if(!s||!/[A-Za-zÀ-ÿ]/.test(s))return s;
  let r=i18nCache.get(s);if(r!=null)return r;
  const t=s.trim();
  r=I18N_EN[t]!=null?s.replace(t,I18N_EN[t]):s.replace(I18N_RE,m=>I18N_EN[m]);
  if(i18nCache.size>5000)i18nCache.clear();i18nCache.set(s,r);return r;
}
function i18n(s){return LANG==='en'?trEN(s):s}
