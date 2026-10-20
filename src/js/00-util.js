'use strict';
let W=1280,H=720;
const KEY_LIB='lousa-lib',KEY_DECK='lousa-deck:',KEY_VER='lousa-ver:',KEY_CUR='lousa-current',KEY_OLD2='lousa-tex-v2',KEY_OLD1='lousa-tex-v1',UIKEY='lousa-tex-ui';
const $=s=>document.querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const uid=()=>Math.random().toString(36).slice(2,10);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const standalone=(()=>{try{return window.self===window.top}catch(e){return false}})();
const IS_MAC=/Mac|iPhone|iPad/.test(navigator.platform);
const MOD=IS_MAC?'⌘':'Ctrl+';
const ALT=IS_MAC?'⌥':'Alt+';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function debounce(fn,ms){let t=null;const d=()=>{clearTimeout(t);t=setTimeout(()=>{t=null;fn()},ms)};
  d.flush=()=>{if(t){clearTimeout(t);t=null;fn()}};d.cancel=()=>{clearTimeout(t);t=null};return d}
function rafThrottle(fn){let p=false;return()=>{if(p)return;p=true;requestAnimationFrame(()=>{p=false;fn()})}}
function hexRgb(h){h=String(h||'#000').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16)||0;return[(n>>16)&255,(n>>8)&255,n&255]}
function rgba(h,a){const c=hexRgb(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
function mixHex(a,b,t){const x=hexRgb(a),y=hexRgb(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function toHex(css){css=String(css||'');if(/^#[0-9a-f]{3,8}$/i.test(css))return '#'+hexRgb(css).map(v=>v.toString(16).padStart(2,'0')).join('');
  const m=css.match(/\d+(\.\d+)?/g);if(!m||m.length<3)return '#000000';return '#'+m.slice(0,3).map(v=>Math.round(+v).toString(16).padStart(2,'0')).join('')}
function lum(hex){const v=hexRgb(toHex(hex)).map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*v[0]+.7152*v[1]+.0722*v[2]}
let LANG='pt';
function fmtDate(t){try{return new Date(t).toLocaleString(LANG==='en'?'en-US':'pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){localStorage.setItem(k,v)}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function textOf(html){const d=document.createElement('div');d.innerHTML=html||'';return d.textContent}
function slug(t){return(t||'apresentacao').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'apresentacao'}
function fmtNum(v){if(!isFinite(v))return '';const a=Math.abs(v);if(a!==0&&(a>=1e5||a<1e-3))return v.toExponential(1).replace('e+','e');return String(+v.toFixed(6)).replace('.',',')}
function num(s){if(s==null||s==='')return NaN;return parseFloat(String(s).replace(/\s/g,'').replace(',','.'))}
let toastT;
function toast(m,ms){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},ms||3800)}
function saveFile(name,text,mime){
  if(standalone){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime||'text/plain;charset=utf-8'}));a.download=name;
    document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast('Arquivo '+name+' baixado.');
  }else showTextModal(name,text);
}
function saveBlob(name,blob){
  if(!standalone){toast('Aqui no Claude o navegador não permite baixar arquivos. Use a versão local ou hospedada.');return}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);toast('Arquivo '+name+' baixado.');
}
function loadScriptOnce(src){window.__ls=window.__ls||{};if(!window.__ls[src])window.__ls[src]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=()=>{delete window.__ls[src];no(new Error('Não consegui carregar '+src))};document.head.appendChild(s)});return window.__ls[src]}
