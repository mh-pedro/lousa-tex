/* ================= popovers and menus ================= */
function openPopNode(node,anchor){
  pop.innerHTML='';pop.appendChild(node);pop.hidden=false;pop.classList.remove('flip');
  let x,y;const ar=anchor&&anchor.getBoundingClientRect?anchor.getBoundingClientRect():null;
  if(ar){x=ar.left;y=ar.bottom+4}else{x=anchor.x;y=anchor.y}
  const w=pop.offsetWidth,h=pop.offsetHeight;
  x=clamp(x,8,Math.max(8,innerWidth-w-8));if(y+h>innerHeight-8)y=Math.max(8,ar?ar.top-h-4:innerHeight-h-8);
  pop.style.left=x+'px';pop.style.top=y+'px';if(x+w+260>innerWidth)pop.classList.add('flip');
  pop._anchor=anchor;
}
function closePop(){if(pop.hidden)return;pop.hidden=true;pop.innerHTML='';pop._anchor=null;if(activeMenu){activeMenu.classList.remove('on');activeMenu=null}}
document.addEventListener('pointerdown',ev=>{if(pop.hidden)return;if(pop.contains(ev.target))return;const a=pop._anchor;if(a&&a.contains&&a.contains(ev.target))return;closePop()},true);
pop.addEventListener('mousedown',ev=>{if(!ev.target.closest('input,select,textarea'))ev.preventDefault()});
let menuHoverT=null;
function buildMenu(items){
  const m=document.createElement('div');m.className='menu';m.setAttribute('role','menu');
  const icons=items.map(it=>it&&!it.sep?menuIcon(it):'');if(icons.some(Boolean))m.classList.add('icons');
  items.forEach((it,ix)=>{
    if(!it)return;if(it.sep){if(m.lastChild&&!m.lastChild.classList.contains('msep'))m.insertAdjacentHTML('beforeend','<div class="msep"></div>');return}
    const d=document.createElement('div');d.className='mi'+(it.disabled?' dis':'');d.setAttribute('role','menuitem');
    d.innerHTML='<span class="ck">'+(it.checked?'✓':'')+'</span><span class="mic">'+icons[ix]+'</span><span class="ml"></span>'+(it.sc?'<span class="sc">'+esc(it.sc)+'</span>':'')+(it.sub?'<span class="chev">›</span>':'');
    d.querySelector('.ml').textContent=it.label;if(it.font)d.querySelector('.ml').style.fontFamily=fontStack(it.font);if(it.hint)d.title=it.hint;
    if(it.sub){m.classList.add('has-sub');d.appendChild(buildMenu(typeof it.sub==='function'?it.sub():it.sub));d.addEventListener('click',ev=>{if(ev.target.closest('.mi')!==d)return;ev.stopPropagation();d.classList.add('open')})}
    else d.addEventListener('click',ev=>{ev.stopPropagation();closePop();if(it.act)it.act()});
    d.addEventListener('mouseenter',()=>{clearTimeout(menuHoverT);menuHoverT=setTimeout(()=>{Array.from(m.children).forEach(x=>{if(x!==d)x.classList.remove('open')});if(it.sub)d.classList.add('open')},it.sub?60:220)});
    m.appendChild(d);
  });
  if(m.lastChild&&m.lastChild.classList.contains('msep'))m.lastChild.remove();
  return m;
}
function openMenu(items,anchor){openPopNode(buildMenu(items),anchor)}
$$('#menubar [data-menu]').forEach(b=>{
  b.addEventListener('click',()=>{if(activeMenu===b){closePop();return}openMenuBar(b)});
  b.addEventListener('mouseenter',()=>{if(activeMenu&&activeMenu!==b)openMenuBar(b)});
});
function openMenuBar(b){closePop();openMenu(MENUS[b.dataset.menu](),b);activeMenu=b;b.classList.add('on')}

/* ---------- pickers ---------- */
const PALETTE=['#000000','#3c4043','#5f6368','#9aa0a6','#dadce0','#f1f3f4','#ffffff','#b4532a','#c5221f','#e8710a','#f9ab00','#188038','#12858b','#1967d2','#7627bb','#a142f4',
  '#7f1d1d','#9a3412','#854d0e','#365314','#065f46','#0e7490','#1e3a8a','#581c87'];
const TOKNAME={fg:'Texto do tema',title:'Títulos do tema',accent:'Destaque do tema',muted:'Texto secundário',bg:'Fundo do tema'};
function colorPop(anchor,current,onPick,opts){
  opts=opts||{};const n=document.createElement('div');n.className='ppanel';
  const sw=(v,css,t)=>'<button type="button" class="swc" data-c="'+v+'" title="'+esc(t)+'" style="background:'+css+'"></button>';
  n.innerHTML=(opts.none?'<button type="button" class="btn small cnone" data-c="">'+esc(opts.none)+'</button>':'')+
    '<div class="clab">Cores do tema</div><div class="swatches">'+['fg','title','accent','muted','bg'].map(t=>sw(t,resolveColor(t),TOKNAME[t])).join('')+'</div>'+
    '<div class="clab">Paleta</div><div class="swatches">'+PALETTE.map(c=>sw(c,c,c)).join('')+'</div>'+
    '<label class="ccustom">Personalizada<input type="color" value="'+(current&&current!=='none'?toHex(resolveColor(current)):'#2a6dd4')+'"></label>';
  n.addEventListener('click',ev=>{const b=ev.target.closest('[data-c]');if(!b)return;closePop();onPick(b.dataset.c||null)});
  n.querySelector('input').addEventListener('change',ev=>onPick(ev.target.value));
  openPopNode(n,anchor);
}
function shapeIcon(k){return '<svg viewBox="-2 -2 32 26"><path d="'+shapeD(k,28,20,0)+'" fill="none" stroke="currentColor" stroke-width="1.5"'+(EVENODD.has(k)?' fill-rule="evenodd"':'')+'/></svg>'}
function shapesPop(anchor){const n=document.createElement('div');n.className='ppanel';
  n.innerHTML=SHAPE_CATS.map(c=>'<div class="clab">'+c[0]+'</div><div class="shgrid">'+c[1].map(k=>'<button type="button" class="shbtn" data-k="'+k+'" title="'+SHAPES[k]+'">'+shapeIcon(k)+'</button>').join('')+'</div>').join('')+
    '<p class="hint" style="margin-top:10px">Clique e arraste no slide para desenhar. Shift mantém a proporção.</p>';
  n.addEventListener('click',ev=>{const b=ev.target.closest('[data-k]');if(!b)return;closePop();setTool({kind:'shape',shape:b.dataset.k})});openPopNode(n,anchor)}
function layoutIcon(k){return '<svg viewBox="0 0 128 72">'+LAYOUTS[k].els().map(e=>'<rect x="'+e.x/10+'" y="'+e.y/10+'" width="'+e.w/10+'" height="'+Math.max(3,e.h/10)+'" rx="1" style="fill:'+(e.role==='title'?'var(--muted)':'var(--line)')+'"/>').join('')+'</svg>'}
function layoutPop(anchor,onPick){const n=document.createElement('div');n.className='ppanel';
  n.innerHTML='<div class="lygrid">'+Object.keys(LAYOUTS).map(k=>'<button type="button" class="lybtn" data-k="'+k+'">'+layoutIcon(k)+LAYOUTS[k].name+'</button>').join('')+'</div>';
  n.addEventListener('click',ev=>{const b=ev.target.closest('[data-k]');if(!b)return;closePop();onPick(b.dataset.k)});openPopNode(n,anchor)}
function tablePop(anchor){const n=document.createElement('div');n.className='ppanel';
  let cells='';for(let r=0;r<8;r++)for(let c=0;c<8;c++)cells+='<span data-r="'+r+'" data-c="'+c+'"></span>';
  n.innerHTML='<div class="clab" id="tgLab">Tabela 1 × 1</div><div class="tgrid">'+cells+'</div><button type="button" class="btn small" data-custom="1">Outro tamanho…</button>';
  const lab=n.querySelector('#tgLab');
  n.addEventListener('mouseover',ev=>{const s=ev.target.closest('span[data-r]');if(!s)return;const R=+s.dataset.r,C=+s.dataset.c;lab.textContent='Tabela '+(R+1)+' linha'+(R?'s':'')+' × '+(C+1)+' coluna'+(C?'s':'');
    n.querySelectorAll('span[data-r]').forEach(x=>x.classList.toggle('on',+x.dataset.r<=R&&+x.dataset.c<=C))});
  n.addEventListener('click',ev=>{if(ev.target.closest('[data-custom]')){closePop();tableModal();return}const s=ev.target.closest('span[data-r]');if(!s)return;closePop();insertTable(+s.dataset.r+1,+s.dataset.c+1)});
  openPopNode(n,anchor)}
const CHARS=[['Setas','← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇔ ↦ ⟶ ⟹ ↗ ↘ ↻ ↺'],['Matemática','± ∓ × ÷ ≠ ≈ ≃ ≡ ≤ ≥ ≪ ≫ ∝ ∞ ∑ ∏ ∫ ∮ √ ∂ ∇ ∈ ∉ ⊂ ⊆ ∪ ∩ ∀ ∃ ∅ ℏ ℝ ℂ ℕ ℤ ° ′ ″ ‰ ·'],
  ['Grego','α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω'],['Sobrescritos e subscritos','⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁺ ⁻ ⁿ ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉ ₊ ₋'],
  ['Pontuação e símbolos','– … « » “ ” ‘ ’ • § ¶ † ‡ © ® ™ € £ ¥ ¢ ✓ ✗ ★ ☆ ● ○ ■ □ ▶ ◆ ♠ ♣ ♥ ♦ ☐ ☑']];
function charsPop(anchor){const n=document.createElement('div');n.className='ppanel';
  n.innerHTML=CHARS.map(c=>'<div class="clab">'+c[0]+'</div><div class="chgrid">'+c[1].split(' ').map(ch=>'<button type="button" class="chb" data-ch="'+esc(ch)+'">'+esc(ch)+'</button>').join('')+'</div>').join('');
  n.addEventListener('click',ev=>{const b=ev.target.closest('[data-ch]');if(!b)return;insertChars(b.dataset.ch);if(!editId)closePop()});openPopNode(n,anchor)}
const DIAGRAMS=[['process','Processo'],['cycle','Ciclo'],['hierarchy','Hierarquia'],['venn','Relação (Venn)'],['timeline','Linha do tempo']];
function diagramIcon(k){const s='stroke="currentColor" stroke-width="1.5" fill="none"';
  return {process:'<rect x="2" y="18" width="22" height="14" rx="3" '+s+'/><rect x="34" y="18" width="22" height="14" rx="3" '+s+'/><rect x="66" y="18" width="22" height="14" rx="3" '+s+'/><path d="M24 25h10M56 25h10" '+s+'/>',
    cycle:'<circle cx="45" cy="25" r="17" '+s+' stroke-dasharray="4 4"/><rect x="35" y="2" width="20" height="10" rx="3" '+s+'/><rect x="58" y="30" width="20" height="10" rx="3" '+s+'/><rect x="12" y="30" width="20" height="10" rx="3" '+s+'/>',
    hierarchy:'<rect x="33" y="2" width="24" height="12" rx="3" '+s+'/><rect x="4" y="34" width="22" height="12" rx="3" '+s+'/><rect x="34" y="34" width="22" height="12" rx="3" '+s+'/><rect x="64" y="34" width="22" height="12" rx="3" '+s+'/><path d="M45 14v10M15 24h60M15 24v10M45 24v10M75 24v10" '+s+'/>',
    venn:'<circle cx="35" cy="25" r="17" '+s+'/><circle cx="55" cy="25" r="17" '+s+'/>',
    timeline:'<path d="M4 25h80" '+s+'/><circle cx="18" cy="25" r="3" fill="currentColor"/><circle cx="45" cy="25" r="3" fill="currentColor"/><circle cx="72" cy="25" r="3" fill="currentColor"/>'}[k]}
function diagramPop(anchor){const n=document.createElement('div');n.className='ppanel';
  n.innerHTML='<div class="clab">Diagramas</div><div class="dgrid">'+DIAGRAMS.map(d=>'<button type="button" data-k="'+d[0]+'"><svg viewBox="0 0 90 50">'+diagramIcon(d[0])+'</svg>'+d[1]+'</button>').join('')+'</div>'+
    '<label class="lab" style="margin-top:10px">Número de itens<select id="dgN"><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option></select></label>';
  n.addEventListener('click',ev=>{const b=ev.target.closest('[data-k]');if(!b)return;const k=+$('#dgN').value;closePop();insertDiagram(b.dataset.k,k)});openPopNode(n,anchor)}
const EQ_GROUPS=[
  ['Estruturas',['\\frac{a}{b}','\\sqrt{x}','\\sqrt[n]{x}','x^{2}','x_{i}','x_{i}^{2}','\\vec{v}','\\hat{n}','\\dot{x}','\\ddot{x}','\\bar{x}','\\tilde{x}','\\left( x \\right)','\\left[ x \\right]','\\lvert x \\rvert','\\langle x \\rangle']],
  ['Cálculo',['\\int_{a}^{b} f(x)\\,\\mathrm{d}x','\\oint','\\iint','\\sum_{i=1}^{N}','\\prod_{i=1}^{N}','\\lim_{x \\to 0}','\\frac{\\mathrm{d}f}{\\mathrm{d}x}','\\frac{\\partial f}{\\partial x}','\\nabla','\\partial_\\mu','\\infty','\\mathrm{d}^4x']],
  ['Física',['\\hbar','\\ket{\\psi}','\\bra{\\phi}','\\braket{\\phi|\\psi}','\\dagger','\\otimes','\\gamma^\\mu','\\mathcal{L}','\\mathrm{GeV}','\\propto','\\simeq','\\approx','\\sim','\\lesssim','\\gtrsim','\\overset{!}{=}']],
  ['Matrizes e ambientes',['\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}','\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}','\\begin{cases} a & x>0 \\\\ b & x<0 \\end{cases}','\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}']],
  ['Letras gregas','alpha beta gamma delta epsilon varepsilon zeta eta theta vartheta kappa lambda mu nu xi pi rho sigma tau phi varphi chi psi omega Gamma Delta Theta Lambda Xi Pi Sigma Phi Psi Omega'.split(' ').map(g=>'\\'+g)],
  ['Operadores e setas',['\\pm','\\mp','\\times','\\cdot','\\div','\\neq','\\leq','\\geq','\\ll','\\gg','\\equiv','\\to','\\Rightarrow','\\Leftrightarrow','\\mapsto','\\in','\\subset','\\cup','\\cap','\\forall','\\exists']]
];
let eqNode=null;
function eqPop(anchor){
  if(!eqNode){
    eqNode=document.createElement('div');eqNode.className='ppanel eqpanel';
    const top=document.createElement('div');top.className='eqtop tex2jax_ignore';
    top.innerHTML='<button type="button" class="btn small" data-mode="inline">Equação em linha $…$</button><button type="button" class="btn small" data-mode="display">Destacada $$…$$</button>';
    eqNode.appendChild(top);
    const mine=prefs.snippets||[];const ml=document.createElement('div');ml.className='clab';ml.textContent='Meus atalhos';eqNode.appendChild(ml);
    if(mine.length){const grid=document.createElement('div');grid.className='eqgrid';
      mine.forEach((tex,i)=>{const b=document.createElement('button');b.type='button';b.className='eqb'+(tex.length>14?' wide':'');b.dataset.tex=tex;b.dataset.sn=i;b.title=tex+'  (clique direito para remover)';b.textContent='$'+tex+'$';grid.appendChild(b)});eqNode.appendChild(grid)}
    const add=document.createElement('div');add.className='row tex2jax_ignore';add.style.cssText='margin-top:6px;gap:6px;align-items:center;flex-wrap:nowrap';
    add.innerHTML='<input id="snIn" class="mono" placeholder="Seu LaTeX, ex.: \\pdv{\\mathcal{L}}{\\phi}" aria-label="Novo atalho LaTeX"><button type="button" class="btn small" data-snadd="1">Salvar</button>';eqNode.appendChild(add);
    eqNode.addEventListener('contextmenu',ev=>{const b=ev.target.closest('[data-sn]');if(!b)return;ev.preventDefault();const l=(prefs.snippets||[]).slice();l.splice(+b.dataset.sn,1);prefs.snippets=l;savePrefs();eqNode=null;eqPop(pop._anchor||toolbar);toast('Atalho removido.')});
    const saveSn=()=>{const v=eqNode.querySelector('#snIn').value.trim().replace(/^\$+|\$+$/g,'');if(!v)return;prefs.snippets=(prefs.snippets||[]).concat([v]).slice(-60);savePrefs();const a=pop._anchor;eqNode=null;eqPop(a||toolbar);toast('Atalho salvo. Ele fica disponível em todas as apresentações deste navegador.')};
    add.querySelector('input').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();saveSn()}});
    add.querySelector('[data-snadd]').addEventListener('click',ev=>{ev.stopPropagation();saveSn()});
    EQ_GROUPS.forEach(g=>{const l=document.createElement('div');l.className='clab';l.textContent=g[0];eqNode.appendChild(l);
      const grid=document.createElement('div');grid.className='eqgrid';
      g[1].forEach(tex=>{const b=document.createElement('button');b.type='button';b.className='eqb'+(tex.length>40?' wide':'');b.dataset.tex=tex;b.title=tex;b.textContent='$'+tex+'$';grid.appendChild(b)});
      eqNode.appendChild(grid)});
    const h=document.createElement('p');h.className='hint';h.style.marginTop='8px';h.textContent='Com uma caixa em edição, o símbolo entra no cursor (dentro de $…$ se necessário). Sem edição, cria uma caixa de equação nova.';eqNode.appendChild(h);
    eqNode.addEventListener('click',ev=>{const m=ev.target.closest('[data-mode]');if(m){closePop();if(m.dataset.mode==='inline')inlineMath();else displayMath();return}
      const b=ev.target.closest('[data-tex]');if(!b)return;insertTeX(b.dataset.tex);if(!editId)closePop()});
    openPopNode(eqNode,anchor);typeset([eqNode]).then(()=>{if(!pop.hidden&&pop.contains(eqNode))openPopNode(eqNode,anchor)});return;
  }
  openPopNode(eqNode,anchor);
}

/* ================= modals ================= */
const modal=$('#modal');
function openModal(title,html,opts){opts=opts||{};$('#mTitle').textContent=title;$('#mBody').innerHTML=html;$('#mbox').classList.toggle('wide',!!opts.wide);modal.hidden=false;
  if(opts.mount)opts.mount($('#mBody'));const f=$('#mBody').querySelector('[autofocus],input,textarea,button');if(f)setTimeout(()=>f.focus(),20)}
function closeModal(){modal.hidden=true;$('#mBody').innerHTML=''}
$('#mClose').onclick=closeModal;modal.addEventListener('click',ev=>{if(ev.target===modal)closeModal()});
function confirmBox(title,text,yes,fn){openModal(title,'<p class="hint">'+esc(text)+'</p><div class="btns"><button type="button" class="btn" data-x="no">Cancelar</button><button type="button" class="btn danger" data-x="yes">'+esc(yes)+'</button></div>',
  {mount:b=>{b.querySelector('[data-x="no"]').onclick=closeModal;b.querySelector('[data-x="yes"]').onclick=()=>{closeModal();fn()}}})}
function copyText(ta){const fb=()=>{ta.focus();ta.select();toast('Texto selecionado. Copie com '+MOD+'C.')};try{navigator.clipboard.writeText(ta.value).then(()=>toast('Copiado.'),fb)}catch(e){fb()}}
function showTextModal(name,text){
  openModal('Exportar '+name,'<p class="hint">Aqui no Claude o navegador não permite baixar arquivos. Copie o conteúdo e salve como <code>'+esc(name)+'</code>. Na versão local o download é direto.</p><textarea class="mono" rows="14" id="exTxt" spellcheck="false" aria-label="Conteúdo exportado"></textarea><div class="btns"><button type="button" class="btn primary" id="exCopy">Copiar</button></div>',
    {wide:true,mount:b=>{b.querySelector('#exTxt').value=text;b.querySelector('#exCopy').onclick=()=>copyText(b.querySelector('#exTxt'))}});
}
function libraryModal(){
  commitSoon.flush();saveSoon.flush();
  const list=libList();
  openModal('Minhas apresentações','<div class="btns"><button type="button" class="btn primary" data-a="new">Nova apresentação</button><button type="button" class="btn" data-a="file">Abrir arquivo do computador…</button><button type="button" class="btn" data-a="paste">Colar conteúdo…</button></div>'+
    '<p class="hint">Ficam salvas neste navegador. Para levar a outro computador, use Arquivo › Baixar ou Copiar conteúdo.</p><div class="list">'+
    (list.length?list.map(x=>'<div class="li'+(x.id===deck.id?' on':'')+'" data-id="'+x.id+'"><div class="t"><b>'+esc(x.title||'Sem título')+'</b><small>'+(x.slides||'?')+' slides · alterada em '+fmtDate(x.updated)+(x.id===deck.id?' · aberta agora':'')+'</small></div>'+
      (x.id!==deck.id?'<button type="button" class="btn small" data-a="open">Abrir</button>':'')+'<button type="button" class="btn small" data-a="copy">Fazer cópia</button>'+(x.id!==deck.id?'<button type="button" class="btn small" data-a="del">Excluir</button>':'')+'</div>').join(''):'<p class="hint">Nenhuma apresentação salva ainda.</p>')+'</div>',
    {wide:true,mount:b=>b.addEventListener('click',ev=>{const a=ev.target.closest('[data-a]');if(!a)return;const row=a.closest('.li'),id=row&&row.dataset.id;
      switch(a.dataset.a){
        case 'new':newDeck();break;case 'file':closeModal();openFileSmart();break;case 'paste':pasteContentModal();break;
        case 'open':{const d=loadDeckById(id);if(d)openDeck(d,'Apresentação aberta.');else toast('Não encontrei essa apresentação.');break}
        case 'copy':{const d=id===deck.id?deck:loadDeckById(id);if(d)copyDeck(d);break}
        case 'del':if(a.dataset.sure){deleteDeckFromLib(id);row.remove();toast('Apresentação excluída deste navegador.')}else{a.dataset.sure='1';a.textContent='Confirmar exclusão';a.classList.add('danger')}break;
      }})});
}
function pasteContentModal(){
  if(editId)exitEdit();commitSoon.flush();
  openModal('Copiar ou colar conteúdo','<p class="hint">Este é o conteúdo completo da apresentação. Copie para guardar; para abrir outra, cole o conteúdo dela aqui e clique em Abrir.</p><textarea id="fmText" class="mono" rows="9" spellcheck="false" aria-label="Conteúdo da apresentação"></textarea>'+
    '<div class="btns"><button type="button" class="btn" id="fmCopy">Copiar</button><button type="button" class="btn primary" id="fmLoad">Abrir este conteúdo</button></div>',
    {wide:true,mount:b=>{const ta=b.querySelector('#fmText');ta.value=JSON.stringify(deck);b.querySelector('#fmCopy').onclick=()=>copyText(ta);
      b.querySelector('#fmLoad').onclick=()=>{const d=parseDeckText(ta.value);if(!d){toast('Não reconheci esse conteúdo como uma apresentação do Lousa TeX.');return}if(d.id===deck.id)d.id=uid();openDeck(d,'Apresentação aberta.')}}});
}
function versionsModal(){
  commitSoon.flush();saveSoon.flush();addVersion('',false);
  const l=verList(deck.id);
  openModal('Histórico de versões','<div class="row"><label class="lab">Nomear a versão atual<input id="vnName" placeholder="Ex.: versão enviada ao orientador"></label><button type="button" class="btn primary" id="vnSave" style="flex:none">Salvar versão</button></div>'+
    '<p class="hint">Uma versão é guardada automaticamente a cada '+prefs.autoVersionMin+' minutos de edição. Versões com nome nunca são apagadas automaticamente.</p><div class="list">'+
    (l.length?l.map((v,i)=>{let d=null;try{d=JSON.parse(v.data)}catch(e){}return '<div class="li" data-i="'+i+'"><div class="t"><b>'+(v.name?esc(v.name):fmtDate(v.t))+'</b><small>'+(v.name?fmtDate(v.t)+' · ':'')+(d?d.slides.length+' slides':'')+'</small></div>'+
      '<button type="button" class="btn small" data-a="restore">Restaurar</button><button type="button" class="btn small" data-a="name">Nomear</button><button type="button" class="btn small" data-a="copy">Fazer cópia</button><button type="button" class="btn small" data-a="del">Excluir</button></div>'}).join(''):'<p class="hint">Nenhuma versão guardada ainda.</p>')+'</div>',
    {wide:true,mount:b=>{
      b.querySelector('#vnSave').onclick=()=>{const n=b.querySelector('#vnName').value.trim()||('Versão de '+fmtDate(Date.now()));addVersion(n,true);toast('Versão salva.');versionsModal()};
      b.addEventListener('click',ev=>{const a=ev.target.closest('[data-a]');if(!a)return;const i=+a.closest('.li').dataset.i,vl=verList(deck.id),v=vl[i];if(!v)return;
        if(a.dataset.a==='restore'){addVersion('',true);const d=JSON.parse(v.data);d.id=deck.id;openDeck(d,'Versão restaurada. A anterior ficou no histórico.')}
        else if(a.dataset.a==='copy'){const d=JSON.parse(v.data);copyDeck(d)}
        else if(a.dataset.a==='del'){vl.splice(i,1);verSave(deck.id,vl);versionsModal()}
        else if(a.dataset.a==='name'){const t=a.closest('.li').querySelector('.t');t.innerHTML='<input value="'+esc(v.name||'')+'" placeholder="Nome da versão">';const inp=t.querySelector('input');inp.focus();
          const save=()=>{vl[i].name=inp.value.trim();verSave(deck.id,vl);versionsModal()};inp.addEventListener('keydown',e=>{if(e.key==='Enter')save()});inp.addEventListener('blur',save)}})}});
}
function openImportModal(fromFile){
  const lib=libList().filter(x=>x.id!==deck.id);
  const src=fromFile?importSource:null;
  let body='<div class="row"><label class="lab">Origem<select id="imSrc"><option value="">Escolha uma apresentação…</option>'+lib.map(x=>'<option value="'+x.id+'">'+esc(x.title)+'</option>').join('')+'<option value="__file">Arquivo do computador…</option></select></label></div><div id="imList"></div>';
  openModal('Importar slides',body,{wide:true,mount:b=>{
    const sel=b.querySelector('#imSrc'),box=b.querySelector('#imList');
    const show=d=>{importSource=d;
      box.innerHTML='<p class="hint">'+esc(d.title)+': '+d.slides.length+' slides. Os slides importados adotam o tema desta apresentação.</p><div class="btns"><button type="button" class="btn small" data-a="all">Selecionar todos</button><button type="button" class="btn small" data-a="none">Nenhum</button></div><div class="list">'+
        d.slides.map((s,i)=>'<label class="li"><input type="checkbox" data-i="'+i+'" checked><div class="t"><b>'+(i+1)+'. '+esc(slideTitle(s))+'</b><small>'+s.els.length+' elementos'+(s.notes?' · com anotações':'')+'</small></div></label>').join('')+
        '</div><div class="btns"><button type="button" class="btn primary" data-a="import">Importar slides selecionados</button><button type="button" class="btn" data-a="theme">Importar só o tema e o preâmbulo</button></div>'};
    if(src)show(src);
    sel.onchange=()=>{if(sel.value==='__file'){openFilePicker('import');sel.value='';return}const d=sel.value&&loadDeckById(sel.value);if(d)show(normalize(d));else box.innerHTML=''};
    box.addEventListener('click',ev=>{const a=ev.target.closest('[data-a]');if(!a||!importSource)return;
      if(a.dataset.a==='all'||a.dataset.a==='none')box.querySelectorAll('input[type=checkbox]').forEach(c=>{c.checked=a.dataset.a==='all'});
      else if(a.dataset.a==='import'){const pick=Array.from(box.querySelectorAll('input[type=checkbox]:checked')).map(c=>importSource.slides[+c.dataset.i]);if(!pick.length){toast('Marque pelo menos um slide.');return}
        const sx=W/importSource.size.w,sy=H/importSource.size.h;
        const fresh=pick.map(s=>{const c=cloneSlide(s);if(sx!==1||sy!==1)c.els.forEach(e=>{if(e.type==='line'){e.x1*=sx;e.x2*=sx;e.y1*=sy;e.y2*=sy}else{e.x*=sx;e.y*=sy;e.w*=sx;e.h*=sy}});return c});
        deck.slides.splice(cur+1,0,...fresh);closeModal();rebuildThumbs();goto(cur+1);commit();toast(fresh.length+' slide'+(fresh.length>1?'s importados.':' importado.'))}
      else if(a.dataset.a==='theme'){deck.theme=Object.assign({},importSource.theme);deck.preamble=importSource.preamble;deck.master=JSON.parse(JSON.stringify(importSource.master));closeModal();applyPreamble();rerenderAll();renderSide();commit();toast('Tema importado.')}})}});
}
function tableModal(){openModal('Inserir tabela','<div class="g2"><label class="lab">Linhas<input type="number" id="tbR" min="1" max="40" value="4"></label><label class="lab">Colunas<input type="number" id="tbC" min="1" max="20" value="3"></label></div><div class="btns"><button type="button" class="btn primary" id="tbOk">Inserir</button></div>',
  {mount:b=>{b.querySelector('#tbOk').onclick=()=>{const r=clamp(+b.querySelector('#tbR').value||2,1,40),c=clamp(+b.querySelector('#tbC').value||2,1,20);closeModal();insertTable(r,c)}}})}
function imageUrlModal(){openModal('Inserir imagem por endereço','<label class="lab">Endereço da imagem<input id="iuUrl" placeholder="https://…/figura.png"></label>'+(standalone?'':'<p class="hint">Aqui no Claude, imagens de outros sites são bloqueadas por segurança. Na versão local funcionam normalmente.</p>')+'<div class="btns"><button type="button" class="btn primary" id="iuOk">Inserir</button></div>',
  {mount:b=>{const go=()=>{const u=b.querySelector('#iuUrl').value.trim();if(!u)return;closeModal();addImageURL(u)};b.querySelector('#iuOk').onclick=go;b.querySelector('#iuUrl').addEventListener('keydown',e=>{if(e.key==='Enter')go()})}})}
function mediaModal(){
  openModal('Inserir vídeo ou áudio','<label class="lab">Link do YouTube ou de um arquivo de vídeo/áudio (.mp4, .webm, .mp3, .ogg)<input id="mdUrl" placeholder="https://www.youtube.com/watch?v=…"></label>'+
    '<div class="btns"><button type="button" class="btn primary" id="mdOk">Inserir link</button><button type="button" class="btn" id="mdFile">Escolher arquivo do computador…</button></div>'+
    '<p class="hint">Vídeos do YouTube tocam na versão local; aqui no Claude aparece um link para abri-los. Arquivos de até 4 MB ficam salvos na apresentação.</p>',
    {mount:b=>{b.querySelector('#mdFile').onclick=()=>$('#mediaFile').click();
      const go=()=>{const u=b.querySelector('#mdUrl').value.trim();if(!u)return;const yt=ytId(u),kind=yt?'youtube':/\.(mp3|ogg|wav|m4a|aac|flac)(\?|$)/i.test(u)?'audio':'video';
        closeModal();addEls([mediaEl({kind:kind,url:u,h:kind==='audio'?90:360,y:kind==='audio'?Math.round(H/2-45):150})])};
      b.querySelector('#mdOk').onclick=go;b.querySelector('#mdUrl').addEventListener('keydown',e=>{if(e.key==='Enter')go()})}});
}
function sizeModal(){
  const curKey=Object.keys(SIZES).find(k=>SIZES[k].w===W&&SIZES[k].h===H)||'custom';
  openModal('Configuração da página','<label class="lab">Tamanho<select id="szSel">'+Object.keys(SIZES).map(k=>'<option value="'+k+'"'+(k===curKey?' selected':'')+'>'+SIZES[k].name+' ('+SIZES[k].w+' × '+SIZES[k].h+')</option>').join('')+'<option value="custom"'+(curKey==='custom'?' selected':'')+'>Personalizado</option></select></label>'+
    '<div class="g2"><label class="lab">Largura (px)<input type="number" id="szW" value="'+W+'" min="200" max="4000"></label><label class="lab">Altura (px)<input type="number" id="szH" value="'+H+'" min="200" max="4000"></label></div>'+
    '<label class="chk"><input type="checkbox" id="szScale" checked> Ajustar a posição e o tamanho dos elementos</label><div class="btns"><button type="button" class="btn primary" id="szOk">Aplicar</button></div>',
    {mount:b=>{const sel=b.querySelector('#szSel');sel.onchange=()=>{const s=SIZES[sel.value];if(s){b.querySelector('#szW').value=s.w;b.querySelector('#szH').value=s.h}};
      b.querySelector('#szOk').onclick=()=>{const w=+b.querySelector('#szW').value,h=+b.querySelector('#szH').value,sc=b.querySelector('#szScale').checked,nm=(SIZES[sel.value]||{}).name||'Personalizado';closeModal();if(w!==W||h!==H)changeSize(w,h,nm,sc)}}});
}
function prefsModal(){
  openModal('Preferências','<div class="sec"><div class="ih">Edição</div>'+
    '<label class="chk"><input type="checkbox" data-pf="livePreview"'+(prefs.livePreview?' checked':'')+'> Mostrar a prévia do LaTeX enquanto digito</label>'+
    '<label class="chk"><input type="checkbox" data-pf="spell"'+(prefs.spell?' checked':'')+'> Verificar a ortografia ao editar texto</label></div>'+
    '<div class="sec"><div class="ih">Réguas, guias e grade</div><label class="chk"><input type="checkbox" data-pf="showRulers"'+(prefs.showRulers?' checked':'')+'> Mostrar réguas</label>'+
    '<label class="chk"><input type="checkbox" data-pf="snapObjects"'+(prefs.snapObjects?' checked':'')+'> Ajustar a guias, página e outros objetos</label>'+
    '<label class="chk"><input type="checkbox" data-pf="snapGrid"'+(prefs.snapGrid?' checked':'')+'> Ajustar à grade</label>'+
    '<div class="g2"><label class="lab">Tamanho da grade (px)<input type="number" min="5" max="200" data-pf="gridSize" value="'+prefs.gridSize+'"></label><label class="lab">Unidade das réguas<select data-pf="unit"><option value="px"'+(prefs.unit==='px'?' selected':'')+'>Pixels</option><option value="cm"'+(prefs.unit==='cm'?' selected':'')+'>Centímetros</option></select></label></div></div>'+
    '<div class="sec"><div class="ih">Versões</div><label class="lab">Guardar uma versão automática a cada (minutos)<input type="number" min="1" max="240" data-pf="autoVersionMin" value="'+prefs.autoVersionMin+'"></label></div>',
    {mount:b=>b.addEventListener('input',ev=>{const t=ev.target;if(!t.dataset.pf)return;const k=t.dataset.pf;prefs[k]=t.type==='checkbox'?t.checked:(t.type==='number'?clamp(+t.value||1,1,1000):t.value);savePrefs();drawGrid();drawRulers();fit()})});
}
function detailsModal(){
  const els=deck.slides.reduce((a,s)=>a+s.els.length,0),bytes=JSON.stringify(deck).length,n=k=>deck.slides.reduce((a,s)=>a+s.els.filter(e=>e.type===k).length,0);
  const l=libList().find(x=>x.id===deck.id)||{};
  openModal('Detalhes da apresentação','<dl class="keys"><dt>Título</dt><dd>'+esc(deck.title)+'</dd><dt>Slides</dt><dd>'+deck.slides.length+' ('+deck.slides.filter(s=>s.skip).length+' ignorados)</dd><dt>Elementos</dt><dd>'+els+' (equações e texto em '+n('box')+' caixas, '+n('table')+' tabelas, '+n('chart')+' gráficos, '+n('image')+' imagens)</dd>'+
    '<dt>Tamanho da página</dt><dd>'+W+' × '+H+' px</dd><dt>Comentários abertos</dt><dd>'+deck.comments.filter(c=>!c.resolved).length+'</dd><dt>Tamanho dos dados</dt><dd>'+(bytes/1024).toFixed(0)+' KB</dd>'+
    (l.created?'<dt>Criada em</dt><dd>'+fmtDate(l.created)+'</dd><dt>Alterada em</dt><dd>'+fmtDate(l.updated)+'</dd>':'')+'</dl>');
}
function printModal(){openModal('Imprimir ou salvar em PDF','<p class="hint">Na janela de impressão, escolha "Salvar como PDF" para gerar o arquivo.</p><div class="btns"><button type="button" class="btn primary" data-w="0">Só os slides</button><button type="button" class="btn" data-w="1">Slides com anotações (A4)</button></div>',
  {mount:b=>b.addEventListener('click',ev=>{const x=ev.target.closest('[data-w]');if(!x)return;closeModal();printDeck(x.dataset.w==='1')})})}
function aboutModal(){openModal('Sobre o Lousa TeX','<p class="hint">Editor de slides com LaTeX nativo e editável, renderizado pelo MathJax 3. Tudo fica salvo no seu navegador; nada é enviado a servidores.</p><dl class="keys"><dt>Versão</dt><dd>3</dd><dt>Modo</dt><dd>'+(standalone?'Arquivo local':'Página do Claude')+'</dd><dt>LaTeX</dt><dd>MathJax 3.2.2 com amsmath, amssymb, braket, cancel, mhchem</dd></dl>')}
function cmdPalette(){
  const all=[];(function walk(items,path){items.forEach(it=>{if(!it||it.sep)return;const p=path?path+' › '+it.label:it.label;if(it.sub)walk(typeof it.sub==='function'?it.sub():it.sub,p);else if(!it.disabled&&it.act)all.push({p:p,sc:it.sc||'',act:it.act})})})(
    Object.keys(MENUS).map(k=>({label:{arquivo:'Arquivo',editar:'Editar',exibir:'Exibir',inserir:'Inserir',formatar:'Formatar',slide:'Slide',organizar:'Organizar',ferramentas:'Ferramentas',ajuda:'Ajuda'}[k],sub:MENUS[k]()})),'');
  const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();let hits=all,k=0;
  openModal('Pesquisar nos menus','<input class="cmdin" id="cmdQ" placeholder="Digite um comando: tabela, ignorar slide, preâmbulo…" autocomplete="off"><div class="cmdlist" id="cmdL"></div>',{mount:b=>{
    const q=b.querySelector('#cmdQ'),L=b.querySelector('#cmdL');
    const draw=()=>{L.innerHTML=hits.slice(0,60).map((h,i)=>'<div class="ci'+(i===k?' on':'')+'" data-i="'+i+'"><span>'+esc(h.p)+'</span><small>'+esc(h.sc)+'</small></div>').join('')||'<p class="hint">Nenhum comando encontrado.</p>'};
    const run=i=>{const h=hits[i];if(!h)return;closeModal();h.act()};
    q.addEventListener('input',()=>{const t=norm(q.value).split(/\s+/).filter(Boolean);hits=all.filter(h=>{const n=norm(h.p);return t.every(w=>n.includes(w))});k=0;draw()});
    q.addEventListener('keydown',ev=>{if(ev.key==='ArrowDown'){ev.preventDefault();k=Math.min(hits.length-1,k+1);draw()}else if(ev.key==='ArrowUp'){ev.preventDefault();k=Math.max(0,k-1);draw()}else if(ev.key==='Enter'){ev.preventDefault();run(k)}});
    L.addEventListener('click',ev=>{const c=ev.target.closest('[data-i]');if(c)run(+c.dataset.i)});draw()}});
}

/* ================= menus ================= */
const ZOOMS=[['fit','Ajustar à janela'],[.5,'50%'],[.75,'75%'],[1,'100%'],[1.25,'125%'],[1.5,'150%'],[2,'200%']];
const zoomItems=()=>[{label:'Ampliar',sc:MOD+'+',act:()=>setZoom(clamp(+(scale*1.2).toFixed(3),.1,4))},{label:'Reduzir',sc:MOD+'−',act:()=>setZoom(clamp(+(scale/1.2).toFixed(3),.1,4))},{sep:1}].concat(ZOOMS.map(z=>({label:z[1],checked:zoom===z[0],act:()=>setZoom(z[0])})));
const shapeItems=()=>SHAPE_CATS.map(c=>({label:c[0],sub:c[1].map(k=>({label:SHAPES[k],act:()=>setTool({kind:'shape',shape:k})}))}));
const lineItems=()=>[{label:'Linha',act:()=>setTool({kind:'line',arrow:false})},{label:'Seta',act:()=>setTool({kind:'line',arrow:true})},{label:'Seta dupla',act:()=>setTool({kind:'line',arrow:'both'})},
  {label:'Conector angular',act:()=>setTool({kind:'line',arrow:true,route:'elbow'})},{label:'Conector curvo',act:()=>setTool({kind:'line',arrow:true,route:'curve'})},{label:'Rabisco (à mão livre)',act:()=>setTool({kind:'ink'})}];
const layoutItems=fn=>Object.keys(LAYOUTS).map(k=>({label:LAYOUTS[k].name,act:()=>fn(k)}));
const orderItems=()=>[{label:'Trazer para a frente',sc:MOD+'Shift+↑',act:()=>order('front')},{label:'Avançar',sc:MOD+'↑',act:()=>order('forward')},{label:'Recuar',sc:MOD+'↓',act:()=>order('backward')},{label:'Enviar para trás',sc:MOD+'Shift+↓',act:()=>order('back')}];
const alignItems=()=>[['left','À esquerda','oL'],['center','Ao centro','oC'],['right','À direita','oR'],['top','Em cima','oT'],['middle','No meio','oM'],['bottom','Embaixo','oB']].map(a=>({label:a[1],icon:a[2],act:()=>alignSel(a[0])}));
const rotateItems=()=>[{label:'Girar 90° no sentido horário',act:()=>rotateSel(90)},{label:'Girar 90° no sentido anti-horário',act:()=>rotateSel(-90)},{sep:1},
  {label:'Virar horizontalmente',act:()=>flipSel('h')},{label:'Virar verticalmente',act:()=>flipSel('v')},{sep:1},{label:'Remover rotação',act:()=>{selEls().forEach(e=>{if(e.type!=='line'){e.rot=0;restyle(e)}});commit();thumbSoon()}}];
const tableItems=()=>{const on=!!tbl();return[
  {label:'Inserir linha acima',act:()=>tableOp('rowAbove'),disabled:!on},{label:'Inserir linha abaixo',act:()=>tableOp('rowBelow'),disabled:!on},{label:'Inserir coluna à esquerda',act:()=>tableOp('colLeft'),disabled:!on},{label:'Inserir coluna à direita',act:()=>tableOp('colRight'),disabled:!on},{sep:1},
  {label:'Excluir linha',act:()=>tableOp('delRow'),disabled:!on},{label:'Excluir coluna',act:()=>tableOp('delCol'),disabled:!on},{label:'Excluir tabela',act:()=>tableOp('delTable'),disabled:!on},{sep:1},
  {label:'Mesclar células',act:()=>tableOp('merge'),disabled:!on},{label:'Desfazer mesclagem',act:()=>tableOp('unmerge'),disabled:!on},{sep:1},
  {label:'Bordas das células selecionadas',disabled:!on,sub:[{label:'Todas as bordas',act:()=>setCellBorders('all')},{label:'Só as bordas externas',act:()=>setCellBorders('outer')},{label:'Só as bordas internas',act:()=>setCellBorders('inner')},{label:'Sem bordas',act:()=>setCellBorders('none')}]},{sep:1},
  {label:'Distribuir linhas',act:()=>tableOp('distRows'),disabled:!on},{label:'Distribuir colunas',act:()=>tableOp('distCols'),disabled:!on},{sep:1},
  {label:'Linha de cabeçalho',checked:on&&tbl().header,act:()=>tableOp('header'),disabled:!on},{label:'Linhas alternadas',checked:on&&tbl().band,act:()=>tableOp('band'),disabled:!on}]};
const exportItems=()=>[{label:'Lousa TeX (.lousa)',act:exportJSON},{label:'LaTeX Beamer (.tex)',act:exportBeamer},{label:'PowerPoint (.pptx)',act:exportPptx,disabled:!standalone,hint:standalone?'':'Disponível na versão local (arquivo .html)'},{label:'Texto simples (.txt)',act:exportText},
  {label:'PDF',act:printModal,disabled:!standalone,hint:standalone?'':'Disponível na versão local (arquivo .html)'}];
const fitItems=()=>[['none','Não ajustar automaticamente'],['shrink','Reduzir o texto ao transbordar'],['grow','Redimensionar a forma para caber o texto']].map(f=>({label:f[1],checked:propOf('fit')===f[0],act:()=>setProp('fit',f[0],['box'])}));
const MENUS={
  arquivo:()=>[
    {label:'Nova apresentação',act:newDeck},{label:'Minhas apresentações',act:showHome},{label:'Abrir arquivo do computador…',sc:MOD+'O',act:openFileSmart},{label:'Importar slides…',act:()=>openImportModal(false)},{label:'Google Drive',sub:driveItems},{sep:1},
    {label:'Salvar no computador',sc:MOD+'S',act:()=>saveToFile(false)},{label:'Salvar como…',sc:MOD+'Shift+S',act:()=>saveToFile(true)},{label:'Instalar como aplicativo…',act:installApp},{sep:1},
    {label:'Fazer uma cópia',act:()=>copyDeck()},{label:'Renomear',act:()=>{const t=$('#deckTitle');t.focus();t.select()}},{sep:1},
    {label:'Histórico de versões',sub:[{label:'Ver histórico de versões',act:versionsModal},{label:'Nomear a versão atual',act:versionsModal}]},{sep:1},
    {label:'Fazer download',sub:exportItems},{label:'Copiar ou colar conteúdo…',act:pasteContentModal},
    {label:'Imprimir',sc:MOD+'P',act:printModal,disabled:!standalone,hint:standalone?'':'Disponível na versão local (arquivo .html)'},{sep:1},
    {label:'Detalhes',act:detailsModal},{label:'Configuração da página…',act:sizeModal},{sep:1},
    {label:'Restaurar apresentação de exemplo',act:()=>confirmBox('Abrir o exemplo?','A apresentação de exemplo será aberta como uma nova apresentação. A atual continua salva em Arquivo › Abrir.','Abrir exemplo',()=>{const d=sampleDeck();openDeck(d,'Exemplo aberto.')})}],
  editar:()=>[
    {label:'Desfazer',sc:MOD+'Z',act:undo,disabled:hi<=0},{label:'Refazer',sc:MOD+'Y',act:redo,disabled:hi>=hist.length-1},{sep:1},
    {label:'Recortar',sc:MOD+'X',act:()=>copySel(true),disabled:!selIds.length},{label:'Copiar',sc:MOD+'C',act:()=>copySel(false),disabled:!selIds.length},
    {label:'Colar',sc:MOD+'V',act:pasteFromMenu},{label:'Colar sem formatação',sc:MOD+'Shift+V',act:pastePlainFromMenu},{sep:1},
    {label:'Selecionar tudo',sc:MOD+'A',act:()=>select(slide().els.map(e=>e.id))},{label:'Desmarcar',sc:'Esc',act:()=>select([])},
    {label:'Duplicar',sc:MOD+'D',act:duplicateSel,disabled:!selIds.length},{label:'Excluir',sc:'Del',act:()=>removeEls(selIds.slice()),disabled:!selIds.length},{sep:1},
    {label:'Localizar e substituir',sc:MOD+'H',act:()=>openSide('find',true)},{sep:1},
    {label:'Copiar formatação',sc:MOD+ALT+'C',act:startPainter,disabled:!selIds.length},{label:'Limpar formatação',sc:MOD+'\\',act:clearFormat,disabled:!textEls().length&&!editId}],
  exibir:()=>[
    {label:'Apresentar deste slide',sc:'F5',act:()=>startPres(cur)},{label:'Apresentar do início',sc:'Shift+F5',act:()=>startPres(0)},{label:'Visualização do apresentador',sc:MOD+ALT+'P',act:()=>startPres(cur,true)},{sep:1},
    {label:'Visualização em grade',checked:gridView,sc:MOD+ALT+'1',act:()=>toggleGridView()},{label:'Mostrar miniaturas dos slides',checked:prefs.showRail,act:()=>{prefs.showRail=!prefs.showRail;savePrefs();applyPrefsUI()}},
    {label:'Mostrar anotações do apresentador',checked:prefs.showNotes,act:()=>{prefs.showNotes=!prefs.showNotes;savePrefs();applyPrefsUI()}},{sep:1},
    {label:'Mostrar réguas',checked:prefs.showRulers,act:()=>{prefs.showRulers=!prefs.showRulers;savePrefs();applyPrefsUI()}},
    {label:'Guias',sub:()=>[{label:'Mostrar guias',checked:prefs.showGuides,act:()=>{prefs.showGuides=!prefs.showGuides;savePrefs();drawGuides()}},
      {label:'Adicionar guia vertical',act:()=>{prefs.showGuides=true;deck.guides.v.push(Math.round(W/2));drawGuides();commit()}},{label:'Adicionar guia horizontal',act:()=>{prefs.showGuides=true;deck.guides.h.push(Math.round(H/2));drawGuides();commit()}},
      {label:'Remover todas as guias',act:()=>{deck.guides={v:[],h:[]};drawGuides();commit()},disabled:!deck.guides.v.length&&!deck.guides.h.length}]},
    {label:'Linhas de grade',checked:prefs.showGrid,act:()=>{prefs.showGrid=!prefs.showGrid;savePrefs();drawGrid()}},
    {label:'Ajustar a',sub:()=>[{label:'Grade',checked:prefs.snapGrid,act:()=>{prefs.snapGrid=!prefs.snapGrid;savePrefs()}},{label:'Guias, página e objetos',checked:prefs.snapObjects,act:()=>{prefs.snapObjects=!prefs.snapObjects;savePrefs()}}]},{sep:1},
    {label:'Mostrar conteúdo fora do slide',checked:prefs.pasteboard,act:()=>{prefs.pasteboard=!prefs.pasteboard;savePrefs();updatePasteboard();toast(prefs.pasteboard?'O que passa da borda aparece esmaecido em volta do slide.':'O que passa da borda fica cortado, como na apresentação.')}},
    {label:'Aparência do programa',sub:()=>Object.keys(UI_THEMES).map(k=>({label:UI_THEMES[k],checked:(prefs.uiTheme||'auto')===k,act:()=>setUiTheme(k)}))},
    {label:'Fundo da área de trabalho',sub:()=>Object.keys(STAGE_BGS).map(k=>({label:STAGE_BGS[k],checked:(prefs.stageBg||'')===k,act:()=>setStageBg(k)}))},{sep:1},
    {label:'Zoom',sub:zoomItems},{label:'Tela cheia',act:()=>{const de=document.documentElement;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(de.requestFullscreen)de.requestFullscreen().catch(()=>toast('Tela cheia não disponível aqui.'))}},{sep:1},
    {label:'Mestre',checked:masterMode,act:()=>masterMode?exitMaster():enterMaster()},
    {label:'Painéis',sub:[{label:'Tema',checked:sideMode==='theme',act:()=>openSide('theme')},{label:'Opções de formato',checked:sideMode==='format',act:()=>openSide('format')},{label:'Animação',checked:sideMode==='anim',act:()=>openSide('anim')},{label:'Comentários',checked:sideMode==='comments',act:()=>openSide('comments')}]}],
  inserir:()=>[
    {label:'Caixa de texto',act:()=>setTool({kind:'text'})},{label:'Word Art',act:insertWordArt},
    {label:'Imagem',sub:[{label:'Fazer upload do computador…',act:()=>pickImage()},{label:'Por endereço (URL)…',act:imageUrlModal}]},
    {label:'Vídeo ou áudio…',act:mediaModal},
    {label:'Equação',sub:[{label:'Em linha $…$',sc:MOD+'Shift+M',act:inlineMath},{label:'Destacada $$…$$',act:displayMath},{label:'Símbolos e estruturas…',act:()=>eqPop(toolbar.querySelector('[data-cmd="eq"]')||toolbar)}]},
    {label:'Caracteres especiais…',act:()=>charsPop(toolbar)},
    {label:'Forma',sub:shapeItems},{label:'Linha e conector',sub:lineItems},
    {label:'Tabela',sub:()=>[[2,2],[3,3],[4,3],[5,4]].map(t=>({label:t[0]+' × '+t[1],act:()=>insertTable(t[0],t[1])})).concat([{label:'Outro tamanho…',act:tableModal}])},
    {label:'Gráfico',sub:()=>Object.keys(CHART_KINDS).map(k=>({label:CHART_KINDS[k],act:()=>{const e=chartEl(k,{x:Math.round((W-640)/2),y:Math.round((H-420)/2)});addEls([e]);openSide('format',true)}}))},
    {label:'Diagrama…',act:()=>diagramPop(toolbar)},
    {label:'Diagrama TikZ (LaTeX)',sub:tikzItems},
    {label:'Bloco (Teorema, Definição…)',sub:()=>Object.keys(BLOCKS).map(k=>({label:BLOCKS[k][0],act:()=>insertBlock(k)}))},{sep:1},
    {label:'Citação e referências…',act:refsModal},{label:'Slide de referências',act:insertRefsSlide},{label:'Sumário automático',act:insertTocSlide},{sep:1},
    {label:'Link',sc:MOD+'K',act:()=>linkPop(toolbar)},{label:'Comentário',sc:MOD+ALT+'M',act:startComment},
    {label:'Números de slide',checked:deck.theme.showNumbers,act:()=>{deck.theme.showNumbers=!deck.theme.showNumbers;rerenderAll();commit()}},{sep:1},
    {label:'Novo slide',sc:MOD+'M',act:()=>addSlide()},{label:'Novo slide com layout',sub:()=>layoutItems(addSlide)},{label:'Importar slides…',act:()=>openImportModal(false)}],
  formatar:()=>{const has=textEls().length>0||!!editId;return[
    {label:'Texto',disabled:!has,sub:[{label:'Negrito',sc:MOD+'B',act:()=>textCmd('bold')},{label:'Itálico',sc:MOD+'I',act:()=>textCmd('italic')},{label:'Sublinhado',sc:MOD+'U',act:()=>textCmd('underline')},
      {label:'Tachado',sc:ALT+'Shift+5',act:()=>textCmd('strikeThrough')},{label:'Sobrescrito',sc:MOD+'.',act:()=>textCmd('superscript')},{label:'Subscrito',sc:MOD+',',act:()=>textCmd('subscript')},{sep:1},
      {label:'Aumentar a fonte',sc:MOD+'Shift+>',act:()=>stepSize(1)},{label:'Diminuir a fonte',sc:MOD+'Shift+<',act:()=>stepSize(-1)},{sep:1},
      {label:'Maiúsculas e minúsculas',sub:[{label:'MAIÚSCULAS',act:()=>setCase('upper')},{label:'minúsculas',act:()=>setCase('lower')},{label:'Primeira Letra Maiúscula',act:()=>setCase('title')}]},
      {label:'Cor de realce…',act:()=>colorPop(toolbar,null,c=>setHighlight(c),{none:'Sem realce'})}]},
    {label:'Alinhar e recuar',disabled:!has,sub:[{label:'À esquerda',sc:MOD+'Shift+L',act:()=>alignText('left')},{label:'Centralizado',sc:MOD+'Shift+E',act:()=>alignText('center')},{label:'À direita',sc:MOD+'Shift+R',act:()=>alignText('right')},{label:'Justificado',sc:MOD+'Shift+J',act:()=>alignText('justify')},{sep:1},
      {label:'Aumentar recuo',sc:MOD+']',act:()=>indent(1)},{label:'Diminuir recuo',sc:MOD+'[',act:()=>indent(-1)},{sep:1},
      {label:'Em cima',act:()=>valignText('top')},{label:'No meio',act:()=>valignText('middle')},{label:'Embaixo',act:()=>valignText('bottom')}]},
    {label:'Espaçamento entre linhas e parágrafos',disabled:!has,sub:()=>[1,1.15,1.25,1.5,2].map(v=>({label:'Linhas: '+String(v).replace('.',','),checked:propOf('lh')===v,act:()=>setProp('lh',v,['box'])})).concat([{sep:1}],[0,.3,.6,1].map(v=>({label:'Entre parágrafos: '+String(v).replace('.',',')+' em',checked:(propOf('ps')||0)===v,act:()=>setProp('ps',v,['box'])})))},
    {label:'Marcadores e numeração',disabled:!has,sub:[{label:'Lista com marcadores',sub:BULLETS.map(b=>({label:b[1]+'  '+b[2],act:()=>setListStyle(b[0],false)}))},{label:'Lista numerada',sub:NUMBERS.map(n=>({label:n[1],act:()=>setListStyle(n[0],true)}))},...markerItems(),{sep:1},
      {label:'Aumentar recuo',act:()=>indent(1)},{label:'Diminuir recuo',act:()=>indent(-1)}]},
    {label:'Direção do texto',disabled:!selBoxes().length,sub:[{label:'Da esquerda para a direita',checked:propOf('dir')!=='rtl',act:()=>setProp('dir','ltr',['box'])},{label:'Da direita para a esquerda',checked:propOf('dir')==='rtl',act:()=>setProp('dir','rtl',['box'])}]},
    {label:'Ajuste automático',disabled:!selBoxes().length,sub:fitItems},{sep:1},
    {label:'Limpar formatação',sc:MOD+'\\',act:clearFormat,disabled:!has},{sep:1},
    {label:'Tabela',disabled:!tbl(),sub:tableItems},{label:'Imagem',disabled:!(selEls()[0]&&selEls()[0].type==='image'),sub:()=>[{label:'Cortar',act:()=>enterCrop(selEls()[0])},{label:'Mascarar com forma',sub:maskItems},{label:'Redefinir imagem',act:()=>resetImage(selEls()[0])},{label:'Substituir imagem…',act:()=>pickImage(selEls()[0])}]},
    {label:'Opções de formato…',act:()=>openSide('format')}]},
  slide:()=>{const one=!masterMode&&deck.slides[cur];return[
    {label:'Novo slide',sc:MOD+'M',act:()=>addSlide()},{label:'Duplicar slide',act:dupSlides,disabled:masterMode},{label:'Excluir slide',act:delSlides,disabled:masterMode},
    {label:'Ignorar slide',checked:one&&one.skip,act:toggleSkip,disabled:masterMode},{sep:1},
    {label:'Mover slide',disabled:masterMode,sub:[{label:'Para cima',act:()=>moveSlides('up')},{label:'Para baixo',act:()=>moveSlides('down')},{label:'Para o início',act:()=>moveSlides('top')},{label:'Para o fim',act:()=>moveSlides('end')}]},{sep:1},
    {label:'Alterar plano de fundo',sub:[{label:'Cor…',act:()=>colorPop(toolbar,slide().bg,c=>c?setSlideBg(c):resetSlideBg(),{none:'Usar o fundo do tema'})},{label:'Imagem…',act:()=>pickBgImage('slide')},{label:'Redefinir',act:resetSlideBg}]},
    {label:'Número do slide',icon:'hash',disabled:masterMode||!deck.theme.showNumbers,hint:deck.theme.showNumbers?'':'Ligue a numeração no painel Tema',sub:numberItems},
    {label:'Aplicar layout',disabled:masterMode,sub:()=>layoutItems(applyLayout)},{label:'Redefinir slide',act:resetSlide,disabled:masterMode},{sep:1},
    {label:'Transição…',act:()=>openSide('anim')},{sep:1},
    {label:'Editar tema e preâmbulo LaTeX…',act:()=>openSide('theme')},{label:'Editar mestre',checked:masterMode,act:()=>masterMode?exitMaster():enterMaster()},
    {label:'Ocultar elementos do mestre neste slide',checked:one&&one.hideMaster,disabled:masterMode,act:()=>{deck.slides.filter(s=>slideSel.has(s.id)).forEach(s=>{s.hideMaster=!one.hideMaster});renderStage();rebuildThumbs();commit()}},
    {label:'Importar tema…',act:()=>openImportModal(false)},{label:'Alterar o tamanho da página…',act:sizeModal}]},
  organizar:()=>{const n=selIds.length;return[
    {label:'Ordem',disabled:!n,sub:orderItems},{label:'Alinhar',disabled:!n,sub:alignItems},
    {label:'Distribuir',disabled:n<3,sub:[{label:'Horizontalmente',act:()=>distribute('h')},{label:'Verticalmente',act:()=>distribute('v')}]},
    {label:'Centralizar na página',disabled:!n,sub:[{label:'Horizontalmente',act:()=>alignSel('center',true)},{label:'Verticalmente',act:()=>alignSel('middle',true)}]},
    {label:'Girar e virar',disabled:!n,sub:rotateItems},{sep:1},
    {label:'Agrupar',sc:MOD+ALT+'G',act:groupSel,disabled:n<2},{label:'Desagrupar',sc:MOD+ALT+'Shift+G',act:ungroupSel,disabled:!selEls().some(e=>e.group)},{sep:1},
    {label:selEls().length&&selEls().every(e=>e.locked)?'Desbloquear':'Bloquear posição',act:lockSel,disabled:!n}]},
  ferramentas:()=>[
    {label:'Verificação ortográfica',checked:prefs.spell,act:()=>{prefs.spell=!prefs.spell;savePrefs();const t=curTx();if(t)t.spellcheck=prefs.spell;toast(prefs.spell?'Ortografia verificada ao editar (dicionário do navegador).':'Verificação ortográfica desligada.')}},
    {label:'Prévia do LaTeX ao digitar',checked:prefs.livePreview,act:()=>{prefs.livePreview=!prefs.livePreview;savePrefs();if(!prefs.livePreview)hidePreview();else schedulePreview()}},
    SR&&standalone?{label:'Ditar anotações do apresentador',act:toggleDictation}:null,{sep:1},
    {label:'Pacotes LaTeX…',act:pkgModal},{sep:1},
    {label:'Localizar e substituir',sc:MOD+'H',act:()=>openSide('find',true)},{label:'Preferências…',act:prefsModal}],
  ajuda:()=>[
    {label:'Pesquisar nos menus',sc:ALT+'/',act:cmdPalette},{label:'Atalhos de teclado',sc:MOD+'/',act:()=>openSide('keys')},{label:'Guia rápido',act:()=>openSide('help')},{sep:1},{label:'Página inicial',act:showLanding},{label:'Sobre o Lousa TeX',act:aboutModal}]
};
const maskItems=()=>[{label:'Sem máscara',act:()=>setProp('mask',null,['image'])}].concat(['ellipse','round','triangle','diamond','hexagon','star','heart','pentagon'].map(k=>({label:SHAPES[k],act:()=>setProp('mask',k,['image'])})));
function elCtxItems(){const els=selEls(),one=els.length===1?els[0]:null;return[
  {label:'Recortar',sc:MOD+'X',act:()=>copySel(true)},{label:'Copiar',sc:MOD+'C',act:()=>copySel(false)},{label:'Colar',sc:MOD+'V',act:pasteFromMenu},
  {label:'Duplicar',sc:MOD+'D',act:duplicateSel},{label:'Excluir',sc:'Del',act:()=>removeEls(selIds.slice())},{sep:1},
  one&&one.type==='box'?{label:'Editar texto',sc:'Enter',act:()=>enterEdit(one,'end')}:null,
  one&&one.type==='table'?{label:'Tabela',sub:tableItems}:null,
  one&&one.type==='image'?{label:'Cortar imagem',act:()=>enterCrop(one)}:null,one&&one.type==='image'?{label:'Mascarar com forma',sub:maskItems}:null,
  one&&one.type==='image'?{label:'Substituir imagem…',act:()=>pickImage(one)}:null,one&&one.type==='image'?{label:'Redefinir imagem',act:()=>resetImage(one)}:null,
  {label:'Link',sc:MOD+'K',act:()=>linkPop(toolbar)},{label:'Comentário',sc:MOD+ALT+'M',act:startComment},{sep:1},
  {label:'Ordem',sub:orderItems},{label:'Alinhar',sub:alignItems},{label:'Girar e virar',sub:rotateItems},
  els.length>1?{label:'Agrupar',act:groupSel}:null,els.some(e=>e.group)?{label:'Desagrupar',act:ungroupSel}:null,
  {label:els.every(e=>e.locked)?'Desbloquear':'Bloquear posição',act:lockSel},{sep:1},
  {label:'Copiar formatação',act:startPainter},{label:'Animar',act:()=>{animateSel();openSide('anim',true)}},{label:'Opções de formato…',act:()=>openSide('format',true)}]}
function setSlideNum(k,v){const ids=slideSel.size?Array.from(slideSel):[slide().id];deck.slides.forEach(s=>{if(!ids.includes(s.id))return;s.num=Object.assign({},s.num);if(v==null||v==='')delete s.num[k];else s.num[k]=v;if(!Object.keys(s.num).length)delete s.num});rerenderAll();commit()}
function numSameBg(){const s=slide(),key=(s.bg||'')+'|'+(s.bgImage||''),src=Object.assign({},s.num);delete src.hide;let n=0;
  deck.slides.forEach(o=>{if(o===s||((o.bg||'')+'|'+(o.bgImage||''))!==key)return;o.num=Object.assign({},o.num,src);['color','bg'].forEach(k=>{if(!src[k])delete o.num[k]});if(!Object.keys(o.num).length)delete o.num;n++});
  rerenderAll();commit();toast(n?'Cores do número aplicadas a mais '+n+' slide'+(n>1?'s':'')+' com o mesmo fundo.':'Nenhum outro slide com o mesmo fundo.')}
const numberItems=()=>{const s=slide(),n=(s&&s.num)||{},t=deck.theme;return[
  {label:'Cor do número neste slide…',icon:'hash',act:()=>colorPop(toolbar,n.color,c=>setSlideNum('color',c?resolveColor(c):''),{none:'Usar a cor do tema'})},
  {label:'Cor do fundo do número neste slide…',icon:'fill',disabled:!t.numBgOn,hint:t.numBgOn?'':'Ligue "Fundo atrás do número" no painel Tema',act:()=>colorPop(toolbar,n.bg,c=>setSlideNum('bg',c?resolveColor(c):''),{none:'Usar a cor do tema'})},
  {label:'Usar estas cores nos slides com o mesmo fundo',icon:'dup',act:numSameBg},
  {label:'Ocultar o número neste slide',icon:'eyeoff',checked:!!n.hide,act:()=>setSlideNum('hide',n.hide?'':true)},{sep:1},
  {label:'Cor automática conforme o fundo',checked:t.numAuto!==false,act:()=>{t.numAuto=t.numAuto===false;rerenderAll();commit();if(sideMode==='theme')renderSide()}},
  {label:'Opções de numeração no tema…',icon:'theme',act:()=>openSide('theme',true)}]};
function slideBgCtxItems(){return[{label:'Colar',sc:MOD+'V',act:pasteFromMenu},{sep:1},
  {label:'Alterar plano de fundo',sub:[{label:'Cor…',act:()=>colorPop(toolbar,slide().bg,c=>c?setSlideBg(c):resetSlideBg(),{none:'Usar o fundo do tema'})},{label:'Imagem…',act:()=>pickBgImage('slide')},{label:'Redefinir',act:resetSlideBg}]},
  {label:'Número do slide',icon:'hash',disabled:masterMode||!deck.theme.showNumbers,hint:deck.theme.showNumbers?'':'Ligue a numeração no painel Tema',sub:numberItems},{label:'Aplicar layout',sub:()=>layoutItems(applyLayout),disabled:masterMode},{label:'Transição…',act:()=>openSide('anim')},{label:'Editar tema…',act:()=>openSide('theme')},{sep:1},
  {label:'Comentário no slide',act:startComment},{label:'Novo slide',sc:MOD+'M',act:()=>addSlide()}]}
function slideCtxItems(){const s=deck.slides[cur];return[
  {label:'Novo slide',sc:MOD+'M',act:()=>addSlide()},{label:'Novo slide com layout',sub:()=>layoutItems(addSlide)},{label:'Duplicar slide',act:dupSlides},{label:'Excluir slide',act:delSlides},
  {label:'Ignorar slide',checked:s&&s.skip,act:toggleSkip},{sep:1},
  {label:'Recortar',act:()=>copySlides(null,true)},{label:'Copiar',act:()=>copySlides(null)},{label:'Colar',act:()=>clipSlides&&pasteSlides(clipSlides),disabled:!clipSlides},{sep:1},
  {label:'Mover para cima',act:()=>moveSlides('up'),disabled:cur===0},{label:'Mover para baixo',act:()=>moveSlides('down'),disabled:cur>=deck.slides.length-1},
  {label:'Mover para o início',act:()=>moveSlides('top')},{label:'Mover para o fim',act:()=>moveSlides('end')},{sep:1},
  {label:'Número do slide',icon:'hash',disabled:!deck.theme.showNumbers,sub:numberItems},{label:'Aplicar layout',sub:()=>layoutItems(applyLayout)},{label:'Alterar plano de fundo…',act:()=>colorPop(toolbar,slide().bg,c=>c?setSlideBg(c):resetSlideBg(),{none:'Usar o fundo do tema'})},
  {label:'Transição…',act:()=>openSide('anim')},{label:'Comentário no slide',act:()=>{select([]);startComment()}}]}
function alignText(v){const e=tbl();if(e){setCellProp('align',v);return}if(editId){const x=editEl();x.align=v;styleEl(elDom(x),x);commitSoon();renderToolbar();return}setProp('align',v,['box']);renderToolbar()}
function valignText(v){const e=tbl();if(e){setCellProp('valign',v);return}setProp('valign',v,['box'])}
