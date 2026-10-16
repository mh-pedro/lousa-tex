/* ================= side panel ================= */
const SIDE_TITLES={theme:'Tema',format:'Opções de formato',anim:'Animação e transição',keys:'Atalhos de teclado',comments:'Comentários',find:'Localizar e substituir',help:'Guia rápido'};
function openSide(mode,force){if(!force&&sideMode===mode&&!side.hidden){closeSide();return}sideMode=mode;side.hidden=false;renderSide();fit();setAnimBadges();
  if(mode==='find')setTimeout(()=>{const q=$('#fQ');if(q){q.focus();q.select()}},30)}
function closeSide(){sideMode=null;side.hidden=true;fit();setAnimBadges()}
$('#sideClose').onclick=closeSide;
function renderSide(){
  if(!sideMode||side.hidden)return;
  $('#sideTitle').textContent=SIDE_TITLES[sideMode];
  const f={theme:themePanel,format:formatPanel,anim:animPanel,keys:keysPanel,comments:commentsPanel,find:findPanel,help:helpPanel}[sideMode];
  const keep=sideBody.scrollTop,ae=document.activeElement,aid=ae&&sideBody.contains(ae)?ae.id:null;
  sideBody.innerHTML=f();sideBody.scrollTop=keep;
  if(aid){const n=document.getElementById(aid);if(n)n.focus()}
  if(sideMode==='theme')updatePreStatus();
  if(sideMode==='find')renderFindResults();
}
/* small builders */
const fNum=(p,l,v,ex)=>'<label class="lab">'+l+'<input type="number" data-p="'+p+'" data-t="num" value="'+(Math.round((v||0)*100)/100)+'"'+(ex||'')+'></label>';
const fRange=(p,l,v,min,max,step)=>'<label class="lab">'+l+'<input type="range" min="'+min+'" max="'+max+'" step="'+step+'" data-p="'+p+'" data-t="num" value="'+v+'"></label>';
const fCheck=(p,l,v)=>'<label class="chk"><input type="checkbox" data-p="'+p+'"'+(v?' checked':'')+'> '+l+'</label>';
const fSel=(p,l,opts,v,t)=>'<label class="lab">'+l+'<select data-p="'+p+'"'+(t?' data-t="'+t+'"':'')+'>'+opts.map(o=>'<option value="'+o[0]+'"'+(String(o[0])===String(v)?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>';
const fColor=(p,l,v,none)=>'<label class="lab" style="flex:none">'+l+'<span class="colorrow"><input type="color" data-p="'+p+'" value="'+toHex(resolveColor(v||'fg'))+'">'+(none?'<button type="button" class="btn small" data-act="none" data-k="'+p+'">'+none+'</button>':'')+'</span></label>';
const DASHES=[['solid','Contínua'],['dash','Tracejada'],['dot','Pontilhada'],['dashdot','Traço e ponto']];
function themePanel(){
  const t=deck.theme;
  const cards=Object.keys(THEMES).map(k=>{const p=THEMES[k];const on=p.bg===t.bg&&p.accent===t.accent&&p.titleFont===t.titleFont;
    return '<button type="button" class="tcard'+(on?' on':'')+'" data-act="preset" data-k="'+k+'"><div class="tp" style="background:'+p.bg+';color:'+p.fg+'"><b style="font-family:'+FONTS[p.titleFont].replace(/"/g,"'")+';color:'+p.title+'">Aa</b><i style="background:'+p.accent+'"></i><small style="font-family:'+FONTS[p.bodyFont].replace(/"/g,"'")+'">Texto do corpo</small></div><div class="tn">'+p.name+'</div></button>'}).join('');
  const col=(k,l)=>'<label class="lab">'+l+'<input type="color" data-th="'+k+'" value="'+t[k]+'"></label>';
  const fsel=(k,l)=>'<label class="lab">'+l+'<select data-th="'+k+'">'+Object.keys(FONTS).filter(f=>f!=='IBM Plex Mono').map(f=>'<option'+(f===t[k]?' selected':'')+'>'+f+'</option>').join('')+'</select></label>';
  return '<div class="sec"><div class="ih">Temas</div><div class="themes">'+cards+'</div></div>'+
    '<div class="sec"><div class="ih">Cores</div><div class="g4">'+col('bg','Fundo')+col('fg','Texto')+col('title','Títulos')+col('accent','Destaque')+'</div></div>'+
    '<div class="sec"><div class="ih">Fontes</div><div class="g2">'+fsel('titleFont','Títulos')+fsel('bodyFont','Corpo')+'</div><p class="hint">As fórmulas usam a fonte Computer Modern do LaTeX; STIX Two Text é a que mais combina com ela.</p></div>'+
    '<div class="sec"><div class="ih">Imagem de fundo do tema</div><div class="btns"><button type="button" class="btn small" data-act="themeBg">'+(t.bgImage?'Trocar imagem…':'Escolher imagem…')+'</button>'+(t.bgImage?'<button type="button" class="btn small" data-act="themeBgOff">Remover</button>':'')+'</div>'+
    (t.bgImage?'<label class="lab">Ajuste<select data-th="bgFit"><option value="cover"'+(t.bgFit==='cover'?' selected':'')+'>Preencher</option><option value="contain"'+(t.bgFit==='contain'?' selected':'')+'>Mostrar inteira</option><option value="stretch"'+(t.bgFit==='stretch'?' selected':'')+'>Esticar</option></select></label>':'')+'</div>'+
    '<div class="sec"><div class="ih">Slides</div><label class="chk"><input type="checkbox" data-th="showNumbers"'+(t.showNumbers?' checked':'')+'> Numerar slides (a partir do segundo)</label>'+
    '<label class="chk"><input type="checkbox" data-th="progress" data-on="bar"'+(t.progress==='bar'?' checked':'')+'> Barra de progresso no rodapé</label>'+
    '<label class="chk"><input type="checkbox" data-th="refFooter"'+(t.refFooter?' checked':'')+'> Referências citadas no rodapé do slide</label>'+
    '<label class="chk"><input type="checkbox" data-th="eqAuto"'+(t.eqAuto?' checked':'')+'> Numerar todas as equações destacadas $$…$$</label>'+
    '<div class="btns"><button type="button" class="btn small" data-act="bgAll">Usar o fundo do tema em todos</button><button type="button" class="btn small" data-act="master">Editar mestre</button><button type="button" class="btn small" data-act="size">Tamanho da página…</button></div></div>'+
    '<div class="sec"><div class="ih">Pacotes LaTeX extras</div><p class="hint">Já ativos sempre: amsmath, amssymb, braket, cancel, mhchem, color, bbox. Marque para usar também:</p>'+
    Object.keys(TEXPKG).map(k=>'<label class="chk" title="'+esc(TEXPKG[k][1])+'"><input type="checkbox" data-pkg="'+k+'"'+((deck.packages||[]).includes(k)?' checked':'')+'> <code>'+k+'</code> <span class="hint" style="margin-left:2px">'+esc(TEXPKG[k][1].split(':')[0])+'</span></label>').join('')+
    '<p class="hint">Desmarcar um pacote só tem efeito depois de recarregar a página.</p><div class="btns"><button type="button" class="btn small" data-act="pkgMgr">Importar pacotes (.sty, URL ou código)…</button></div></div>'+
    '<div class="sec"><div class="ih">Preâmbulo LaTeX</div><textarea id="pre" class="mono" rows="7" spellcheck="false" aria-label="Preâmbulo LaTeX">'+esc(deck.preamble)+'</textarea><p class="hint" id="preStatus"></p>'+
    '<p class="hint">Use <code>\\newcommand</code> para criar macros válidas em toda a apresentação. Já disponíveis: <code>amsmath</code>, <code>amssymb</code>, <code>braket</code>, <code>cancel</code> e <code>mhchem</code>.</p></div>';
}
function slideSection(){
  if(masterMode)return '<div class="sec"><div class="ih">Mestre</div><p class="hint">Os elementos do mestre aparecem atrás do conteúdo de todos os slides.</p>'+fColor('slideBg','Fundo do mestre',deck.master.bg||deck.theme.bg)+'</div>';
  const s=deck.slides[cur];
  return '<div class="sec"><div class="ih">Slide '+(cur+1)+'</div><div class="row">'+fColor('slideBg','Fundo',s.bg||deck.theme.bg,'Tema')+'</div>'+
    '<div class="btns"><button type="button" class="btn small" data-act="slideBgImg">'+(s.bgImage?'Trocar imagem de fundo…':'Imagem de fundo…')+'</button>'+(s.bgImage?'<button type="button" class="btn small" data-act="slideBgReset">Remover imagem</button>':'')+'</div>'+
    (s.bgImage?'<label class="lab">Ajuste da imagem<select data-sl="bgFit"><option value="cover"'+(s.bgFit==='cover'?' selected':'')+'>Preencher</option><option value="contain"'+(s.bgFit==='contain'?' selected':'')+'>Mostrar inteira</option><option value="stretch"'+(s.bgFit==='stretch'?' selected':'')+'>Esticar</option></select></label>':'')+
    '<label class="chk"><input type="checkbox" data-sl="skip"'+(s.skip?' checked':'')+'> Ignorar este slide na apresentação</label>'+
    '<label class="chk"><input type="checkbox" data-sl="hideMaster"'+(s.hideMaster?' checked':'')+'> Ocultar os elementos do mestre</label></div>';
}
function formatPanel(){
  const els=selEls();if(!els.length)return slideSection()+'<p class="hint">Selecione um elemento no slide para ver as opções dele.</p>';
  const e=els[0];let h='';
  if(els.length>1)h+='<p class="hint">'+els.length+' elementos selecionados. As mudanças valem para todos os compatíveis.</p>';
  if(e.type==='line'){
    const nm=a=>{if(!a)return null;const t=byId(a.id);return t?(t.type==='box'?(textOf(t.html).trim().slice(0,20)||SHAPES[t.shape]):t.type==='image'?'Imagem':t.type==='table'?'Tabela':'Elemento'):null};
    h+='<div class="sec"><div class="ih">Pontas</div><div class="g4">'+fNum('x1','X₁',e.x1)+fNum('y1','Y₁',e.y1)+fNum('x2','X₂',e.x2)+fNum('y2','Y₂',e.y2)+'</div>'+
      ((e.a1||e.a2)?'<p class="hint">Conectada'+(e.a1?' de <b>'+esc(nm(e.a1)||'?')+'</b>':'')+(e.a2?' a <b>'+esc(nm(e.a2)||'?')+'</b>':'')+'. Arraste uma ponta para longe para soltar.</p><div class="btns"><button type="button" class="btn small" data-act="detach">Desconectar</button></div>'
      :'<p class="hint">Arraste uma ponta até a borda de uma forma para conectá-las. Alt arrastando evita a conexão.</p>')+'</div>'+
      '<div class="sec"><div class="ih">Linha</div><div class="row">'+fColor('stroke','Cor',e.stroke)+fNum('strokeW','Espessura',e.strokeW,' min="1" max="40"')+'</div>'+
      fSel('dash','Tracejado',DASHES,e.dash)+fSel('route','Tipo',Object.entries(ROUTES),e.route)+fSel('cap','Terminação do traço',[['round','Arredondada'],['butt','Reta'],['square','Quadrada']],e.cap)+
      '<div class="g2">'+fSel('startCap','Início',Object.entries(CAPS),e.startCap)+fSel('endCap','Fim',Object.entries(CAPS),e.endCap)+'</div>'+
      fRange('opacity','Opacidade',e.opacity,.05,1,.05)+fCheck('shadow','Sombra',e.shadow)+fCheck('locked','Bloquear posição',e.locked)+'</div>';
    return h+linkSection(e);
  }
  h+='<div class="sec"><div class="ih">Tamanho e posição (px)</div><div class="g4">'+fNum('w','Largura',e.w)+(e.type==='table'?'':fNum('h','Altura',e.h))+fNum('x','X',e.x)+fNum('y','Y',e.y)+'</div>'+
    '<div class="row">'+fNum('rot','Rotação (°)',e.rot||0,' min="-180" max="180"')+'<div class="btns" style="flex:none"><button type="button" class="btn small" data-act="rotL" title="Girar 90° no sentido anti-horário">↺</button><button type="button" class="btn small" data-act="rotR" title="Girar 90° no sentido horário">↻</button>'+
    (e.type==='box'||e.type==='image'?'<button type="button" class="btn small" data-act="flipH" title="Virar horizontalmente">⇋</button><button type="button" class="btn small" data-act="flipV" title="Virar verticalmente">⇵</button>':'')+'</div></div>'+
    fRange('opacity','Opacidade do elemento',e.opacity==null?1:e.opacity,.05,1,.05)+fCheck('locked','Bloquear posição e tamanho',e.locked)+'</div>';
  if(e.type==='box'){
    h+='<div class="sec"><div class="ih">Texto</div><div class="g2">'+fNum('size','Tamanho base',e.size,' min="6" max="400"')+fNum('pad','Margem interna',e.pad,' min="0" max="200"')+'</div>'+
      '<div class="g2">'+fSel('lh','Entre linhas',[[1,'1'],[1.15,'1,15'],[1.25,'1,25'],[1.5,'1,5'],[2,'2']],e.lh,'num')+fSel('ps','Entre parágrafos',[[0,'0'],[.3,'0,3 em'],[.6,'0,6 em'],[1,'1 em']],e.ps||0,'num')+'</div>'+
      '<div class="g2">'+fSel('valign','Alinhamento vertical',[['top','Em cima'],['middle','No meio'],['bottom','Embaixo']],e.valign)+fSel('dir','Direção',[['ltr','Esquerda → direita'],['rtl','Direita → esquerda']],e.dir)+'</div>'+
      fSel('fit','Ajuste automático',[['none','Não ajustar'],['shrink','Reduzir o texto ao transbordar'],['grow','Redimensionar a forma para caber o texto']],e.fit)+
      '<div class="row">'+fColor('outline','Contorno do texto',e.outline||'title')+fRange('outlineW','Espessura do contorno',e.outlineW||0,0,6,.5)+'</div>'+fCheck('textShadow','Sombra no texto',e.textShadow)+'</div>';
    h+='<div class="sec"><div class="ih">Forma</div>'+fSel('shape','Tipo',Object.keys(SHAPES).map(k=>[k,SHAPES[k]]),e.shape)+
      '<div class="row">'+fColor('fill','Preenchimento',e.fill||'accent','Nenhum')+fRange('fillOpacity','Opacidade',e.fillOpacity,0,1,.02)+'</div>'+
      '<div class="row">'+fColor('stroke','Borda',e.stroke||'fg','Nenhuma')+fRange('strokeW','Espessura',e.strokeW,0,16,1)+'</div>'+
      '<div class="g2">'+fSel('dash','Tracejado',DASHES,e.dash)+fSel('join','Cantos da borda',[['round','Arredondados'],['miter','Vivos'],['bevel','Chanfrados']],e.join||'round')+'</div>'+
      ((e.shape==='rect'||e.shape==='text'||e.shape==='round')?fRange('radius','Cantos arredondados',e.radius||0,0,160,1):'')+fCheck('shadow','Sombra',e.shadow)+'</div>';
  }
  if(e.type==='image'){
    h+='<div class="sec"><div class="ih">Imagem</div><div class="btns"><button type="button" class="btn small" data-act="crop">Cortar</button><button type="button" class="btn small" data-act="resetImg">Redefinir</button><button type="button" class="btn small" data-act="replaceImg">Substituir…</button></div>'+
      fSel('mask','Máscara',[['','Nenhuma']].concat(['ellipse','round','triangle','diamond','hexagon','star','heart','pentagon'].map(k=>[k,SHAPES[k]])),e.mask||'')+
      fRange('bright','Brilho',e.bright||0,-80,80,5)+fRange('contrast','Contraste',e.contrast||0,-80,80,5)+fCheck('gray','Escala de cinza',e.gray)+
      fRange('radius','Cantos arredondados',e.radius||0,0,300,1)+'<div class="row">'+fColor('stroke','Borda',e.stroke||'fg')+fRange('strokeW','Espessura',e.strokeW,0,16,1)+'</div>'+
      fCheck('shadow','Sombra',e.shadow)+fCheck('reflect','Reflexo (Chrome e Edge)',e.reflect)+
      '<label class="lab">Texto alternativo (para leitores de tela)<textarea rows="2" data-p="alt">'+esc(e.alt||'')+'</textarea></label></div>';
  }
  if(e.type==='table'){
    h+='<div class="sec"><div class="ih">Tabela</div><div class="g2">'+fNum('size','Tamanho do texto',e.size,' min="6" max="200"')+fNum('pad','Margem das células',e.pad,' min="0" max="60"')+'</div>'+
      '<div class="row">'+fColor('borderColor','Bordas',e.borderColor||'muted')+fRange('borderW','Espessura',e.borderW,0,6,1)+'</div>'+
      '<div class="row">'+fColor('headerFill','Cabeçalho',e.headerFill||'accent')+'</div>'+fCheck('header','Primeira linha como cabeçalho',e.header)+fCheck('band','Linhas alternadas',e.band)+
      '<div class="btns"><button type="button" class="btn small" data-act="tbOps">Linhas, colunas e mesclagem…</button></div></div>';
    const cs=selectedCells(e);if(cellSel&&cs.length){const c0=e.cells[cs[0][0]][cs[0][1]];
      h+='<div class="sec"><div class="ih">'+(cs.length>1?cs.length+' células selecionadas':'Célula selecionada')+'</div><div class="row"><label class="lab" style="flex:none">Preenchimento<span class="colorrow"><input type="color" data-cp="fill" value="'+toHex(resolveColor(c0.fill||'bg'))+'"><button type="button" class="btn small" data-act="cellNoFill">Nenhum</button></span></label></div>'+
        '<div class="g2"><label class="lab">Horizontal<select data-cp="align">'+[['left','Esquerda'],['center','Centro'],['right','Direita'],['justify','Justificado']].map(o=>'<option value="'+o[0]+'"'+(c0.align===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>'+
        '<label class="lab">Vertical<select data-cp="valign">'+[['top','Em cima'],['middle','No meio'],['bottom','Embaixo']].map(o=>'<option value="'+o[0]+'"'+(c0.valign===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label></div></div>'}
  }
  if(e.type==='tikz')h+=tikzPanel(e);
  if(e.type==='ink'){
    h+='<div class="sec"><div class="ih">Desenho</div><div class="row"><label class="lab" style="flex:none">Cor dos traços<input type="color" data-ink="color" value="'+toHex(resolveColor((e.strokes[0]||{}).c||'fg'))+'"></label>'+
      '<label class="lab">Espessura<input type="range" min="0.25" max="4" step="0.25" data-ink="w" value="1"></label></div>'+fCheck('shadow','Sombra',e.shadow)+'</div>';
  }
  if(e.type==='chart'){
    h+='<div class="sec"><div class="ih">Gráfico</div>'+fSel('kind','Tipo',Object.entries(CHART_KINDS),e.kind)+
      '<label class="lab">Título<input data-p="title" value="'+esc(e.title)+'"></label><div class="g2"><label class="lab">Título do eixo X<input data-p="xTitle" value="'+esc(e.xTitle)+'"></label><label class="lab">Título do eixo Y<input data-p="yTitle" value="'+esc(e.yTitle)+'"></label></div>'+
      '<p class="hint">Títulos e legendas aceitam LaTeX entre $…$.</p><div class="g2">'+fNum('size','Tamanho do texto',e.size,' min="8" max="60"')+'</div>'+fCheck('legend','Legenda',e.legend)+fCheck('grid','Linhas de grade',e.grid)+
      (e.kind==='fn'?fCheck('logX','Eixo X logarítmico',e.logX):'')+fCheck('logY',e.kind==='fn'?'Eixo Y logarítmico':'Escala logarítmica (linhas e dispersão)',e.logY)+'</div>'+
      (e.kind==='fn'?'<div class="sec"><div class="ih">Funções</div><textarea class="mono" rows="5" data-p="fns" spellcheck="false" aria-label="Funções">'+esc(e.fns||'')+'</textarea>'+
        '<p class="hint">Uma função de <code>x</code> por linha. Depois de <code>|</code>, a legenda (aceita LaTeX). Ex.: <code>exp(-x^2/2)/sqrt(2pi) | $\\mathcal{N}(0,1)$</code>. Funções: sin, cos, tan, exp, ln, log10, sqrt, abs, sinh, cosh, tanh, erf, gamma, sinc, H (degrau); constantes pi e e.</p>'+
        '<div class="g4"><label class="lab">x mín.<input data-p="xMin" value="'+esc(e.xMin)+'"></label><label class="lab">x máx.<input data-p="xMax" value="'+esc(e.xMax)+'"></label><label class="lab">y mín.<input data-p="yMin" value="'+esc(e.yMin)+'" placeholder="auto"></label><label class="lab">y máx.<input data-p="yMax" value="'+esc(e.yMax)+'" placeholder="auto"></label></div>'+
        fNum('samples','Pontos por curva',e.samples,' min="20" max="4000"')+'</div>'
      :'<div class="sec"><div class="ih">Dados</div><textarea class="mono" rows="9" data-p="data" spellcheck="false" aria-label="Dados do gráfico">'+esc(e.data)+'</textarea>'+
      '<p class="hint">Primeira linha: nomes das séries (aceitam LaTeX). Primeira coluna: categorias (ou valores de X). Separe por tabulação, ponto e vírgula ou vírgula. Dá para colar direto do Planilhas ou do Excel.</p></div>');
  }
  if(e.type==='media'){
    h+='<div class="sec"><div class="ih">'+(e.kind==='youtube'?'Vídeo do YouTube':e.kind==='audio'?'Áudio':'Vídeo')+'</div>'+(e.src&&!e.url?'<p class="hint">Arquivo do computador'+(e.src.indexOf('blob:')===0?' (só nesta sessão)':'')+'.</p>':'<label class="lab">Endereço<input data-p="url" value="'+esc(e.url)+'"></label>')+
      '<label class="lab">Rótulo no editor<input data-p="title" value="'+esc(e.title)+'"></label><div class="g2">'+fNum('start','Começar em (s)',e.start,' min="0"')+fNum('end','Terminar em (s, 0 = fim)',e.end,' min="0"')+'</div>'+
      fCheck('autoplay','Tocar automaticamente ao mostrar o slide',e.autoplay)+fCheck('muted','Sem som',e.muted)+fCheck('loop','Repetir',e.loop)+'</div>';
  }
  return h+linkSection(e);
}
function linkSection(e){
  let txt='Nenhum';if(e.link){if(e.link.slide){const i=deck.slides.findIndex(s=>s.id===e.link.slide);txt=i>=0?'Slide '+(i+1)+': '+esc(slideTitle(deck.slides[i]).slice(0,30)):'Slide removido'}else txt=esc(e.link.url)}
  return '<div class="sec"><div class="ih">Link do elemento</div><p class="hint">'+txt+'</p><div class="btns"><button type="button" class="btn small" data-act="editLink">'+(e.link?'Editar link':'Adicionar link')+'</button>'+(e.link?'<button type="button" class="btn small" data-act="rmLink">Remover link</button>':'')+'</div></div>';
}
function syncFormat(){if(sideMode!=='format'||side.hidden)return;const e=selEls()[0];if(!e)return;
  sideBody.querySelectorAll('input[data-p][data-t="num"][type="number"]').forEach(inp=>{if(document.activeElement===inp)return;const v=e[inp.dataset.p];if(v!=null)inp.value=Math.round(v*100)/100})}
function animName(e){if(e.type==='image')return 'Imagem';if(e.type==='ink')return 'Desenho';if(e.type==='line')return e.endCap!=='none'||e.startCap!=='none'?'Seta':'Linha';if(e.type==='table')return 'Tabela';if(e.type==='chart')return 'Gráfico: '+(e.title||CHART_KINDS[e.kind]);if(e.type==='media')return mediaLabel(e);
  const t=textOf(e.html).trim();return t?(t.length>34?t.slice(0,34)+'…':t):(e.role?({title:'Título',subtitle:'Subtítulo',body:'Corpo',body2:'Corpo',eq:'Equação'}[e.role]):SHAPES[e.shape])}
function animPanel(){
  if(masterMode)return '<p class="hint">Animações e transições não se aplicam ao mestre. Feche o mestre para animar os slides.</p>';
  const list=animOrder(slide()),s=deck.slides[cur];
  let h='<div class="sec"><div class="ih">Animações do slide '+(cur+1)+'</div>';
  h+=list.length?list.map((e,k)=>{const a=e.anim;
    return '<div class="card'+(selIds.includes(e.id)?' on':'')+'" data-id="'+e.id+'"><div class="anhead"><span class="n">'+(k+1)+'</span><span class="nm" data-act="anSel" title="Selecionar no slide">'+esc(animName(e))+'</span>'+
      '<span class="btns" style="gap:4px"><button type="button" class="icobtn" data-act="anUp" aria-label="Antes">↑</button><button type="button" class="icobtn" data-act="anDown" aria-label="Depois">↓</button><button type="button" class="icobtn" data-act="anDel" aria-label="Remover animação">✕</button></span></div>'+
      '<div class="g2"><label class="lab">Tipo<select data-an="kind">'+Object.keys(KINDS).map(x=>'<option value="'+x+'"'+(a.kind===x?' selected':'')+'>'+KINDS[x]+'</option>').join('')+'</select></label>'+
      '<label class="lab">Efeito<select data-an="fx">'+Object.keys(EFFECTS[a.kind]).map(x=>'<option value="'+x+'"'+(a.fx===x?' selected':'')+'>'+EFFECTS[a.kind][x]+'</option>').join('')+'</select></label>'+
      '<label class="lab">Início<select data-an="start">'+Object.keys(STARTS).map(x=>'<option value="'+x+'"'+(a.start===x?' selected':'')+'>'+STARTS[x]+'</option>').join('')+'</select></label>'+
      '<label class="lab">Duração (s)<input type="number" step="0.1" min="0.1" max="10" data-an="dur" value="'+a.dur+'"></label>'+
      '<label class="lab">Atraso (s)<input type="number" step="0.1" min="0" max="30" data-an="delay" value="'+a.delay+'"></label></div>'+
      (e.type==='box'&&a.kind!=='emph'?'<label class="chk"><input type="checkbox" data-an="byPara"'+(a.byPara?' checked':'')+'> Por parágrafo (um tópico por clique)</label>':'')+'</div>'}).join('')
    :'<p class="hint">Nenhuma animação neste slide. Selecione um elemento e clique em Animar seleção.</p>';
  const can=selEls().some(e=>!e.anim);
  h+='<div class="btns"><button type="button" class="btn'+(can?' primary':'')+'" data-act="anAdd"'+(can?'':' disabled')+'>Animar seleção</button><button type="button" class="btn" data-act="anPlay">Ver no modo apresentação</button></div>';
  h+='<p class="hint">Cada "Ao clicar" espera um clique, seta → ou espaço. "Com a anterior" e "Após a anterior" encadeiam efeitos sem clique. "Por parágrafo" funciona como o <code>\\pause</code> do Beamer.</p></div>';
  h+='<div class="sec"><div class="ih">Transição '+(slideSel.size>1?'dos '+slideSel.size+' slides selecionados':'do slide '+(cur+1))+'</div>'+
    '<div class="g2"><label class="lab">Efeito<select data-sl="transition"><option value="">Usar a do tema ('+TRANSITIONS[deck.theme.transition]+')</option>'+Object.keys(TRANSITIONS).map(k=>'<option value="'+k+'"'+(s.transition===k?' selected':'')+'>'+TRANSITIONS[k]+'</option>').join('')+'</select></label>'+
    '<label class="lab">Duração (s)<input type="number" step="0.1" min="0.1" max="5" data-sl="transDur" value="'+(s.transDur||deck.theme.transDur||.5)+'"></label></div>'+
    '<div class="btns"><button type="button" class="btn small" data-act="transAll">Aplicar a todos os slides</button></div></div>';
  return h;
}
const INKW=new WeakMap();
const commentsFilter={slide:true,res:false};
function commentsPanel(){
  const ctx=commentDraftFor?(commentDraftFor.elId&&byId(commentDraftFor.elId)?'No elemento "'+esc(animName(byId(commentDraftFor.elId)))+'"':'No slide '+(deck.slides.findIndex(s=>s.id===commentDraftFor.slideId)+1)):'No slide '+(cur+1)+(selEls()[0]?', elemento selecionado':'');
  let h='<div class="sec"><div class="ih">Novo comentário</div><p class="hint">'+ctx+'</p><textarea id="cmtNew" rows="3" placeholder="Escreva um comentário ou lembrete" aria-label="Novo comentário"></textarea><div class="btns"><button type="button" class="btn primary" data-act="cAdd">Comentar</button></div></div>';
  h+='<div class="sec"><div class="row" style="gap:14px"><label class="chk"><input type="checkbox" data-cf="slide"'+(commentsFilter.slide?' checked':'')+'> Só deste slide</label><label class="chk"><input type="checkbox" data-cf="res"'+(commentsFilter.res?' checked':'')+'> Mostrar resolvidos</label></div>';
  const list=deck.comments.filter(c=>(!commentsFilter.slide||c.slideId===slide().id)&&(commentsFilter.res||!c.resolved)).slice().sort((a,b)=>b.time-a.time);
  h+=list.length?list.map(c=>{const si=deck.slides.findIndex(s=>s.id===c.slideId),el=c.elId&&deck.slides[si]&&deck.slides[si].els.find(x=>x.id===c.elId);
    return '<div class="card'+(c.resolved?' dim':'')+'" data-cid="'+c.id+'"><div class="meta"><span>Slide '+(si+1)+(el?' · '+esc(animName(el)):'')+'</span><span>'+fmtDate(c.time)+'</span></div><div class="ctext">'+esc(c.text)+'</div>'+
      (c.replies||[]).map(r=>'<div class="creply"><div class="meta"><span>Resposta</span><span>'+fmtDate(r.time)+'</span></div><div class="ctext">'+esc(r.text)+'</div></div>').join('')+
      '<div class="btns"><button type="button" class="btn small" data-act="cGo">Ir para</button><button type="button" class="btn small" data-act="cReply">Responder</button><button type="button" class="btn small" data-act="cEdit">Editar</button><button type="button" class="btn small" data-act="cRes">'+(c.resolved?'Reabrir':'Resolver')+'</button><button type="button" class="btn small" data-act="cDel">Excluir</button></div></div>'}).join('')
    :'<p class="hint">Nenhum comentário'+(commentsFilter.slide?' neste slide':'')+'.</p>';
  return h+'</div>';
}
function findPanel(){
  return '<div class="sec"><label class="lab">Localizar<input id="fQ" value="'+esc(findState.q)+'" autocomplete="off"></label><label class="lab">Substituir por<input id="fR" value="'+esc(findState.r)+'" autocomplete="off"></label>'+
    '<div class="row" style="gap:14px"><label class="chk"><input type="checkbox" id="fCs"'+(findState.cs?' checked':'')+'> Diferenciar maiúsculas</label><label class="chk"><input type="checkbox" id="fNotes"'+(findState.notes?' checked':'')+'> Incluir anotações</label></div>'+
    '<div class="btns"><button type="button" class="btn" data-act="fOne">Substituir</button><button type="button" class="btn primary" data-act="fAll">Substituir tudo</button></div></div><div class="sec"><div class="ih" id="fCount"></div><div class="fres" id="fRes"></div></div>';
}
function renderFindResults(){
  const box=$('#fRes');if(!box)return;findState.results=findAll();const r=findState.results;$('#fCount').textContent=findState.q?(r.length?r.length+' resultado'+(r.length>1?'s':''):'Nenhum resultado'):'';
  box.innerHTML=r.slice(0,200).map((x,i)=>{const a=Math.max(0,x.at-28),pre=x.text.slice(a,x.at),hit=x.text.slice(x.at,x.at+x.len),post=x.text.slice(x.at+x.len,x.at+x.len+40);
    return '<div class="fr'+(i===findState.idx?' on':'')+'" data-i="'+i+'"><small>Slide '+(x.si+1)+(x.notes?' · anotações':x.cell?' · tabela':'')+'</small><span>'+(a>0?'…':'')+esc(pre)+'<mark>'+esc(hit)+'</mark>'+esc(post)+'</span></div>'}).join('');
}
function keysPanel(){
  const k=[['F5','Apresentar deste slide'],['Shift+F5','Apresentar do início'],[MOD+ALT+'P','Visualização do apresentador'],['Enter ou duplo clique','Editar o texto da caixa ou célula'],['Esc','Sair da edição, do corte ou da seleção'],
    [MOD+'Shift+M','Equação em linha'],[MOD+'K','Link'],[MOD+'B / I / U','Negrito, itálico, sublinhado'],[MOD+'. / ,','Sobrescrito, subscrito'],[MOD+'Shift+> / <','Aumentar ou diminuir fonte'],
    [MOD+'] / [','Aumentar ou diminuir recuo'],[MOD+'Shift+L / E / R / J','Alinhar texto'],[MOD+'Shift+7 / 8','Lista numerada ou com marcadores'],[MOD+'\\','Limpar formatação'],
    [MOD+'D','Duplicar'],[MOD+'M','Novo slide'],[MOD+'A','Selecionar tudo'],[MOD+ALT+'G','Agrupar'],[MOD+ALT+'Shift+G','Desagrupar'],[MOD+ALT+'C / V','Copiar e colar formatação'],
    [MOD+'H','Localizar e substituir'],[MOD+ALT+'M','Comentário'],[ALT+'/','Pesquisar nos menus'],[MOD+'O','Abrir'],[MOD+'S','Salvar ou baixar'],
    ['Setas','Mover 1 px (Shift: 10 px)'],[MOD+'↑ / ↓','Avançar ou recuar camada'],['Shift ao arrastar','Mover só na horizontal ou vertical; manter proporção'],['Alt ao arrastar','Desligar as guias e as conexões'],
    [MOD+'+ / −','Zoom'],[MOD+'0','Ajustar o slide à tela'],
    [MOD+' ao arrastar','Duplicar o que está sendo arrastado'],[MOD+' + clique','Somar ou tirar da seleção'],['Shift + clique','Somar à seleção'],[ALT+' ou '+MOD+' ao redimensionar','Redimensionar a partir do centro'],[ALT+' ao desenhar forma','Desenhar a partir do centro (Shift: quadrado ou círculo)'],['Shift ao girar','Girar de 15 em 15 graus'],
    ['Espaço + arrastar ou botão do meio','Mover a área de trabalho'],[MOD+' + roda do mouse','Zoom'],['Shift + roda do mouse','Rolar na horizontal'],
    ['Tab / Shift+Tab','Selecionar o próximo ou o anterior objeto'],[ALT+'← / →','Girar 15° (com Shift: 1°)'],[MOD+ALT+'K / J','Aumentar ou diminuir 10% (com Shift: 1%)'],[MOD+ALT+'B / W','Mais largo ou mais estreito'],[MOD+ALT+'I / Q','Mais alto ou mais baixo'],
    [MOD+'Shift+↑ / ↓','Trazer para frente ou enviar para trás'],[MOD+'G / Shift+G','Agrupar ou desagrupar'],['Shift+F10','Menu de contexto'],
    ['Home / End','Primeiro ou último slide'],[MOD+'↑ / ↓ sem seleção','Mover o slide'],[MOD+'D sem seleção','Duplicar o slide'],[MOD+ALT+'Shift+H','Histórico de versões'],['Tab na tabela','Próxima célula (cria linha no fim)'],
    ['Apresentando: número + Enter','Ir para o slide'],['Apresentando: B ou .','Tela preta'],['Apresentando: L','Ponteiro laser'],['Apresentando: M','Marcar onde clicar'],['Apresentando: D / H / T / X','Caneta, marca-texto, texto, borracha'],['Apresentando: Z','Ampliar uma região (clique de novo para voltar)'],[MOD+'Enter no código TikZ','Compilar o diagrama'],['Apresentando: N','Mostrar anotações'],['Apresentando: C','Legendas (se disponível)']];
  return '<dl class="keys">'+k.map(r=>'<dt><kbd>'+esc(r[0])+'</kbd></dt><dd>'+esc(r[1])+'</dd>').join('')+'</dl>';
}
function helpPanel(){
  const s=[['Escrever LaTeX','Clique duas vezes numa caixa e escreva. Use $…$ para fórmulas na linha e $$…$$ para equações destacadas. Enquanto você digita aparece uma prévia; ao sair da caixa, as fórmulas são renderizadas. Ambientes do AMS (aligned, pmatrix, cases) funcionam.'],
    ['Macros','Defina \\newcommand no preâmbulo (painel Tema). Elas valem em todos os slides, tabelas e gráficos.'],
    ['Tabelas','Clique na tabela para selecioná-la, clique de novo numa célula para escrever. Shift+clique ou arraste para selecionar várias células e mesclá-las. Cole dados do Planilhas e eles viram tabela.'],
    ['Conectores','Use Linha e conector. Arraste uma ponta até a borda de uma forma: ela gruda e acompanha a forma quando você a move.'],
    ['Animações','Selecione e clique em Animar. "Por parágrafo" revela os tópicos um a um. Ordem, início, duração e atraso ficam no painel de animação.'],
    ['Apresentar','F5 apresenta. Na visualização do apresentador você vê anotações, cronômetro e o próximo slide; a janela da plateia abre separada (na versão local).'],
    ['Diagramas TikZ','Inserir › Diagrama TikZ traz modelos (Feynman, pgfplots, tikz-cd). O LaTeX roda dentro do navegador: a primeira compilação baixa cerca de 6 MB. Pacotes que não vêm prontos podem ser adicionados colando o código em "Pacotes TikZ personalizados".'],
    ['Citações e equações','Inserir › Citação e referências busca no INSPIRE ou importa BibTeX. No texto, use \\cite{chave}, \\label{eq:x} dentro de $$…$$ e \\eqref{eq:x}: os números se ajustam sozinhos.'],
    ['Transformar (Morph)','Duplique um slide, mude posições, tamanhos ou o texto e escolha a transição "Transformar": os elementos correspondentes deslizam de um slide para o outro.'],
    ['Arquivos e versões','Tudo fica salvo neste navegador, com histórico de versões. Para levar a outro computador, baixe o arquivo .lousa.json ou copie o conteúdo. Também dá para exportar em LaTeX Beamer.']];
  return s.map(x=>'<div class="helpsec"><h3>'+x[0]+'</h3><p>'+esc(x[1])+'</p></div>').join('');
}
function animateSel(){if(masterMode)return;const s=slide();let n=Math.max(0,...s.els.filter(e=>e.anim).map(e=>e.anim.order||0));
  selEls().forEach(e=>{if(!e.anim)e.anim=anim({fx:'fade',byPara:e.type==='box'&&/<li/.test(e.html||''),order:++n})});setAnimBadges();commit();if(sideMode==='anim')renderSide()}
function renumberAnim(){animOrder(slide()).forEach((e,k)=>{e.anim.order=k+1})}
/* side panel events */
sideBody.addEventListener('input',ev=>{
  const t=ev.target;
  if(t.dataset.p){
    let v=t.type==='checkbox'?t.checked:(t.dataset.t==='num'?parseFloat(t.value):t.value);if(t.dataset.t==='num'&&!isFinite(v))return;const k=t.dataset.p;
    if(k==='slideBg'){if(masterMode)deck.master.bg=v;else slidesForBg().forEach(s=>{s.bg=v});stageNode.style.backgroundColor=v;thumbSoon();commitSoon();return}
    if(k==='mask'&&!v)v=null;
    if(k==='fill'&&propOf('fill')==null)setProp('fillOpacity',e0().type==='box'&&e0().shape==='text'?.25:1,['box']);
    if(k==='stroke'&&!(propOf('strokeW')>0)&&e0().type!=='line'){setProp('strokeW',2,['box','image']);const r=sideBody.querySelector('[data-p="strokeW"]');if(r)r.value=2}
    if(k==='outline'&&!(propOf('outlineW')>0)){setProp('outlineW',1,['box']);const r=sideBody.querySelector('[data-p="outlineW"]');if(r)r.value=1}
    if(k==='borderColor'&&!(propOf('borderW')>0))setProp('borderW',1,['table']);
    if((k==='x1'||k==='y1')&&e0().a1)e0().a1=null;if((k==='x2'||k==='y2')&&e0().a2)e0().a2=null;
    setProp(k,v,null);
    if(k==='locked'){markSel()}
    if(['shape','kind','mask','fit'].includes(k)||t.type==='checkbox'&&['header','band'].includes(k))renderSide();
    if(k==='url'||k==='title')selEls().forEach(e=>{if(e.type==='media')refreshEl(e)});
  }else if(t.dataset.cp){setCellProp(t.dataset.cp,t.value)}
  else if(t.dataset.ink){selEls().forEach(x=>{if(x.type!=='ink')return;if(t.dataset.ink==='color')x.strokes.forEach(s=>{s.c=t.value});else{if(!INKW.has(x))INKW.set(x,x.strokes.map(s=>s.w));const w0=INKW.get(x);x.strokes.forEach((s,i)=>{s.w=+(w0[i]*parseFloat(t.value)).toFixed(2)})}restyle(x)});commitSoon();thumbSoon()}
  else if(t.dataset.th){deck.theme[t.dataset.th]=t.type==='checkbox'?(t.dataset.on?(t.checked?t.dataset.on:'none'):t.checked):t.value;invalidatePlan();rerenderSoon();commitSoon()}
  else if(t.dataset.tk){const e=selEls()[0];if(!e||e.type!=='tikz')return;const k=t.dataset.tk;e[k]=t.type==='checkbox'?t.checked:t.value;if(k==='themeInk')restyle(e);commitSoon()}
  else if(t.dataset.tkpkg){const e=selEls()[0];if(!e||e.type!=='tikz')return;const n=t.dataset.tkpkg;e.pkgs=(e.pkgs||[]).filter(x=>x!==n);if(t.checked)e.pkgs.push(n);commitSoon()}
  else if(t.dataset.sl){const k=t.dataset.sl;let v=t.type==='checkbox'?t.checked:t.value;if(k==='transDur')v=clamp(parseFloat(v)||.5,.1,5);if(k==='transition'&&!v)v=null;
    deck.slides.filter(s=>slideSel.has(s.id)).forEach(s=>{s[k]=v});
    if(k==='skip'||k==='hideMaster'||k==='bgFit'){renderStage();rebuildThumbs()}commitSoon()}
  else if(t.id==='pre'){deck.preamble=t.value;preSoon();commitSoon()}
  else if(t.dataset.pkg){const k=t.dataset.pkg;deck.packages=(deck.packages||[]).filter(x=>x!==k);if(t.checked)deck.packages.push(k);applyPreamble().then(()=>rerenderAll());commit();if(t.checked)toast('Pacote '+k+' ativado. Exemplo: '+TEXPKG[k][2].replace(/\\\\/g,'\\'))}
  else if(t.dataset.an){const card=t.closest('[data-id]');const e=byId(card.dataset.id);if(!e||!e.anim)return;const k=t.dataset.an;let v=t.type==='checkbox'?t.checked:t.value;
    if(k==='dur'||k==='delay')v=Math.max(0,parseFloat(v)||0);e.anim[k]=v;if(k==='kind'){e.anim.fx=Object.keys(EFFECTS[v])[1];if(v==='emph')e.anim.byPara=false;renderSide()}commitSoon()}
  else if(t.dataset.cf){commentsFilter[t.dataset.cf]=t.checked;renderSide()}
  else if(t.id==='fQ'||t.id==='fR'||t.id==='fCs'||t.id==='fNotes'){findState.q=$('#fQ').value;findState.r=$('#fR').value;findState.cs=$('#fCs').checked;findState.notes=$('#fNotes').checked;findState.idx=-1;renderFindResults()}
});
const e0=()=>selEls()[0]||{};
sideBody.addEventListener('click',ev=>{
  const fr=ev.target.closest('.fr');if(fr){gotoResult(+fr.dataset.i);return}
  const b=ev.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;const card=b.closest('[data-id]');const re=card&&byId(card.dataset.id);
  const cc=b.closest('[data-cid]'),cm=cc&&deck.comments.find(c=>c.id===cc.dataset.cid);
  switch(a){
    case 'preset':{const p=THEMES[b.dataset.k];Object.assign(deck.theme,{bg:p.bg,fg:p.fg,title:p.title,accent:p.accent,titleFont:p.titleFont,bodyFont:p.bodyFont});rerenderAll();renderSide();renderToolbar();commit();break}
    case 'themeBg':pickBgImage('theme');break;case 'themeBgOff':deck.theme.bgImage=null;rerenderAll();renderSide();commit();break;
    case 'bgAll':deck.slides.forEach(s=>{s.bg=null;s.bgImage=null});rerenderAll();commit();toast('Todos os slides usam o fundo do tema.');break;
    case 'master':enterMaster();break;case 'size':sizeModal();break;
    case 'slideBgImg':pickBgImage('slide');break;case 'slideBgReset':resetSlideBg();renderSide();break;
    case 'none':{const k=b.dataset.k;if(k==='slideBg'){resetSlideBg();renderSide()}else if(k==='fill')setProp('fill',null,['box']);else if(k==='stroke'){setProp('strokeW',0,['box','image']);renderSide()}break}
    case 'detach':selEls().forEach(e=>{if(e.type==='line'){e.a1=null;e.a2=null;restyle(e)}});commit();renderSide();break;
    case 'rotL':rotateSel(-90);renderSide();break;case 'rotR':rotateSel(90);renderSide();break;case 'flipH':flipSel('h');break;case 'flipV':flipSel('v');break;
    case 'crop':enterCrop(selEls()[0]);break;case 'resetImg':resetImage(selEls()[0]);renderSide();break;case 'replaceImg':pickImage(selEls()[0]);break;
    case 'tkRun':compileTikzEl(selEls()[0]);break;case 'tkTpl':openMenu(Object.keys(TIKZ_TPL).map(k=>({label:TIKZ_TPL[k].name,act:()=>{const e=selEls()[0];if(!e||e.type!=='tikz')return;const tp=TIKZ_TPL[k];Object.assign(e,{code:tp.code,libs:tp.libs,pkgs:tp.pkgs.slice()});renderSide();compileTikzEl(e)}})),b);break;
    case 'tkPkgs':pkgModal();break;
    case 'pkgMgr':pkgModal();break;
    case 'tbOps':openMenu(tableItems(),b);break;case 'cellNoFill':setCellProp('fill',null);break;
    case 'editLink':linkPop(b);break;case 'rmLink':selEls().forEach(e=>{e.link=null});commit();renderSide();break;
    case 'anAdd':animateSel();break;case 'anPlay':startPres(cur);break;
    case 'anSel':if(re)select([re.id]);break;
    case 'anDel':if(re){re.anim=null;renumberAnim();setAnimBadges();commit();renderSide()}break;
    case 'anUp':case 'anDown':{const l=animOrder(slide()),i=l.indexOf(re),j=a==='anUp'?i-1:i+1;if(i<0||j<0||j>=l.length)break;const tmp=l[i];l[i]=l[j];l[j]=tmp;l.forEach((e,k)=>{e.anim.order=k+1});setAnimBadges();commit();renderSide();break}
    case 'transAll':{const s=deck.slides[cur];deck.theme.transition=s.transition||deck.theme.transition;deck.theme.transDur=s.transDur||deck.theme.transDur;deck.slides.forEach(x=>{x.transition=null;x.transDur=null});commit();renderSide();toast('Transição aplicada a todos os slides.');break}
    case 'cAdd':{const t=$('#cmtNew');addComment(t.value);break}
    case 'cGo':{const i=deck.slides.findIndex(s=>s.id===cm.slideId);if(i>=0){if(i!==cur||masterMode)goto(i);if(cm.elId&&byId(cm.elId))select([cm.elId])}break}
    case 'cReply':{if(cc.querySelector('.rbox'))break;const d=document.createElement('div');d.className='rbox';d.style.display='grid';d.style.gap='6px';d.innerHTML='<textarea rows="2" placeholder="Sua resposta" aria-label="Resposta"></textarea><div class="btns"><button type="button" class="btn small primary" data-act="cSend">Responder</button></div>';cc.appendChild(d);d.querySelector('textarea').focus();break}
    case 'cSend':{const t=cc.querySelector('.rbox textarea').value.trim();if(!t)break;cm.replies=cm.replies||[];cm.replies.push({id:uid(),text:t,time:Date.now()});commit();renderSide();break}
    case 'cEdit':{const t=cc.querySelector('.ctext');if(!t||cc.querySelector('.ebox'))break;const d=document.createElement('div');d.className='ebox';d.style.display='grid';d.style.gap='6px';
      d.innerHTML='<textarea rows="3" aria-label="Editar comentário"></textarea><div class="btns"><button type="button" class="btn small primary" data-act="cSave">Salvar</button></div>';d.querySelector('textarea').value=cm.text;t.replaceWith(d);d.querySelector('textarea').focus();break}
    case 'cSave':{const v=cc.querySelector('.ebox textarea').value.trim();if(v){cm.text=v;commit()}renderSide();break}
    case 'cRes':cm.resolved=!cm.resolved;commit();updateCommentCount();rebuildThumbsSoon();renderSide();break;
    case 'cDel':if(b.dataset.sure){deck.comments=deck.comments.filter(c=>c!==cm);commit();updateCommentCount();rebuildThumbsSoon();renderSide()}else{b.dataset.sure='1';b.textContent='Confirmar';b.classList.add('danger')}break;
    case 'fOne':replaceOne();break;case 'fAll':replaceAll();break;
  }
});
sideBody.addEventListener('keydown',ev=>{if(ev.target.id==='tkCode'&&ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();ev.stopPropagation();const e=selEls()[0];if(e&&e.type==='tikz'){e.code=ev.target.value;compileTikzEl(e)}return}if(ev.target.id==='cmtNew'&&ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();addComment(ev.target.value)}
  if(ev.target.id==='fQ'&&ev.key==='Enter'){ev.preventDefault();const n=findState.results.length;if(n)gotoResult((findState.idx+1)%n)}});
$('#cmtBtn').onclick=()=>openSide('comments');$('#histBtn').onclick=versionsModal;

/* ================= notes, dictation, prefs ================= */
const notesEl=$('#notes');
notesEl.addEventListener('input',()=>{if(masterMode)return;deck.slides[cur].notes=notesEl.value;commitSoon()});
let dict=null;
if(SR&&standalone)$('#dictBtn').hidden=false;
function toggleDictation(){
  if(dict){const d=dict;dict=null;try{d.stop()}catch(e){}$('#dictBtn').classList.remove('on');return}
  if(!SR){toast('Este navegador não oferece ditado por voz.');return}if(masterMode)return;
  const r=new SR();r.lang='pt-BR';r.continuous=true;r.interimResults=false;
  r.onresult=ev=>{for(let i=ev.resultIndex;i<ev.results.length;i++)if(ev.results[i].isFinal){const t=ev.results[i][0].transcript.trim();if(!t)continue;const n=deck.slides[cur];n.notes=(n.notes?n.notes.replace(/\s*$/,' '):'')+t;notesEl.value=n.notes;commitSoon()}};
  r.onerror=e=>{toast(e.error==='not-allowed'?'Sem permissão para usar o microfone aqui.':'Ditado interrompido.');if(dict===r){dict=null;$('#dictBtn').classList.remove('on')}};
  r.onend=()=>{if(dict===r){try{r.start()}catch(e){}}};
  try{r.start();dict=r;$('#dictBtn').classList.add('on');toast('Ditando nas anotações. Clique no microfone para parar.')}catch(e){toast('Não foi possível iniciar o ditado.')}
}
$('#dictBtn').onclick=toggleDictation;
function applyPrefsUI(){$('#rail').hidden=!prefs.showRail;$('#notesBar').hidden=!prefs.showNotes;stageArea.classList.toggle('rulers',!!prefs.showRulers);fit();drawRulers();drawGuides();drawGrid()}
const titleIn=$('#deckTitle');titleIn.addEventListener('input',()=>{deck.title=titleIn.value;commitSoon()});
$('#bPlay').onclick=()=>startPres(cur);
$('#bPlayMenu').onclick=ev=>openMenu([{label:'Apresentar deste slide',sc:'F5',act:()=>startPres(cur)},{label:'Apresentar do início',sc:'Shift+F5',act:()=>startPres(0)},{label:'Visualização do apresentador',sc:MOD+ALT+'P',act:()=>startPres(cur,true)},{sep:1},
  {label:'Avançar automaticamente',sub:()=>[0,5,10,15,30,60].map(s=>({label:s?'A cada '+s+' s':'Desligado',checked:P.auto===s,act:()=>{P.auto=s;toast(s?'Na apresentação, os passos avançam a cada '+s+' s.':'Avanço automático desligado.')}}))},
  {label:'Repetir ao chegar ao fim',checked:P.loop,act:()=>{P.loop=!P.loop}},{sep:1},
  {label:'Gravar apresentação (vídeo com sua voz)',act:()=>startRecording(false)},{label:'Gravar com a visualização do apresentador',act:()=>startRecording(true)}],ev.currentTarget);
