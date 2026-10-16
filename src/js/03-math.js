/* ================= MathJax queue ================= */
let chain=Promise.resolve(),mathOk=false;
function typeset(nodes){
  chain=chain.then(()=>window.mathReady).then(()=>{
    if(window.__mjFailed||!window.MathJax||!MathJax.typesetPromise)return;
    mathOk=true;const live=nodes.filter(n=>n&&n.isConnected);
    return live.length?MathJax.typesetPromise(live):null;
  }).catch(err=>console.warn(err));
  return chain;
}
function clearMath(n){if(mathOk&&n&&MathJax.typesetClear){try{MathJax.typesetClear([n])}catch(e){}}}

function applyPreamble(){
  const b=$('#preambleBox');clearMath(b);b.innerHTML='\\('+esc((deck.packages||[]).map(p=>'\\require{'+p+'}').join('')+(deck.texPkgs||[]).filter(p=>p.math&&p.mathCode).map(p=>p.mathCode).join('\n')+'\n'+(deck.preamble||''))+'\n\\)';
  return typeset([b]).then(()=>{const er=b.querySelector('[data-mjx-error]');preErr=er?(er.getAttribute('data-mjx-error')||'erro desconhecido'):'';updatePreStatus()});
}
function updatePreStatus(){const p=$('#preStatus');if(!p)return;
  if(window.__mjFailed){p.textContent='O MathJax não carregou (sem internet?). O LaTeX aparece como texto.';p.className='hint err';return}
  p.textContent=preErr?'Erro no preâmbulo: '+preErr:'Macros carregadas.';p.className='hint'+(preErr?' err':'')}

/* ================= html sanitizer ================= */
const TAGMAP={B:'b',STRONG:'b',I:'i',EM:'i',U:'u',S:'s',STRIKE:'s',DEL:'s',SUB:'sub',SUP:'sup',BR:'br',DIV:'div',P:'div',H1:'div',H2:'div',H3:'div',H4:'div',BLOCKQUOTE:'div',UL:'ul',OL:'ol',LI:'li',SPAN:'span',FONT:'span',A:'a'};
const SPANSTY=['color','background-color','font-size','font-family','font-weight','font-style','text-decoration-line','vertical-align'];
const BLOCKSTY=['text-align','margin-left'],LISTSTY=['list-style-type','margin-left'];
function safeHref(h){h=String(h||'').trim();return /^(https?:\/\/|mailto:|#slide:)/i.test(h)?h:null}
function sanitizeHTML(html){
  const src=document.createElement('div');src.innerHTML=html;const out=document.createElement('div');
  (function walk(from,to){
    Array.from(from.childNodes).forEach(n=>{
      if(n.nodeType===3){to.appendChild(document.createTextNode(n.nodeValue));return}
      if(n.nodeType!==1)return;
      const tag=TAGMAP[n.tagName];
      if(!tag){walk(n,to);return}
      const el=document.createElement(tag);
      const keep=list=>{const st=[];list.forEach(p=>{const v=n.style&&n.style.getPropertyValue(p);if(v)st.push(p+':'+v)});return st};
      if(tag==='span'){
        const st=keep(SPANSTY);
        if(n.tagName==='FONT'){if(n.getAttribute('color'))st.push('color:'+n.getAttribute('color'));if(n.getAttribute('face'))st.push('font-family:'+n.getAttribute('face'))}
        if(!st.length){walk(n,to);return}
        el.setAttribute('style',st.join(';'));
      }else if(tag==='div'||tag==='li'){const st=keep(BLOCKSTY);if(st.length)el.setAttribute('style',st.join(';'))}
      else if(tag==='ul'||tag==='ol'){const st=keep(LISTSTY);if(st.length)el.setAttribute('style',st.join(';'))}
      else if(tag==='a'){const h=safeHref(n.getAttribute('href'));if(!h){walk(n,to);return}el.setAttribute('href',h)}
      walk(n,el);
      if(tag!=='br'&&tag!=='div'&&tag!=='li'&&!el.childNodes.length)return;
      to.appendChild(el);
    });
  })(src,out);
  const fin=document.createElement('div');let run=null;
  Array.from(out.childNodes).forEach(n=>{
    const block=n.nodeType===1&&(n.tagName==='DIV'||n.tagName==='UL'||n.tagName==='OL');
    if(block){run=null;fin.appendChild(n);return}
    if(n.nodeType===1&&n.tagName==='LI'){const ul=document.createElement('ul');ul.appendChild(n);fin.appendChild(ul);run=null;return}
    if(!run){run=document.createElement('div');fin.appendChild(run)}
    run.appendChild(n);
  });
  return fin.innerHTML;
}
function isEmptyHTML(h){if(!h)return true;const d=document.createElement('div');d.innerHTML=h;return !d.textContent.trim()}
function stripStyle(html,prop){const d=document.createElement('div');d.innerHTML=html||'';d.querySelectorAll('[style]').forEach(n=>n.style.removeProperty(prop));return sanitizeHTML(d.innerHTML)}
function plainHTML(html){const d=document.createElement('div');d.innerHTML=html||'';d.querySelectorAll('b,i,u,s,sub,sup,span').forEach(n=>n.replaceWith(...n.childNodes));
  d.querySelectorAll('[style]').forEach(n=>{n.style.removeProperty('margin-left')});return sanitizeHTML(d.innerHTML)}
function fixFontTags(tx,base){
  if(!tx||!pendingSize)return;
  const em=(+(pendingSize/(base||28)).toFixed(4))+'em';
  tx.querySelectorAll('font[size]').forEach(f=>{const sp=document.createElement('span');sp.style.fontSize=em;
    if(f.getAttribute('color'))sp.style.color=f.getAttribute('color');if(f.getAttribute('face'))sp.style.fontFamily=f.getAttribute('face');
    while(f.firstChild)sp.appendChild(f.firstChild);f.replaceWith(sp)});
  tx.querySelectorAll('span').forEach(s=>{if(/xxx-large/.test(s.style.fontSize))s.style.fontSize=em});
}
/* walk text nodes outside math and transform them */
function mapTextOutsideMath(root,fn){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{const s=n.nodeValue;let out='',last=0;s.replace(MATH_RE,(m,off)=>{out+=fn(s.slice(last,off))+m;last=off+m.length;return m});out+=fn(s.slice(last));if(out!==s)n.nodeValue=out});
}
function changeCase(s,mode){
  if(mode==='upper')return s.toLocaleUpperCase('pt-BR');
  if(mode==='lower')return s.toLocaleLowerCase('pt-BR');
  return s.toLocaleLowerCase('pt-BR').replace(/(^|[\s(\[{"“'«-])(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase('pt-BR'));
}
