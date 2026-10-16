/* ================= math expressions for function plots ================= */
const FNS={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,arcsin:Math.asin,arccos:Math.acos,arctan:Math.atan,
  sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,asinh:Math.asinh,acosh:Math.acosh,atanh:Math.atanh,exp:Math.exp,ln:Math.log,log:Math.log,log10:Math.log10,log2:Math.log2,
  sqrt:Math.sqrt,cbrt:Math.cbrt,abs:Math.abs,sign:Math.sign,floor:Math.floor,ceil:Math.ceil,round:Math.round,sec:x=>1/Math.cos(x),csc:x=>1/Math.sin(x),cot:x=>1/Math.tan(x),
  sinc:x=>x===0?1:Math.sin(x)/x,heaviside:x=>x<0?0:1,H:x=>x<0?0:1,erf:x=>{const t=1/(1+.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return x>=0?y:-y},
  gamma:x=>{if(x<.5)return Math.PI/(Math.sin(Math.PI*x)*FNS.gamma(1-x));x-=1;const g=7,c=[.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];let a=c[0];const t=x+g+.5;for(let i=1;i<9;i++)a+=c[i]/(x+i);return Math.sqrt(2*Math.PI)*Math.pow(t,x+.5)*Math.exp(-t)*a},
  min:Math.min,max:Math.max,pow:Math.pow,atan2:Math.atan2,mod:(a,b)=>((a%b)+b)%b};
const CONSTS={pi:Math.PI,e:Math.E,tau:2*Math.PI,inf:Infinity};
function compileExpr(src){
  src=String(src).replace(/\\(?=[a-zA-Z])/g,'').replace(/\\cdot|·|×/g,'*').replace(/−/g,'-').replace(/\*\*/g,'^').replace(/\\left|\\right/g,'').replace(/[{}]/g,m=>m==='{'?'(':')').replace(/π/g,'pi');
  const tk=[];const re=/\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z_0-9]*)|(\S))/y;let m;
  while(re.lastIndex<src.length&&(m=re.exec(src))){if(m[1])tk.push({t:'n',v:parseFloat(m[1])});else if(m[2])tk.push({t:'i',v:m[2]});else if(m[3])tk.push({t:'o',v:m[3]})}
  let p=0;const peek=()=>tk[p],next=()=>tk[p++];
  const isStart=t=>t&&(t.t==='n'||t.t==='i'||(t.t==='o'&&t.v==='('));
  function expr(){let a=term();while(peek()&&peek().t==='o'&&(peek().v==='+'||peek().v==='-')){const op=next().v,b=term(),A=a;a=op==='+'?x=>A(x)+b(x):x=>A(x)-b(x)}return a}
  function term(){let a=unary();for(;;){const t=peek();if(t&&t.t==='o'&&(t.v==='*'||t.v==='/')){next();const b=unary(),A=a;a=t.v==='*'?x=>A(x)*b(x):x=>A(x)/b(x)}
    else if(isStart(t)){const b=unary(),A=a;a=x=>A(x)*b(x)}else break}return a}
  function unary(){const t=peek();if(t&&t.t==='o'&&(t.v==='-'||t.v==='+')){next();const a=unary();return t.v==='-'?x=>-a(x):a}return power()}
  function power(){const a=atom();const t=peek();if(t&&t.t==='o'&&t.v==='^'){next();const b=unary();return x=>Math.pow(a(x),b(x))}
    if(t&&t.t==='o'&&t.v==='!'){next();return x=>FNS.gamma(a(x)+1)}return a}
  function args(){const out=[expr()];while(peek()&&peek().v===','){next();out.push(expr())}return out}
  function atom(){const t=next();if(!t)throw new Error('expressão incompleta');
    if(t.t==='n'){const v=t.v;return()=>v}
    if(t.t==='o'&&t.v==='('){const a=expr();const c=next();if(!c||c.v!==')')throw new Error('falta fechar parêntese');return a}
    if(t.t==='o'&&t.v==='|'){const a=expr();const c=next();if(!c||c.v!=='|')throw new Error('falta fechar |…|');return x=>Math.abs(a(x))}
    if(t.t==='i'){const name=t.v;
      if(name==='x')return x=>x;
      if(FNS[name]){const f=FNS[name];
        if(peek()&&peek().v==='('){next();const as=args();const c=next();if(!c||c.v!==')')throw new Error('falta fechar parêntese em '+name);return x=>f(...as.map(g=>g(x)))}
        if(peek()&&peek().t==='o'&&peek().v==='^'){next();const ex=unary();const a=unary();return x=>Math.pow(f(a(x)),ex(x))}
        const a=unary();return x=>f(a(x))}
      if(name in CONSTS){const v=CONSTS[name];return()=>v}
      throw new Error('não reconheço "'+name+'"')}
    throw new Error('símbolo inesperado "'+t.v+'"')}
  const f=expr();if(p<tk.length)throw new Error('sobrou "'+tk[p].v+'"');return f;
}
function evalConst(s){if(s==null||String(s).trim()==='')return NaN;try{return compileExpr(String(s).replace(',','.'))(0)}catch(e){return NaN}}

/* ================= citations and equation numbers ================= */
let planCache=null,planSig='';
function invalidatePlan(){planCache=null}
function readingOrder(s){return s.els.slice().sort((a,b)=>(bb(a).y-bb(b).y)||(bb(a).x-bb(b).x))}
const CITE_RE=/\\cite[pt]?\{([^}]*)\}/g;
function computePlan(){
  const cites=[],seen=new Set(),labels={},segs={};let eq=0;const auto=!!deck.theme.eqAuto;
  const scan=(html,key)=>{
    if(!html)return;
    html.replace(CITE_RE,(m,ks)=>{ks.split(',').map(k=>k.trim()).filter(Boolean).forEach(k=>{if(!seen.has(k)){seen.add(k);cites.push(k)}});return m});
    const arr=[];
    html.replace(MATH_RE,m=>{const disp=m.startsWith('$$')||m.startsWith('\\[');if(!disp)return m;
      const labs=[...m.matchAll(/\\label\{([^}]+)\}/g)].map(x=>x[1]);
      if(labs.length)arr.push({nums:labs.map(l=>{eq++;labels[l]=eq;return eq})});
      else if(auto&&!/\\(notag|nonumber|tag)\b/.test(m)){eq++;arr.push({auto:eq})}
      else arr.push(null);
      return m});
    segs[key]=arr;
  };
  deck.slides.forEach(s=>readingOrder(s).forEach(e=>{if(e.type==='box'&&e.role!=='refs'&&e.role!=='toc')scan(e.html,e.id);else if(e.type==='table')e.cells.forEach((row,r)=>row.forEach((c,cc)=>{if(!c.hide)scan(c.html,e.id+':'+r+':'+cc)}))}));
  const nums={};cites.forEach((k,i)=>{nums[k]=i+1});
  return{cites:cites,nums:nums,labels:labels,segs:segs};
}
function plan(){if(!planCache)planCache=computePlan();return planCache}
function xform(html,key){
  if(!html||html.indexOf('\\')<0)return html;
  const pl=plan(),seg=pl.segs[key]||[];let si=0;
  let out=html.replace(MATH_RE,m=>{const disp=m.startsWith('$$')||m.startsWith('\\[');if(!disp)return m;const sg=seg[si++];if(!sg)return m.replace(/\\label\{[^}]*\}/g,'');
    if(sg.auto)return m.replace(/(\$\$|\\\])$/,'\\tag{'+sg.auto+'}$1');
    let j=0;return m.replace(/\\label\{([^}]+)\}/g,()=>'\\tag{'+(sg.nums[j++]||'?')+'}')});
  out=out.replace(/\\eqref\{([^}]+)\}/g,(m,k)=>'('+(pl.labels[k]||'??')+')').replace(/\\ref\{([^}]+)\}/g,(m,k)=>String(pl.labels[k]||'??'));
  out=out.replace(CITE_RE,(m,ks)=>'['+ks.split(',').map(k=>k.trim()).filter(Boolean).map(k=>pl.nums[k]||'?').join(', ')+']');
  return out;
}
function slideCites(s){const out=[];s.els.forEach(e=>{const hs=e.type==='box'?[e.html]:e.type==='table'?e.cells.flat().map(c=>c.html):[];
  hs.forEach(h=>{if(h)h.replace(CITE_RE,(m,ks)=>{ks.split(',').map(k=>k.trim()).filter(Boolean).forEach(k=>{if(!out.includes(k))out.push(k)});return m})})});
  return out.sort((a,b)=>(plan().nums[a]||0)-(plan().nums[b]||0))}
const citeNum=k=>plan().nums[k]||'?';
const refByKey=k=>deck.refs.find(r=>r.key===k)||null;
function surname(a){a=String(a).trim();if(!a)return '';if(a.indexOf(',')>=0)return a.split(',')[0].trim();const p=a.split(/\s+/);return p[p.length-1]}
function authorList(r){return String(r.authors||'').split(/\s+and\s+/i).map(s=>s.trim()).filter(Boolean)}
function refShort(r){const au=authorList(r);let a=au.length?surname(au[0])+(au.length>1?(au.length===2?' e '+surname(au[1]):' et al.'):''):'';
  let src=r.journal?r.journal+(r.volume?' '+r.volume:'')+(r.pages?', '+r.pages:''):(r.arxiv?'arXiv:'+r.arxiv:'');
  return [a,src].filter(Boolean).join(', ')+(r.year?' ('+r.year+')':'')}
function refFull(r){const au=authorList(r).map(x=>x.indexOf(',')>=0?x.split(',').slice(1).join(' ').trim()+' '+x.split(',')[0].trim():x);
  const a=au.length>5?au.slice(0,3).join(', ')+' et al.':au.join(', ');
  return [a,r.title?'“'+r.title+'”':'',r.journal?r.journal+(r.volume?' '+r.volume:'')+(r.pages?', '+r.pages:''):'',r.year?'('+r.year+')':'',r.arxiv?'arXiv:'+r.arxiv:'',r.doi?'doi:'+r.doi:''].filter(Boolean).join(', ')}
function autoHTML(role){
  if(role==='refs'){const pl=plan();let list=pl.cites.length?pl.cites:deck.refs.map(r=>r.key);
    if(!list.length)return '<div style="opacity:.6">As referências citadas com \\cite{chave} aparecem aqui automaticamente.</div>';
    return '<ol class="reflist">'+list.map(k=>{const r=refByKey(k);return '<li>'+(r?esc(refFull(r)):'Referência “'+esc(k)+'” não está na biblioteca')+'</li>'}).join('')+'</ol>'}
  if(role==='toc'){let secs=deck.slides.filter(s=>s.layout==='section');if(!secs.length)secs=deck.slides.filter(s=>s.els.some(e=>e.role==='title'&&!isEmptyHTML(e.html))&&!s.els.some(e=>e.role==='toc'||e.role==='refs'));
    return '<ol>'+secs.map(s=>{const t=s.els.find(e=>e.role==='title');return '<li>'+(t?sanitizeHTML(t.html).replace(/<\/?div>/g,' '):'Sem título')+'</li>'}).join('')+'</ol>'}
  return '';
}
function planSignature(){const pl=computePlan();return JSON.stringify([pl.nums,pl.labels,pl.segs,deck.refs.length,deck.slides.filter(s=>s.layout==='section').map(slideTitle)])}
const refreshPlanSoon=debounce(()=>{if(editId||P.on){refreshPlanSoon();return}const sig=planSignature();if(sig!==planSig){planSig=sig;invalidatePlan();rerenderAll()}},700);
function parseBibtex(src){
  const out=[];src=String(src);let i=0;
  while((i=src.indexOf('@',i))>=0){
    const m=/^@(\w+)\s*\{\s*([^,\s]+)\s*,/.exec(src.slice(i));if(!m){i++;continue}
    const open=i+m[0].indexOf('{');let depth=0,end=src.length;
    for(let k=open;k<src.length;k++){const ch=src[k];if(ch==='{')depth++;else if(ch==='}'){depth--;if(depth===0){end=k;break}}}
    const body=src.slice(i+m[0].length,end),f={};let p=0;
    while(p<body.length){const fm=/\s*([\w-]+)\s*=\s*/y;fm.lastIndex=p;const r=fm.exec(body);if(!r)break;p=fm.lastIndex;let val='';
      if(body[p]==='{'){let d=0,q=p;for(;q<body.length;q++){if(body[q]==='{')d++;else if(body[q]==='}'){d--;if(d===0)break}}val=body.slice(p+1,q);p=q+1}
      else if(body[p]==='"'){let q=p+1;while(q<body.length&&body[q]!=='"')q++;val=body.slice(p+1,q);p=q+1}
      else{const q=/[^,]*/y;q.lastIndex=p;val=q.exec(body)[0].trim();p=q.lastIndex}
      f[r[1].toLowerCase()]=val.replace(/\\["'`^~]\{?([a-zA-Z])\}?/g,'$1').replace(/[{}]/g,'').replace(/\s+/g,' ').trim();
      const c=/\s*,?/y;c.lastIndex=p;c.exec(body);p=c.lastIndex}
    out.push({key:m[2],authors:f.author||f.editor||'',title:f.title||'',journal:f.journal||f.booktitle||'',volume:f.volume||'',pages:f.pages||'',year:f.year||'',arxiv:f.eprint||'',doi:f.doi||'',url:f.url||''});
    i=end+1;
  }
  return out;
}
function addRefs(list){let n=0;list.forEach(r=>{const i=deck.refs.findIndex(x=>x.key===r.key);if(i>=0)deck.refs[i]=Object.assign(deck.refs[i],r);else{deck.refs.push(r);n++}});commit();invalidatePlan();rerenderAll();return n}
async function inspireSearch(q){
  q=q.trim();let query=q;
  if(/^(arxiv:)?\d{4}\.\d{4,5}(v\d+)?$/i.test(q)||/^(arxiv:)?[a-z-]+(\.[a-z]{2})?\/\d{7}$/i.test(q))query='arxiv:'+q.replace(/^arxiv:/i,'').replace(/v\d+$/,'');
  else if(/^(doi:)?10\.\d{4,}\//i.test(q))query='doi:'+q.replace(/^doi:/i,'');
  const url='https://inspirehep.net/api/literature?size=8&sort=mostcited&q='+encodeURIComponent(query)+'&fields=titles.title,authors.full_name,author_count,arxiv_eprints.value,dois.value,publication_info,texkeys';
  const r=await fetch(url);if(!r.ok)throw new Error('o INSPIRE respondeu com erro '+r.status);const j=await r.json();
  return((j.hits&&j.hits.hits)||[]).map(h=>{const m=h.metadata||{},pi=(m.publication_info||[]).find(x=>x.journal_title)||{},au=(m.authors||[]).map(a=>a.full_name);
    return{key:(m.texkeys||[])[0]||('ref:'+uid()),authors:au.slice(0,8).join(' and ')+((m.author_count||au.length)>8?' and others':''),title:((m.titles||[])[0]||{}).title||'',
      journal:pi.journal_title||'',volume:pi.journal_volume||'',pages:pi.page_start||pi.artid||'',year:String(pi.year||''),arxiv:((m.arxiv_eprints||[])[0]||{}).value||'',doi:((m.dois||[])[0]||{}).value||''}});
}
function insertCite(key){
  const t='\\cite{'+key+'}';
  if(editId){restoreSel();document.execCommand('insertText',false,t);afterEditChange();return}
  const e=selBoxes()[0];if(e){e.html=(e.html||'')+'<div>'+esc(t)+'</div>';refreshEl(e);commit();return}
  addEls([box({x:Math.round(W*.1),y:Math.round(H*.4),w:Math.round(W*.5),h:50,size:24,html:'<div>'+esc(t)+'</div>'})]);
}
function refsModal(){
  const canFetch=standalone;
  const row=r=>'<div class="li" data-key="'+esc(r.key)+'"><div class="t"><b>'+esc(r.key)+'</b><small>'+esc(refShort(r)||r.title)+'</small></div><button type="button" class="btn small" data-a="cite">Citar</button><button type="button" class="btn small" data-a="del">Remover</button></div>';
  openModal('Referências bibliográficas','<div class="row"><label class="lab">Buscar no INSPIRE-HEP (número arXiv, DOI ou texto)<input id="rfQ" placeholder="2101.00001, 10.1103/PhysRevD.…, ou autor e tema"></label><button type="button" class="btn primary" id="rfGo" style="flex:none">Buscar</button></div>'+
    (canFetch?'':'<p class="hint">Aqui no Claude a busca on-line é bloqueada. Na versão local ou hospedada funciona; aqui, cole o BibTeX abaixo.</p>')+'<div class="list" id="rfRes"></div>'+
    '<details><summary class="hint" style="cursor:pointer">Colar BibTeX</summary><textarea id="rfBib" class="mono" rows="6" spellcheck="false" placeholder="@article{chave, author = {…}, title = {…}, journal = {…}, year = {…}}"></textarea><div class="btns" style="margin-top:6px"><button type="button" class="btn" id="rfImp">Importar BibTeX</button></div></details>'+
    '<div class="ih">Biblioteca desta apresentação ('+deck.refs.length+')</div><div class="list" id="rfLib">'+(deck.refs.length?deck.refs.map(row).join(''):'<p class="hint">Nenhuma referência ainda.</p>')+'</div>'+
    '<p class="hint">No texto, escreva <code>\\cite{chave}</code> (vários: <code>\\cite{a,b}</code>). O número aparece no slide, a referência vai para o rodapé e para o slide de referências (Inserir › Slide de referências).</p>',
    {wide:true,mount:b=>{
      const res=b.querySelector('#rfRes');let found=[];
      const go=async()=>{const q=b.querySelector('#rfQ').value.trim();if(!q)return;res.innerHTML='<p class="hint">Buscando…</p>';
        try{found=await inspireSearch(q);res.innerHTML=found.length?found.map((r,i)=>'<div class="li"><div class="t"><b>'+esc(r.title||r.key)+'</b><small>'+esc(refShort(r))+' · '+esc(r.key)+'</small></div><button type="button" class="btn small primary" data-add="'+i+'">Adicionar</button></div>').join(''):'<p class="hint">Nada encontrado.</p>'}
        catch(e){res.innerHTML='<p class="hint err">Não consegui buscar: '+esc(e.message)+(canFetch?'':' (bloqueado aqui no Claude)')+'</p>'}};
      b.querySelector('#rfGo').onclick=go;b.querySelector('#rfQ').addEventListener('keydown',e=>{if(e.key==='Enter')go()});
      res.addEventListener('click',ev=>{const x=ev.target.closest('[data-add]');if(!x)return;const r=found[+x.dataset.add];addRefs([r]);x.textContent='Adicionada';x.disabled=true;toast('Referência '+r.key+' adicionada.');refsModalRefreshLib(b)});
      b.querySelector('#rfImp').onclick=()=>{const l=parseBibtex(b.querySelector('#rfBib').value);if(!l.length){toast('Não encontrei entradas BibTeX válidas.');return}const n=addRefs(l);toast(l.length+' entradas lidas, '+n+' novas.');refsModalRefreshLib(b)};
      b.querySelector('#rfLib').addEventListener('click',ev=>{const a=ev.target.closest('[data-a]');if(!a)return;const k=a.closest('[data-key]').dataset.key;
        if(a.dataset.a==='cite'){closeModal();insertCite(k)}else{deck.refs=deck.refs.filter(r=>r.key!==k);commit();invalidatePlan();rerenderAll();refsModalRefreshLib(b)}});
    }});
  function refsModalRefreshLib(b){const L=b.querySelector('#rfLib');L.innerHTML=deck.refs.length?deck.refs.map(row).join(''):'<p class="hint">Nenhuma referência ainda.</p>'}
}
function insertRefsSlide(){if(editId)exitEdit();if(masterMode)exitMaster();const s=makeSlide('titleBody');s.els[0].html='<div>Referências</div>';Object.assign(s.els[1],{role:'refs',size:20,fit:'shrink'});
  deck.slides.push(s);rebuildThumbs();goto(deck.slides.length-1);commit();toast('Slide de referências criado no final. Ele se atualiza sozinho.')}
function insertTocSlide(){if(editId)exitEdit();if(masterMode)exitMaster();const s=makeSlide('titleBody');s.els[0].html='<div>Sumário</div>';Object.assign(s.els[1],{role:'toc',size:30});
  deck.slides.splice(cur+1,0,s);rebuildThumbs();goto(cur+1);commit();toast('Sumário criado a partir dos cabeçalhos de seção (layout "Cabeçalho de seção").')}

/* ================= Beamer-style blocks ================= */
const BLOCKS={teorema:['Teorema','accent'],definicao:['Definição','accent'],proposicao:['Proposição','accent'],exemplo:['Exemplo','#2e9e6a'],alerta:['Atenção','#c5221f'],obs:['Observação','muted']};
function insertBlock(k){
  const b=BLOCKS[k],g=uid(),x=Math.round(W*.14),y=Math.round(H*.3),w=Math.round(W*.72);
  const head=box({x:x,y:y,w:w,h:44,size:24,bold:true,fill:b[1],fillOpacity:1,color:'#ffffff',shape:'rect',radius:0,pad:10,valign:'middle',fit:'none',group:g,html:'<div>'+b[0]+'</div>'});
  const body=box({x:x,y:y+44,w:w,h:130,size:24,fill:b[1],fillOpacity:.1,shape:'rect',radius:0,pad:16,fit:'grow',group:g,html:'<div>Escreva aqui, com $\\LaTeX$ se quiser.</div>'});
  addEls([body,head]);
}

/* ================= camera and recording ================= */
const REC={rec:null,chunks:[],cam:null};
function mountCam(){if(!REC.cam)return;P.views.forEach(v=>{if(v.container.querySelector(':scope>.cambub'))return;const vd=v.doc.createElement('video');vd.className='cambub';vd.autoplay=true;vd.muted=true;vd.playsInline=true;vd.srcObject=REC.cam;v.container.appendChild(vd);const p=vd.play();if(p&&p.catch)p.catch(()=>{})})}
function unmountCam(){P.views.forEach(v=>{const c=v.container.querySelector(':scope>.cambub');if(c)c.remove()})}
async function toggleCamera(){
  if(REC.cam){REC.cam.getTracks().forEach(t=>t.stop());REC.cam=null;unmountCam();updatePTools();return}
  try{REC.cam=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480}},audio:false});mountCam();updatePTools()}
  catch(e){toast(standalone?'Não foi possível usar a câmera ('+(e.name==='NotAllowedError'?'permissão negada':e.message)+').':'A câmera só funciona na versão local ou hospedada.')}
}
async function startRecording(presenter){
  if(!standalone||!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia||!window.MediaRecorder){toast('A gravação funciona na versão local ou hospedada, no Chrome, Edge ou Firefox.');return}
  let disp=null,mic=null;
  try{disp=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:true,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude'})}
  catch(e){toast(e.name==='NotAllowedError'?'Gravação cancelada.':'Não foi possível capturar a tela: '+e.message);return}
  try{mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){toast('Sem microfone: o vídeo será gravado sem a sua voz.')}
  const ac=new AudioContext(),dest=ac.createMediaStreamDestination();[disp,mic].forEach(s=>{if(s&&s.getAudioTracks().length)ac.createMediaStreamSource(s).connect(dest)});
  const out=new MediaStream([...disp.getVideoTracks(),...dest.stream.getAudioTracks()]);
  const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m))||'';
  const rec=new MediaRecorder(out,mime?{mimeType:mime,videoBitsPerSecond:4000000}:undefined);REC.chunks=[];
  rec.ondataavailable=e=>{if(e.data&&e.data.size)REC.chunks.push(e.data)};
  rec.onstop=()=>{const type=(mime||'video/webm').split(';')[0];const blob=new Blob(REC.chunks,{type:type});[disp,mic].forEach(s=>s&&s.getTracks().forEach(t=>t.stop()));try{ac.close()}catch(e){}REC.rec=null;updatePTools();
    saveBlob(slug(deck.title)+'-gravacao.'+(type==='video/mp4'?'mp4':'webm'),blob)};
  disp.getVideoTracks()[0].addEventListener('ended',stopRecording);
  REC.rec=rec;rec.start(1000);startPres(cur,presenter);updatePTools();toast('Gravando. Ao encerrar a apresentação, o vídeo é salvo.');
}
function stopRecording(){if(REC.rec&&REC.rec.state!=='inactive')REC.rec.stop()}

/* ================= PowerPoint export ================= */
function cssText(){return $$('style').map(s=>s.textContent).join('\n').replace(/@media print\{[\s\S]*?\}\s*\}/,'')}
async function rasterize(node,w,h,scale){
  const clone=node.cloneNode(true);Object.assign(clone.style,{left:'0px',top:'0px',transform:'none',position:'absolute'});
  clone.querySelectorAll('.h,.crz,.rrz,.ghost').forEach(x=>x.remove());
  const t=deck.theme;
  const html='<div xmlns="http://www.w3.org/1999/xhtml" class="slide" style="position:relative;width:'+w+'px;height:'+h+'px;background:transparent;color:'+t.fg+';font-family:'+fontStack(t.bodyFont).replace(/"/g,"'")+';--accent:'+t.accent+'"><style><![CDATA['+cssText().replace(/\]\]>/g,'')+tikzFontCss()+']]></style>'+new XMLSerializer().serializeToString(clone)+'</div>';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.ceil(w*scale)+'" height="'+Math.ceil(h*scale)+'" viewBox="0 0 '+w+' '+h+'"><foreignObject x="0" y="0" width="'+w+'" height="'+h+'">'+html+'</foreignObject></svg>';
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
  const c=document.createElement('canvas');c.width=Math.ceil(w*scale);c.height=Math.ceil(h*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  return c.toDataURL('image/png');
}
function hexOf(c){return toHex(resolveColor(c)).slice(1).toUpperCase()}
function htmlRuns(html,e){
  const d=document.createElement('div');d.innerHTML=html||'';const runs=[];
  const walk=(n,st,para)=>{if(n.nodeType===3){if(n.nodeValue)runs.push({text:n.nodeValue,options:Object.assign({},st)});return}
    if(n.nodeType!==1)return;const s=Object.assign({},st);
    if(n.tagName==='B')s.bold=true;if(n.tagName==='I')s.italic=true;if(n.tagName==='U')s.underline=true;if(n.tagName==='S')s.strike=true;
    if(n.tagName==='SUP')s.superscript=true;if(n.tagName==='SUB')s.subscript=true;if(n.tagName==='A')s.hyperlink={url:n.getAttribute('href')};
    if(n.style&&n.style.color)s.color=toHex(n.style.color).slice(1).toUpperCase();
    if(n.style&&/em$/.test(n.style.fontSize))s.fontSize=+(parseFloat(n.style.fontSize)*e.size*.75*(1280/W)).toFixed(1);
    if(n.tagName==='BR'){runs.push({text:'',options:Object.assign({},st,{breakLine:true})});return}
    Array.from(n.childNodes).forEach(c=>walk(c,s));};
  const blocks=(root,lvl,ordered)=>{Array.from(root.children).forEach(b=>{
    if(b.tagName==='UL'||b.tagName==='OL'){Array.from(b.children).forEach(li=>{const sub=Array.from(li.children).filter(x=>x.tagName==='UL'||x.tagName==='OL');sub.forEach(x=>x.remove());
        const start=runs.length;walk(li,{});if(runs.length===start)runs.push({text:'',options:{}});runs[start].options=Object.assign({},runs[start].options,{bullet:b.tagName==='OL'?{type:'number'}:true,indentLevel:lvl});
        runs[runs.length-1].options.breakLine=true;sub.forEach(x=>blocks({children:[x]},lvl+1))})}
    else{const start=runs.length;walk(b,{});if(runs.length===start)runs.push({text:'',options:{}});runs[runs.length-1].options.breakLine=true}})};
  blocks(d,0);if(runs.length)delete runs[runs.length-1].options.breakLine;return runs;
}
async function exportPptx(){
  if(!standalone){toast('A exportação para PowerPoint funciona na versão local ou hospedada.');return}
  if(editId)exitEdit();thumbSoon.flush();toast('Gerando o PowerPoint… pode levar alguns segundos.');
  try{await loadScriptOnce(window.__PPTX_URL||'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js')}catch(e){toast('Não consegui carregar o gerador de PowerPoint. Verifique a conexão.');return}
  await chain;
  const pptx=new PptxGenJS(),IN=13.333/W,PT=IN*72,t=deck.theme;pptx.defineLayout({name:'LOUSA',width:13.333,height:+(H*IN).toFixed(3)});pptx.layout='LOUSA';pptx.title=deck.title;
  const SHP={rect:'rect',text:'rect',round:'roundRect',ellipse:'ellipse',triangle:'triangle',diamond:'diamond',hexagon:'hexagon',pentagon:'pentagon',octagon:'octagon',parallelogram:'parallelogram',trapezoid:'trapezoid',star:'star5',heart:'heart'};
  for(let i=0;i<deck.slides.length;i++){
    const s=deck.slides[i],sl=pptx.addSlide(),node=thumbsEl.children[i]&&thumbsEl.children[i].querySelector('.slide');
    sl.background=s.bgImage||(!s.bg&&t.bgImage)?{data:s.bgImage||t.bgImage}:{color:hexOf(s.bg||t.bg)};
    if(s.skip)sl.hidden=true;
    const els=(s.hideMaster?[]:deck.master.els.map(e=>({e:e,sel:'[data-mid="'+e.id+'"]'}))).concat(s.els.map(e=>({e:e,sel:'[data-id="'+e.id+'"]'})));
    for(const it of els){const e=it.e,b=bb(e),pos={x:b.x*IN,y:b.y*IN,w:Math.max(.01,b.w*IN),h:Math.max(.01,b.h*IN)};
      try{
        if(e.type==='box'&&isEmptyHTML(e.html)&&!e.fill&&!(e.stroke&&e.strokeW>0)&&e.role!=='refs'&&e.role!=='toc')continue;
        const plain=e.type==='box'&&e.role!=='refs'&&e.role!=='toc'&&!/\$|\\\(|\\\[|\\cite|\\ref|\\eqref/.test(e.html||'')&&SHP[e.shape]&&!e.flipH&&!e.flipV;
        if(plain){const o=Object.assign({},pos,{fontFace:fontName(e),fontSize:+(e.size*PT).toFixed(1),color:hexOf(e.color||(e.role==='title'?'title':'fg')),bold:!!e.bold,align:e.align==='justify'?'justify':e.align,valign:e.valign==='middle'?'middle':e.valign,
            margin:+(e.pad*PT).toFixed(1),rotate:e.rot||0,shape:pptx.ShapeType[SHP[e.shape]]||pptx.ShapeType.rect,lineSpacingMultiple:e.lh||1.2,fit:'shrink'});
          if(e.fill)o.fill={color:hexOf(e.fill),transparency:Math.round((1-e.fillOpacity)*100)};if(e.stroke&&e.strokeW>0)o.line={color:hexOf(e.stroke),width:+(e.strokeW*PT).toFixed(2)};
          sl.addText(htmlRuns(e.html,e),o);continue}
        if(e.type==='image'&&!e.mask&&!(e.crop.l||e.crop.t||e.crop.r||e.crop.b)&&!e.flipH&&!e.flipV&&!e.bright&&!e.contrast&&!e.gray){sl.addImage(Object.assign({},pos,{data:e.src,rotate:e.rot||0,transparency:Math.round((1-e.opacity)*100),altText:e.alt||''}));continue}
        if(e.type==='line'&&e.route==='straight'&&!e.a1&&!e.a2){const cap=c=>({arrow:'triangle',open:'arrow',circle:'oval',diamond:'diamond',square:'oval'}[c]||'none');
          sl.addShape(pptx.ShapeType.line,Object.assign({},pos,{flipH:e.x2<e.x1,flipV:e.y2<e.y1,line:{color:hexOf(e.stroke),width:+(e.strokeW*PT).toFixed(2),dashType:e.dash==='dash'?'dash':e.dash==='dot'?'sysDot':'solid',beginArrowType:cap(e.startCap),endArrowType:cap(e.endCap)}}));continue}
        if(e.type==='media'){if(e.kind==='youtube'&&e.url){sl.addText('▶ '+(e.title||'Vídeo do YouTube'),Object.assign({},pos,{hyperlink:{url:e.url},fontSize:18,color:'FFFFFF',fill:{color:'141716'},align:'center',valign:'middle'}))}continue}
        const d=node&&node.querySelector(it.sel);if(!d)continue;
        const pad=e.type==='line'?0:0,png=await rasterize(d,e.type==='line'?parseFloat(d.style.width):e.w+pad,e.type==='line'?parseFloat(d.style.height):(e.type==='box'||e.type==='table'?Math.max(e.h,d.offsetHeight):e.h),2);
        if(e.type==='line'){const g=lineGeom(e);sl.addImage({data:png,x:g.x*IN,y:g.y*IN,w:g.w*IN,h:g.h*IN});continue}
        sl.addImage(Object.assign({},pos,{h:(e.type==='box'||e.type==='table'?Math.max(e.h,d.offsetHeight):e.h)*IN,data:png,rotate:e.rot||0}));
      }catch(err){console.warn('pptx',e.type,err)}
    }
    if(t.showNumbers&&i>0&&!(s.num&&s.num.hide)){const pos=t.numPos||'br',bw=120,bh=36,x=pos[1]==='r'?W-bw-24:pos[1]==='l'?24:(W-bw)/2,y=pos[0]==='b'?H-bh-14:14,o={x:x*IN,y:y*IN,w:bw*IN,h:bh*IN,fontSize:Math.round((+t.numSize||16)*.75),bold:!!t.numBold,color:toHex(slnumColors(t,s).color).replace('#',''),align:pos[1]==='r'?'right':pos[1]==='l'?'left':'center',valign:'middle'};if(t.numFont)o.fontFace=t.numFont;sl.addText(t.numFormat==='nN'?(i+1)+' / '+deck.slides.length:String(i+1),o)}
    const cites=slideCites(s);if(t.refFooter&&cites.length)sl.addText(cites.map(k=>{const r=refByKey(k);return '['+citeNum(k)+'] '+(r?refShort(r):k)}).join('\n'),{x:30*IN,y:(H-30-cites.length*18)*IN,w:(W-200)*IN,h:(cites.length*18+10)*IN,fontSize:9,color:hexOf('muted'),valign:'bottom'});
    if(s.notes)sl.addNotes(s.notes);
  }
  await pptx.writeFile({fileName:slug(deck.title)+'.pptx'});toast('PowerPoint gerado. Equações e diagramas foram como imagens; textos simples continuam editáveis.');
}
