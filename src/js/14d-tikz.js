/* ================= TikZ via TikZJax (TeX compiled to WebAssembly, runs in the browser) ================= */
const TIKZ_VER='1.0.0-beta24';
const TIKZ_NATIVE={pgfplots:'Gráficos de funções e dados (pgfplots)','tikz-cd':'Diagramas comutativos','tikz-3dplot':'Desenhos em 3D',amsmath:'amsmath (dentro dos rótulos)',amssymb:'amssymb',array:'array','hf-tikz':'Destaques em fórmulas (hf-tikz)'};
const TIKZ_EXTRA={'tikz-feynman':'Diagramas de Feynman (tikz-feynman)'};
function tikzBase(){if(window.__TIKZ_BASE)return window.__TIKZ_BASE;return standalone?'https://cdn.jsdelivr.net/npm/@drgrice1/tikzjax@'+TIKZ_VER+'/dist/':new URL('tikzjax/',location.href).href}
let tikzLoaded=null;
function loadTikz(){
  if(!tikzLoaded)tikzLoaded=new Promise((ok,no)=>{const s=document.createElement('script');s.src=tikzBase()+'tikzjax.js';
    s.onload=()=>ok();s.onerror=()=>{tikzLoaded=null;no(new Error(standalone?'não consegui baixar o TikZJax (verifique a internet)':'o TikZJax não pode ser carregado aqui no Claude; use a versão local ou hospedada'))};document.head.appendChild(s)});
  return tikzLoaded;
}
let tikzChain=Promise.resolve();
function texError(logs){
  const L=logs.join('\n').split('\n');const i=L.findIndex(l=>/^!/.test(l.trim()));if(i<0)return '';
  const msg=L[i].trim().replace(/^!\s*/,''),ln=L.slice(i,i+8).find(l=>/^l\.\d+/.test(l.trim()));
  return msg+(ln?' (linha '+ln.trim().match(/^l\.(\d+)/)[1]+': '+ln.trim().replace(/^l\.\d+\s*/,'').slice(0,60)+')':'');
}
function compileTikz(code,o){
  const run=()=>loadTikz().then(()=>new Promise((ok,no)=>{
    const host=$('#tikzHost'),logs=[],ol=console.log,oi=console.info;
    console.log=function(){logs.push(Array.from(arguments).join(' '))};console.info=console.log;
    const s=document.createElement('script');s.type='text/tikz';s.dataset.showConsole='true';
    if(o.libs)s.dataset.tikzLibraries=o.libs;if(o.pkgs&&Object.keys(o.pkgs).length)s.dataset.texPackages=JSON.stringify(o.pkgs);if(o.pre)s.dataset.addToPreamble=o.pre;
    s.textContent=code;
    let done=false;const fin=(err,svg)=>{if(done)return;done=true;clearTimeout(to);mo.disconnect();console.log=ol;console.info=oi;const out=svg&&svg.outerHTML;host.innerHTML='';if(err)no(err);else ok(out)};
    const to=setTimeout(()=>fin(new Error('o TeX demorou demais (mais de 2 minutos)')),120000);
    const mo=new MutationObserver(()=>{const kids=Array.from(host.children);
      if(kids.some(k=>k.tagName==='IMG'))fin(new Error(texError(logs)||'erro de compilação no TeX'));
      else{const svg=kids.find(k=>k.tagName.toLowerCase()==='svg'&&!k.querySelector('animate'));if(svg)fin(null,svg)}});
    mo.observe(host,{childList:true,subtree:true});
    host.appendChild(s);
  }));
  const p=tikzChain.then(run,run);tikzChain=p.catch(()=>{});return p;
}
function tikzPost(str){
  const t=document.createElement('div');t.innerHTML=str;const svg=t.querySelector('svg');if(!svg)throw new Error('o TikZ não devolveu uma imagem');
  const vb=(svg.getAttribute('viewBox')||'0 0 100 100').split(/[\s,]+/).map(Number);svg.removeAttribute('width');svg.removeAttribute('height');svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  const pre='tk'+uid();svg.querySelectorAll('[id]').forEach(n=>{n.id=pre+n.id});
  let html=svg.outerHTML.replace(/url\(#/g,'url(#'+pre).replace(/(xlink:)?href="#/g,(m)=>m.replace('#','#'+pre));
  html=html.replace(/(stroke|fill)="(#000|#000000|black)"/g,'$1="currentColor"').replace(/(stroke|fill):\s*(#000|#000000|black)\b/g,'$1:currentColor');
  const fonts=Array.from(new Set((html.match(/font-family="([\w-]+)"/g)||[]).map(m=>m.slice(13,-1))));
  return{svg:html,vw:vb[2]||100,vh:vb[3]||100,fonts:fonts};
}
async function ensureTikzFonts(names){
  const miss=names.filter(n=>!deck.texFonts[n]);
  await Promise.all(miss.map(async n=>{try{const r=await fetch(tikzBase()+'fonts/'+n+'.woff2');if(!r.ok)return;const b=await r.blob();
    deck.texFonts[n]=await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.readAsDataURL(b)})}catch(e){}}));
  updateTikzFonts();
}
function tikzFontCss(){return Object.keys(deck.texFonts||{}).map(n=>'@font-face{font-family:'+n+';src:url('+deck.texFonts[n]+') format("woff2")}').join('')}
function updateTikzFonts(){$('#tikzFonts').textContent=tikzFontCss()}
function tikzOpts(e){
  const pk={},pre=[],libs=new Set(String(e.libs||'').split(',').map(x=>x.trim()).filter(Boolean));
  const names=new Set(e.pkgs||[]);deck.texPkgs.forEach(p=>{if(p.tikzAll)names.add(p.id)});
  names.forEach(n=>{
    if(TIKZ_NATIVE[n])pk[n]='';
    else if(n==='tikz-feynman'){pre.push(FEYN_CODE);FEYN_LIBS.split(',').forEach(l=>libs.add(l))}
    else{const c=deck.texPkgs.find(p=>p.id===n);if(c){pre.push('\\makeatletter\n'+c.code+'\n\\makeatother');String(c.libs||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(l=>libs.add(l))}}
  });
  if(pk['tikz-cd'])libs.add('cd');
  return{pkgs:pk,pre:pre.join('\n'),libs:Array.from(libs).join(',')};
}
const tikzBusy=new Set();
function markCompiling(e,on){$$('[data-id="'+e.id+'"]').forEach(d=>d.classList.toggle('compiling',on))}
async function compileTikzEl(e,quiet){
  if(!e||e.type!=='tikz')return;if(tikzBusy.has(e.id))return;tikzBusy.add(e.id);markCompiling(e,true);
  setTikzStatus(e,'Compilando… (a primeira vez baixa o TeX, cerca de 6 MB)');
  try{
    const raw=await compileTikz(e.code||'',tikzOpts(e));const r=tikzPost(raw);await ensureTikzFonts(r.fonts);
    const first=!e.svg;e.svg=r.svg;e.vw=r.vw;e.vh=r.vh;e.err='';
    if(first){const k=1.333*2;let w=r.vw*k,h=r.vh*k;const f=Math.min(1,W*.8/w,H*.7/h);w*=f;h*=f;const cx=e.x+e.w/2,cy=e.y+e.h/2;e.w=Math.round(w);e.h=Math.round(h);e.x=Math.round(cx-w/2);e.y=Math.round(cy-h/2)}
    else{e.h=Math.round(e.w*r.vh/r.vw)}
    setTikzStatus(e,'Compilado.');
  }catch(err){e.err=String(err.message||err);setTikzStatus(e,'Erro: '+e.err,true);if(!quiet)toast('TikZ: '+e.err)}
  finally{tikzBusy.delete(e.id);markCompiling(e,false)}
  const s=findSlideOf(e.id);if(s===slide()){const d=elDom(e);if(d){fillEl(d,e,true);styleEl(d,e)}overlaySoon();syncFormat()}
  rebuildThumbsSoon();commit();
}
function setTikzStatus(e,msg,err){const st=$('#tkStatus');if(st&&selIds[0]===e.id){st.textContent=msg;st.className='hint'+(err?' err':'')}}
const TIKZ_TPL={
  basic:{name:'Desenho simples (eixos e curva)',libs:'arrows.meta',pkgs:[],code:'\\begin{tikzpicture}[>=Stealth, scale=1.2]\n  \\draw[->] (-0.5,0) -- (4.5,0) node[right] {$x$};\n  \\draw[->] (0,-0.5) -- (0,3.2) node[above] {$V(x)$};\n  \\draw[thick, domain=0.35:4.2, smooth, samples=60] plot (\\x, {1/\\x + 0.25*\\x - 0.6});\n  \\draw[dashed] (2,0) -- (2,0.4);\n  \\fill (2,0.4) circle (1.5pt) node[above] {$x_0$};\n\\end{tikzpicture}'},
  feynman:{name:'Diagrama de Feynman: e⁺e⁻ → μ⁺μ⁻',libs:'',pkgs:['tikz-feynman'],code:'\\begin{tikzpicture}\n\\begin{feynman}\n  \\vertex (a) at (0,0) {\\(e^-\\)};\n  \\vertex (c) at (0,-2) {\\(e^+\\)};\n  \\vertex (b) at (2,-1);\n  \\vertex (d) at (4,-1);\n  \\vertex (f1) at (6,0) {\\(\\mu^-\\)};\n  \\vertex (f2) at (6,-2) {\\(\\mu^+\\)};\n  \\diagram* {\n    (a) -- [fermion] (b) -- [fermion] (c),\n    (b) -- [photon, edge label=\\(\\gamma\\)] (d),\n    (f2) -- [fermion] (d) -- [fermion] (f1),\n  };\n\\end{feynman}\n\\end{tikzpicture}'},
  feynmanW:{name:'Diagrama de Feynman: νμ n → μ⁻ p (troca de W)',libs:'',pkgs:['tikz-feynman'],code:'\\begin{tikzpicture}\n\\begin{feynman}\n  \\vertex (a) at (0,0) {\\(\\nu_\\mu\\)};\n  \\vertex (b) at (2.5,-1.2);\n  \\vertex (c) at (5,0) {\\(\\mu^-\\)};\n  \\vertex (d) at (2.5,-3);\n  \\vertex (e) at (0,-4.2) {\\(n\\)};\n  \\vertex (f) at (5,-4.2) {\\(p\\)};\n  \\diagram* {\n    (a) -- [fermion] (b) -- [fermion] (c),\n    (b) -- [boson, edge label=\\(W^{+}\\)] (d),\n    (e) -- [fermion] (d) -- [fermion] (f),\n  };\n\\end{feynman}\n\\end{tikzpicture}'},
  loop:{name:'Diagrama de Feynman: laço de fótons',libs:'',pkgs:['tikz-feynman'],code:'\\begin{tikzpicture}\n\\begin{feynman}\n  \\vertex (a) at (0,0);\n  \\vertex (b) at (1.5,0);\n  \\vertex (c) at (3.5,0);\n  \\vertex (d) at (5,0);\n  \\diagram* {\n    (a) -- [photon, momentum=\\(k\\)] (b),\n    (b) -- [fermion, half left, edge label=\\(p\\)] (c),\n    (c) -- [fermion, half left, edge label=\\(p-k\\)] (b),\n    (c) -- [photon] (d),\n  };\n\\end{feynman}\n\\end{tikzpicture}'},
  pgfplots:{name:'Gráfico com pgfplots',libs:'',pkgs:['pgfplots'],code:'\\begin{tikzpicture}\n\\begin{axis}[width=10cm, height=6cm, xlabel={$L/E$ (km/GeV)}, ylabel={$P_{\\nu_\\mu\\to\\nu_\\tau}$}, grid=major, ymin=0, ymax=1.05]\n  \\addplot[domain=0:2000, samples=300, thick, blue] {sin(deg(1.27*2.5e-3*x))^2};\n\\end{axis}\n\\end{tikzpicture}'},
  tikzcd:{name:'Diagrama comutativo (tikz-cd)',libs:'',pkgs:['tikz-cd'],code:'\\begin{tikzcd}[column sep=large, row sep=large]\n  A \\arrow[r, "f"] \\arrow[d, "h"\'] & B \\arrow[d, "g"] \\\\\n  C \\arrow[r, "k"\'] & D\n\\end{tikzcd}'},
  cone:{name:'Cone de luz',libs:'arrows.meta',pkgs:[],code:'\\begin{tikzpicture}[>=Stealth, scale=1.3]\n  \\draw[->] (-2.2,0) -- (2.2,0) node[right] {$x$};\n  \\draw[->] (0,-2.2) -- (0,2.2) node[above] {$ct$};\n  \\fill[blue!15] (0,0) -- (1.9,1.9) -- (-1.9,1.9) -- cycle;\n  \\fill[red!15] (0,0) -- (1.9,-1.9) -- (-1.9,-1.9) -- cycle;\n  \\draw[thick] (-2,-2) -- (2,2) (-2,2) -- (2,-2);\n  \\node at (0,1.3) {futuro};\n  \\node at (0,-1.3) {passado};\n  \\node at (1.5,0.35) {tipo espaço};\n\\end{tikzpicture}'}
};
function insertTikz(k){
  const t=TIKZ_TPL[k]||TIKZ_TPL.basic,e=tikzEl({code:t.code,libs:t.libs,pkgs:t.pkgs.slice(),x:Math.round(W/2-200),y:Math.round(H/2-140),w:400,h:280});
  addEls([e]);openSide('format',true);compileTikzEl(e);
}
const tikzItems=()=>Object.keys(TIKZ_TPL).map(k=>({label:TIKZ_TPL[k].name,act:()=>insertTikz(k)})).concat([{sep:1},{label:'Em branco',act:()=>{const e=tikzEl({code:'\\begin{tikzpicture}\n  \n\\end{tikzpicture}',x:Math.round(W/2-200),y:Math.round(H/2-140),w:400,h:280});addEls([e]);openSide('format',true);setTimeout(()=>{const c=$('#tkCode');if(c)c.focus()},50)}},{label:'Pacotes LaTeX…',act:tikzPkgModal}]);
function tikzPanel(e){
  const pk=e.pkgs||[],chk=(n,l)=>'<label class="chk"><input type="checkbox" data-tkpkg="'+esc(n)+'"'+(pk.includes(n)?' checked':'')+'> <code>'+esc(n.length>18?n.slice(0,18)+'…':n)+'</code> <span class="hint">'+esc(l)+'</span></label>';
  return '<div class="sec"><div class="ih">Código TikZ</div><textarea id="tkCode" class="mono" rows="13" spellcheck="false" data-tk="code" aria-label="Código TikZ">'+esc(e.code||'')+'</textarea>'+
    '<div class="btns"><button type="button" class="btn primary" data-act="tkRun">Compilar ('+MOD+'Enter)</button><button type="button" class="btn" data-act="tkTpl">Modelos…</button></div>'+
    '<p class="hint" id="tkStatus">'+(tikzBusy.has(e.id)?'Compilando…':e.err?'Erro: '+esc(e.err):e.svg?'Compilado.':'Ainda não compilado.')+'</p>'+
    '<label class="lab">Bibliotecas TikZ (\\usetikzlibrary)<input data-tk="libs" value="'+esc(e.libs||'')+'" placeholder="arrows.meta, calc, decorations.pathmorphing"></label>'+
    '<label class="chk"><input type="checkbox" data-tk="themeInk"'+(e.themeInk?' checked':'')+'> Desenhar o preto com a cor do texto do tema</label></div>'+
    '<div class="sec"><div class="ih">Pacotes</div>'+Object.keys(TIKZ_NATIVE).map(n=>chk(n,TIKZ_NATIVE[n])).join('')+Object.keys(TIKZ_EXTRA).map(n=>chk(n,TIKZ_EXTRA[n])).join('')+
    deck.texPkgs.map(p=>chk(p.id,p.name+' (seu)')).join('')+
    '<div class="btns"><button type="button" class="btn small" data-act="tkPkgs">Adicionar pacote próprio…</button></div>'+
    '<p class="hint">O TeX roda dentro do navegador (TikZJax). A primeira compilação baixa cerca de 6 MB e leva alguns segundos; depois fica em cache.</p></div>';
}
const tikzPkgModal=()=>pkgModal();
