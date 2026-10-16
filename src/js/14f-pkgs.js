/* ================= gerenciador geral de pacotes LaTeX ================= */
const PKG_DEF_RE=/\\(newcommand|renewcommand|providecommand|DeclareRobustCommand|DeclareMathOperator|newenvironment|renewenvironment|def|let)(?![A-Za-z])(\*?)/g;
const PKG_BAD_RE=/@|\\(if[a-z]*|fi|else|expandafter|csname|endcsname|edef|xdef|gdef|global|futurelet|afterassignment|catcode|PackageError|PackageWarning|RequirePackage|usepackage|pgf[a-zA-Z]*|tikz[a-zA-Z]*|begingroup|endgroup|relax|noexpand|protected|long|outer)(?![A-Za-z])/;
function pkgStripComments(s){return s.split('\n').map(l=>{let o='';for(let i=0;i<l.length;i++){if(l[i]==='\\'){o+=l[i]+(l[i+1]||'');i++;continue}if(l[i]==='%')break;o+=l[i]}return o}).join('\n')}
function extractMath(code){
  const src=pkgStripComments(String(code||''));let i=0,out=[],ok=0,skip=0;const reqs=new Set();
  const ws=()=>{while(i<src.length&&/\s/.test(src[i]))i++};
  const group=()=>{ws();if(src[i]==='{'){let d=0,s=i;for(;i<src.length;i++){const c=src[i];if(c==='\\'){i++;continue}if(c==='{')d++;else if(c==='}'){d--;if(!d){i++;return src.slice(s+1,i-1)}}}return null}
    if(src[i]==='\\'){const m=/^\\([A-Za-z]+|.)/.exec(src.slice(i));if(!m)return null;i+=m[0].length;return m[0]}return null};
  const opt=()=>{ws();if(src[i]!=='[')return null;let d=0,s=i;for(;i<src.length;i++){const c=src[i];if(c==='{')d++;else if(c==='}')d--;else if(c===']'&&!d){i++;return src.slice(s+1,i-1)}}return null};
  src.replace(/\\(?:RequirePackage|usepackage)\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}/g,(m,l)=>{l.split(',').forEach(n=>reqs.add(n.trim()))});
  PKG_DEF_RE.lastIndex=0;let m;
  while((m=PKG_DEF_RE.exec(src))){
    i=m.index+m[0].length;const k=m[1],star=m[2];let line=null,name='';
    try{
      if(k==='def'){const n=group();const ps=i;while(i<src.length&&src[i]!=='{')i++;const params=src.slice(ps,i).trim();const body=group();name=n||'';
        if(n&&body!=null&&/^(#\d)*$/.test(params.replace(/\s/g,'')))line='\\newcommand{'+n+'}'+(params?'['+(params.match(/#/g)||[]).length+']':'')+'{'+body+'}';}
      else if(k==='let'){const a=group();ws();if(src[i]==='=')i++;const b=group();name=a||'';if(a&&b)line='\\let'+a+b}
      else if(k==='DeclareMathOperator'){const n=group(),body=group();name=n||'';if(n&&body!=null)line='\\DeclareMathOperator'+star+'{'+n+'}{'+body+'}'}
      else if(/environment/.test(k)){const n=group(),na=opt(),df=opt(),b=group(),e=group();name=n||'';if(n&&b!=null&&e!=null)line='\\newenvironment{'+n+'}'+(na?'['+na+']':'')+(df!=null?'['+df+']':'')+'{'+b+'}{'+e+'}'}
      else{const n=group(),na=opt(),df=opt(),body=group();name=n||'';if(n&&body!=null)line='\\newcommand{'+n+'}'+(na?'['+na+']':'')+(df!=null?'['+df+']':'')+'{'+body+'}'}
    }catch(er){line=null}
    PKG_DEF_RE.lastIndex=Math.max(i,m.index+1);
    if(line&&!PKG_BAD_RE.test(line)&&!/@/.test(name)){out.push(line);ok++}else skip++;
  }
  return{code:out.join('\n'),ok:ok,skip:skip,reqs:Array.from(reqs).filter(Boolean)};
}
function pkgPrepare(p){const r=extractMath(p.code);p.mathCode=r.code;p.mathN=r.ok;p.skipN=r.skip;p.reqs=r.reqs;return p}
function cleanPkgCode(t){return String(t).replace(/^\s*\\ProvidesPackage.*$/mg,'').replace(/^\s*\\NeedsTeXFormat.*$/mg,'').replace(/^\s*\\endinput\s*$/mg,'')}
function pkgIdFrom(name){return String(name||'pacote').replace(/\.(sty|tex)$/i,'').replace(/[^\w-]+/g,'-').replace(/^-+|-+$/g,'')||'pacote'}
async function readPkgFiles(files){
  const map={};for(const f of files)map[f.name.replace(/\.(sty|tex)$/i,'')]=await f.text();
  const names=Object.keys(map);if(!names.length)return null;
  const main=names.find(n=>!names.some(o=>o!==n&&new RegExp('\\\\(input|include|RequirePackage)\\s*\\{'+n.replace(/[-.]/g,'\\$&')+'(\\.sty|\\.tex)?\\}').test(map[o])))||names[0];
  const seen=new Set();const res=(n)=>{if(seen.has(n))return '';seen.add(n);return cleanPkgCode(map[n]).replace(/\\(?:input|include|RequirePackage)\s*\{([^}]+)\}/g,(mm,x)=>{const k=x.replace(/\.(sty|tex)$/i,'');return map[k]!=null?res(k):mm})};
  return{name:main,code:res(main)};
}
function pkgUrl(u){u=u.trim();const g=/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/.exec(u);return g?'https://raw.githubusercontent.com/'+g[1]+'/'+g[2]+'/'+g[3]:u}
function addPkg(name,code,opt){
  opt=opt||{};const id=pkgIdFrom(name);let p=deck.texPkgs.find(x=>x.id===id);
  if(!p){p={id:id,name:String(name).replace(/\.(sty|tex)$/i,''),libs:'',code:'',math:true,tikzAll:false};deck.texPkgs.push(p)}
  p.code=cleanPkgCode(code);if(opt.libs!=null)p.libs=opt.libs;pkgPrepare(p);
  const auto=(p.reqs||[]).filter(r=>TEXPKG[r]&&!deck.packages.includes(r));auto.forEach(r=>deck.packages.push(r));
  return{p:p,auto:auto};
}
function pkgAfterChange(){applyPreamble().then(()=>rerenderAll());commit();if(!side.hidden)renderSide()}
function pkgRowHTML(p){
  return '<div class="pkrow" data-pid="'+esc(p.id)+'"><div class="pkhead"><code>'+esc(p.name)+'</code><span class="hint">'+(p.mathN||0)+' comando(s) para equações'+(p.skipN?' · '+p.skipN+' só no TikZ/Beamer':'')+'</span></div>'+
    '<div class="pkopts"><label class="chk"><input type="checkbox" data-pk="math"'+(p.math?' checked':'')+'> Equações e textos</label>'+
    '<label class="chk"><input type="checkbox" data-pk="tikzAll"'+(p.tikzAll?' checked':'')+'> Todos os diagramas TikZ</label>'+
    '<span style="flex:1"></span><button type="button" class="btn small" data-pk="view">Ver</button><button type="button" class="btn small danger" data-pk="del">Remover</button></div></div>';
}
function pkgModal(){
  const list=()=>deck.texPkgs.length?deck.texPkgs.map(pkgRowHTML).join(''):'<p class="hint">Nenhum pacote importado ainda.</p>';
  openModal('Pacotes LaTeX',
    '<h4 class="pksec">Extensões prontas para equações</h4><div class="pkgrid">'+Object.keys(TEXPKG).map(k=>'<label class="chk" title="'+esc(TEXPKG[k][1])+'"><input type="checkbox" data-bi="'+k+'"'+(deck.packages.includes(k)?' checked':'')+'> <code>'+k+'</code></label>').join('')+'</div>'+
    '<h4 class="pksec">Pacotes importados</h4><div id="pkList">'+list()+'</div>'+
    '<h4 class="pksec">Importar pacote</h4>'+
    '<div class="row"><label class="lab">Nome<input id="pkName" placeholder="ex.: meuspacotes, braket, siunitx-lite"></label><label class="lab">Bibliotecas TikZ (opcional)<input id="pkLibs" placeholder="arrows.meta, calc"></label></div>'+
    '<label class="lab">Código (.sty ou definições)<textarea id="pkCode" class="mono" rows="7" spellcheck="false" placeholder="\\newcommand{\\ket}[1]{\\left|#1\\right\\rangle}\n\\DeclareMathOperator{\\Tr}{Tr}"></textarea></label>'+
    '<div class="row"><label class="lab">ou endereço (URL) de um .sty<input id="pkUrl" placeholder="https://raw.githubusercontent.com/…/pacote.sty"></label><button type="button" class="btn" id="pkFetch" style="flex:none;align-self:end">Baixar</button></div>'+
    '<div class="btns"><label class="btn">Abrir arquivo(s) .sty/.tex<input type="file" id="pkFile" accept=".sty,.tex,text/plain" multiple hidden></label><span style="flex:1"></span><button type="button" class="btn primary" id="pkAdd">Importar</button></div>'+
    '<p class="hint">As equações (MathJax) usam as definições compatíveis: <code>\\newcommand</code>, <code>\\def</code>, <code>\\DeclareMathOperator</code>, <code>\\newenvironment</code>, <code>\\let</code>. Código interno (com <code>@</code>, condicionais, pgf) vale nos diagramas TikZ e na exportação Beamer. Pacotes chamados por <code>\\RequirePackage</code> que existem como extensão pronta são ativados sozinhos.</p>',
    {wide:true,mount:b=>{
      const rl=()=>{b.querySelector('#pkList').innerHTML=list()};
      b.querySelectorAll('[data-bi]').forEach(c=>c.onchange=()=>{const k=c.dataset.bi;deck.packages=deck.packages.filter(x=>x!==k);if(c.checked)deck.packages.push(k);pkgAfterChange()});
      b.querySelector('#pkList').addEventListener('click',ev=>{const t=ev.target.closest('[data-pk]'),row=ev.target.closest('[data-pid]');if(!t||!row)return;const p=deck.texPkgs.find(x=>x.id===row.dataset.pid);if(!p)return;
        if(t.dataset.pk==='del'){deck.texPkgs=deck.texPkgs.filter(x=>x!==p);deck.slides.forEach(s=>s.els.forEach(e=>{if(e.pkgs)e.pkgs=e.pkgs.filter(x=>x!==p.id)}));pkgAfterChange();rl();toast('Pacote '+p.name+' removido.')}
        else if(t.dataset.pk==='view'){b.querySelector('#pkName').value=p.name;b.querySelector('#pkLibs').value=p.libs||'';b.querySelector('#pkCode').value=p.code;b.querySelector('#pkCode').focus()}});
      b.querySelector('#pkList').addEventListener('change',ev=>{const t=ev.target,row=t.closest('[data-pid]');if(!row)return;const p=deck.texPkgs.find(x=>x.id===row.dataset.pid);if(!p)return;p[t.dataset.pk]=t.checked;pkgAfterChange();
        if(t.dataset.pk==='tikzAll')toast(t.checked?'Recompile os diagramas para usar '+p.name+'.':'Pacote desligado nos diagramas.')});
      b.querySelector('#pkFile').onchange=async ev=>{const r=await readPkgFiles(Array.from(ev.target.files||[]));if(!r)return;b.querySelector('#pkName').value=r.name;b.querySelector('#pkCode').value=r.code;toast('Arquivo carregado. Confira e clique em Importar.')};
      b.querySelector('#pkFetch').onclick=async()=>{const u=b.querySelector('#pkUrl').value;if(!u.trim())return;
        try{const r=await fetch(pkgUrl(u));if(!r.ok)throw new Error('HTTP '+r.status);b.querySelector('#pkCode').value=await r.text();if(!b.querySelector('#pkName').value)b.querySelector('#pkName').value=pkgIdFrom(u.split('/').pop());toast('Baixado. Confira e clique em Importar.')}
        catch(er){toast(standalone?'Não consegui baixar ('+er.message+'). O servidor precisa permitir acesso (CORS); links raw.githubusercontent.com e cdn.jsdelivr.net funcionam.':'Aqui no Claude o navegador bloqueia downloads externos. Use a versão publicada ou cole o código.')}};
      b.querySelector('#pkAdd').onclick=()=>{const name=b.querySelector('#pkName').value.trim(),code=b.querySelector('#pkCode').value;
        if(!name||!code.trim()){toast('Dê um nome e cole o código (ou abra um arquivo).');return}
        const r=addPkg(name,code,{libs:b.querySelector('#pkLibs').value.trim()});pkgAfterChange();rl();b.querySelectorAll('[data-bi]').forEach(c=>c.checked=deck.packages.includes(c.dataset.bi));
        b.querySelector('#pkCode').value='';b.querySelector('#pkName').value='';b.querySelector('#pkLibs').value='';
        toast('Pacote '+r.p.name+' importado: '+r.p.mathN+' comando(s) para equações'+(r.auto.length?'; ativei '+r.auto.join(', '):'')+'.')};
    }});
}
