/* ================= toolbar ================= */
const ICON={
  plus:'<path d="M10 4.5v11M4.5 10h11"/>',undo:'<path d="M7 5L4 8l3 3"/><path d="M4 8h8a4 4 0 010 8H9"/>',redo:'<path d="M13 5l3 3-3 3"/><path d="M16 8H8a4 4 0 000 8h3"/>',
  roller:'<rect x="3" y="3" width="11" height="5" rx="1"/><path d="M14 5.5h2.5v4.5H9.5v2.5"/><path d="M9.5 12.5V17"/>',
  text:'<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M10 7v7"/>',image:'<rect x="3" y="4" width="14" height="12" rx="1.5"/><circle cx="7.5" cy="8" r="1.3"/><path d="M3.5 14l4-4 3 3 2-2 4 4"/>',
  shape:'<circle cx="7.5" cy="7.5" r="4.2"/><rect x="9" y="9" width="8" height="8" rx="1"/>',line:'<path d="M4 16L16 4"/>',sigma:'<path d="M15 4H5l5.5 6L5 16h10"/>',
  table:'<rect x="3" y="4" width="14" height="12" rx="1.5"/><path d="M3 8h14M3 12h14M8 4v12M12.5 4v12"/>',
  link:'<path d="M8.5 11.5l3-3"/><path d="M7 9.5l-1.8 1.8a2.6 2.6 0 003.7 3.7L10.7 13"/><path d="M13 10.5l1.8-1.8a2.6 2.6 0 00-3.7-3.7L9.3 7"/>',
  comment:'<path d="M3.5 4.5h13v9h-7l-4 3v-3h-2z"/><path d="M10 6.8v4.4M7.8 9h4.4"/>',
  fill:'<path d="M4.5 9.5l5-5 5.5 5.5-5 5z"/><path d="M8 3l2 1.6"/><path d="M16.6 13s1.4 1.7 1.4 2.6a1.4 1.4 0 01-2.8 0c0-.9 1.4-2.6 1.4-2.6z"/>',
  pen:'<path d="M4 16l1-4 8.2-8.2a1.8 1.8 0 012.6 2.6L7.6 14.6z"/>',weight:'<path d="M3 5h14" stroke-width="1"/><path d="M3 10h14" stroke-width="2"/><path d="M3 15.5h14" stroke-width="3.2"/>',
  dash:'<path d="M3 10h3M8.5 10h3M14 10h3"/>',alignL:'<path d="M3 5h14M3 9h9M3 13h14M3 17h9"/>',alignC:'<path d="M3 5h14M5.5 9h9M3 13h14M5.5 17h9"/>',alignR:'<path d="M3 5h14M8 9h9M3 13h14M8 17h9"/>',alignJ:'<path d="M3 5h14M3 9h14M3 13h14M3 17h14"/>',
  valign:'<path d="M4 3h12M4 17h12M10 6v8M7.5 8.5L10 6l2.5 2.5M7.5 11.5L10 14l2.5-2.5"/>',
  ul:'<circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="14" r="1.1" fill="currentColor" stroke="none"/><path d="M8 6h9M8 10h9M8 14h9"/>',
  ol:'<path d="M8.5 6h8.5M8.5 10h8.5M8.5 14h8.5"/><path d="M3.5 4.5L5 3.8V8" stroke-width="1.3"/><path d="M3.3 11.5c.4-.6 1.9-.7 1.9.3 0 .9-1.9 1.6-1.9 2.6h2" stroke-width="1.3"/>',
  indR:'<path d="M9 5h8M9 10h8M9 15h8"/><path d="M3 7.5L5.5 10 3 12.5"/>',indL:'<path d="M9 5h8M9 10h8M9 15h8"/><path d="M5.5 7.5L3 10l2.5 2.5"/>',
  lh:'<path d="M9 5h8M9 10h8M9 15h8"/><path d="M4.5 3v14M2.8 5L4.5 3l1.7 2M2.8 15l1.7 2 1.7-2"/>',clear:'<path d="M5 5h9M9.5 5l-2 8"/><path d="M12 12l5 5M17 12l-5 5"/>',
  hilite:'<path d="M6 12.5l6.5-8.5 3 2.5-6.5 8.5z"/><path d="M6 12.5l-1 3 2.6-1"/>',
  format:'<path d="M4 6h8M15.5 6h.5M4 14h2M9.5 14H16"/><circle cx="13.7" cy="6" r="1.8"/><circle cx="7.7" cy="14" r="1.8"/>',
  anim:'<path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/><path d="M15.5 14.5l.6 1.6 1.4.6-1.4.6-.6 1.6-.6-1.6-1.4-.6 1.4-.6z"/>',
  bg:'<rect x="3" y="4" width="14" height="12" rx="1.5"/><path d="M3 12l4-3 4 3 6-4"/>',layout:'<rect x="3" y="4" width="14" height="12" rx="1.5"/><path d="M3 8h14M9 8v8"/>',
  theme:'<path d="M10 3a7 7 0 100 14c1 0 1.5-.7 1.5-1.4 0-1-.9-1.3-.9-2.1 0-.8.7-1.5 1.6-1.5H14a3 3 0 003-3c0-3.3-3.1-6-7-6z"/><circle cx="6.5" cy="9" r=".9" fill="currentColor"/><circle cx="9" cy="6" r=".9" fill="currentColor"/><circle cx="12.6" cy="6.6" r=".9" fill="currentColor"/>',
  chev:'<path d="M6 8l4 4 4-4"/>',arrows:'<path d="M3 10h14M13 6l4 4-4 4"/>',swap:'<path d="M4 7h11l-3-3M16 13H5l3 3"/>',
  order:'<rect x="3" y="3" width="9" height="9" rx="1"/><rect x="8" y="8" width="9" height="9" rx="1" fill="currentColor" fill-opacity=".25"/>',
  crop:'<path d="M6 2.5V14h11.5"/><path d="M2.5 6H14v11.5"/>',mask:'<circle cx="10" cy="10" r="6.5"/><path d="M3.5 10h13" stroke-dasharray="2 2"/>',reset:'<path d="M4 10a6 6 0 1 0 2-4.5"/><path d="M4 3v3.5h3.5"/>',
  route:'<path d="M3 15h5V5h9"/><path d="M14 2.5L17 5l-3 2.5"/>',chart:'<path d="M3.5 16.5h13"/><rect x="5" y="9" width="2.5" height="7"/><rect x="9" y="5" width="2.5" height="11"/><rect x="13" y="11" width="2.5" height="5"/>',
  border:'<rect x="3.5" y="3.5" width="13" height="13" rx="1" stroke-dasharray="2.5 2"/>',lock:'<rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 016 0V9"/>'
};
const I=(k,cls)=>'<svg class="'+(cls||'')+'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ICON[k]+'</svg>';
const tb=(cmd,inner,title,extra)=>'<button type="button" class="tbtn" data-cmd="'+cmd+'" title="'+esc(title)+'" aria-label="'+esc(title)+'"'+(extra||'')+'>'+inner+'</button>';
const tbr=(cmd,inner,title,extra)=>'<button type="button" class="tbtn row" data-cmd="'+cmd+'" title="'+esc(title)+'"'+(extra||'')+'>'+inner+'</button>';
const tsep='<span class="tsep"></span>';
const cbar=c=>'<span class="cbar'+(c?'':' none')+'" style="background:'+(c?resolveColor(c):'transparent')+'"></span>';
function tbMode(){
  if(cropId)return 'crop';if(editId){return editEl()&&editEl().type==='table'?'cell':'text'}
  const els=selEls();if(!els.length)return 'none';
  if(els.every(e=>e.type==='box'))return 'box';if(els.length===1){const t=els[0].type;if(t!=='box')return t}
  if(els.every(e=>e.type==='line'))return 'line';return 'mixed';
}
function textGroup(e,isTable){
  return tsep+tbr('font','<span id="tbFont">'+esc(fontName(e))+'</span>'+I('chev','mini-chev'),'Fonte',' style="width:136px;justify-content:space-between"')+
    '<span class="tsize"><button type="button" data-cmd="sizeDec" title="Diminuir tamanho">−</button><input id="tbSize" inputmode="numeric" aria-label="Tamanho da fonte" value="'+e.size+'"><button type="button" data-cmd="sizeInc" title="Aumentar tamanho">+</button></span>'+
    tsep+tb('bold','<b class="gl">B</b>','Negrito ('+MOD+'B)',' data-state="bold"')+tb('italic','<i class="gl" style="font-weight:400">I</i>','Itálico ('+MOD+'I)',' data-state="italic"')+
    tb('underline','<span class="gl" style="text-decoration:underline;font-weight:400">U</span>','Sublinhado ('+MOD+'U)',' data-state="underline"')+
    tb('color','<span class="gl" style="font-weight:600;font-size:14px">A</span>'+cbar(e.color||(e.role==='title'?'title':'fg')),'Cor do texto')+tb('hilite',I('hilite'),'Cor de realce')+
    tsep+tb('align',I({left:'alignL',center:'alignC',right:'alignR',justify:'alignJ'}[isTable?'left':e.align]||'alignL'),'Alinhamento')+tb('valign',I('valign'),'Alinhamento vertical')+
    tb('ul',I('ul'),'Lista com marcadores',' data-state="ul"')+tb('bulletStyle',I('chev','mini-chev'),'Estilos de lista')+tb('ol',I('ol'),'Lista numerada',' data-state="ol"')+
    tb('outdent',I('indL'),'Diminuir recuo ('+MOD+'[)')+tb('indent',I('indR'),'Aumentar recuo ('+MOD+'])')+tb('lh',I('lh'),'Espaçamento')+tb('clear',I('clear'),'Limpar formatação ('+MOD+'\\)');
}
function renderToolbar(){
  const m=tbMode(),e=editEl()||selEls()[0];let h='';
  h+=tb('newSlide',I('plus'),'Novo slide ('+MOD+'M)')+tb('newSlideLayout',I('chev','mini-chev'),'Novo slide com layout');
  h+=tsep+tb('undo',I('undo'),'Desfazer ('+MOD+'Z)')+tb('redo',I('redo'),'Refazer ('+MOD+'Y)')+tb('paint',I('roller'),'Pintar formatação',' data-state="painter"');
  h+=tbr('zoom','<span>'+(zoom==='fit'?'Ajustar':Math.round(scale*100)+'%')+'</span>'+I('chev','mini-chev'),'Zoom');
  h+=tsep+tb('toolText',I('text'),'Caixa de texto',' data-tool="text"')+tb('image',I('image'),'Inserir imagem')+tb('shapes',I('shape'),'Forma',' data-tool="shape"')+
    tb('lines',I('line'),'Linha, seta ou conector',' data-tool="line"')+tb('tablePop',I('table'),'Tabela')+tb('eq',I('sigma'),'Equação e símbolos LaTeX')+
    tb('link',I('link'),'Link ('+MOD+'K)')+tb('comment',I('comment'),'Comentário ('+MOD+ALT+'M)');
  h+=tsep;
  switch(m){
    case 'none':
      h+=tbr('bg',I('bg')+'<span>Plano de fundo</span>','Plano de fundo do slide')+(masterMode?'':tbr('layout',I('layout')+'<span>Layout</span>','Layout do slide'))+
        tbr('themePanel',I('theme')+'<span>Tema</span>','Tema e preâmbulo LaTeX')+(masterMode?'':tbr('animPanel',I('anim')+'<span>Transição</span>','Transições e animações'));break;
    case 'text':case 'box':
      h+=tb('fill',I('fill')+cbar(e.fill),'Cor de preenchimento')+tb('stroke',I('pen')+cbar(e.strokeW>0?e.stroke:null),'Cor da borda')+tb('weight',I('weight'),'Espessura da borda')+tb('dash',I('dash'),'Tracejado da borda');
      h+=textGroup(e,false);
      h+=tsep+tbr('formatPanel',I('format')+'<span>Formato</span>','Opções de formato')+(masterMode?'':tbr('animate',I('anim')+'<span>Animar</span>','Animar'));break;
    case 'cell':case 'table':
      h+=tb('cellFill',I('fill')+cbar(null),'Cor de preenchimento da célula')+tb('tbBorder',I('border')+cbar(e.borderColor),'Cor da borda da tabela')+tb('tbWeight',I('weight'),'Espessura da borda')+
        tbr('tableMenu',I('table')+'<span>Tabela</span>'+I('chev','mini-chev'),'Linhas, colunas e mesclagem');
      h+=textGroup(e,true);
      h+=tsep+tbr('formatPanel',I('format')+'<span>Formato</span>','Opções de formato')+(masterMode?'':tbr('animate',I('anim')+'<span>Animar</span>','Animar'));break;
    case 'image':
      h+=tb('stroke',I('pen')+cbar(e.strokeW>0?e.stroke:null),'Cor da borda')+tb('weight',I('weight'),'Espessura da borda')+tsep+
        tbr('crop',I('crop')+'<span>Cortar</span>','Cortar imagem')+tb('maskPop',I('mask'),'Mascarar com forma')+tb('resetImg',I('reset'),'Redefinir imagem')+tbr('replaceImg',I('swap')+'<span>Substituir</span>','Substituir imagem')+
        tsep+tbr('formatPanel',I('format')+'<span>Formato</span>','Opções de formato')+(masterMode?'':tbr('animate',I('anim')+'<span>Animar</span>','Animar'));break;
    case 'crop':
      h+=tbr('cropDone',I('crop')+'<span>Concluir corte</span>','Concluir corte (Enter)')+tb('resetImg',I('reset'),'Redefinir imagem');break;
    case 'line':
      h+=tb('stroke',I('pen')+cbar(e.stroke),'Cor da linha')+tb('weight',I('weight'),'Espessura da linha')+tb('dash',I('dash'),'Tracejado')+tb('routePop',I('route'),'Tipo de linha')+tb('capsPop',I('arrows'),'Pontas')+tsep+
        tbr('formatPanel',I('format')+'<span>Formato</span>','Opções de formato')+(masterMode?'':tbr('animate',I('anim')+'<span>Animar</span>','Animar'));break;
    case 'chart':
      h+=tbr('chartKind',I('chart')+'<span>'+CHART_KINDS[e.kind]+'</span>'+I('chev','mini-chev'),'Tipo de gráfico')+tbr('formatPanel',I('format')+'<span>Dados e opções</span>','Editar dados do gráfico')+(masterMode?'':tbr('animate',I('anim')+'<span>Animar</span>','Animar'));break;
    case 'media':
      h+=tbr('formatPanel',I('format')+'<span>Opções de reprodução</span>','Opções de reprodução')+(masterMode?'':tbr('animate',I('anim')+'<span>Animar</span>','Animar'));break;
    default:
      h+=tbr('arrange',I('order')+'<span>Organizar</span>','Organizar')+tbr('formatPanel',I('format')+'<span>Formato</span>','Opções de formato')+(masterMode?'':tbr('animate',I('anim')+'<span>Animar</span>','Animar'));
  }
  toolbar.innerHTML=h;undoUI();updateToolbarState();
}
const renderToolbarSoon=debounce(renderToolbar,120);
function readState(){
  const st={painter:!!painter};
  if(editId){
    ['bold','italic','underline'].forEach(c=>{try{st[c]=document.queryCommandState(c)}catch(e){}});
    try{st.ul=document.queryCommandState('insertUnorderedList');st.ol=document.queryCommandState('insertOrderedList')}catch(e){}
    const tx=curTx();let n=savedRange?savedRange.startContainer:null;if(n&&n.nodeType===3)n=n.parentElement;
    if(tx&&n&&tx.contains(n)){const cs=getComputedStyle(n);st.size=Math.round(parseFloat(cs.fontSize));st.font=cs.fontFamily.split(',')[0].replace(/['"]/g,'').trim()}
    else{const e=editEl();st.size=e.size;st.font=fontName(e)}
  }else{const e=textEls()[0];if(e){st.size=e.size;st.font=fontName(e)}}
  return st;
}
function updateToolbarState(){
  const st=readState();
  toolbar.querySelectorAll('[data-state]').forEach(b=>b.classList.toggle('on',!!st[b.dataset.state]));
  const si=$('#tbSize');if(si&&document.activeElement!==si&&st.size)si.value=st.size;
  const fl=$('#tbFont');if(fl&&st.font)fl.textContent=st.font;
  toolbar.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('on',!!tool&&tool.kind===b.dataset.tool));
}
const toolbarStateSoon=debounce(updateToolbarState,80);
toolbar.addEventListener('mousedown',ev=>{if(!ev.target.closest('input'))ev.preventDefault()});
toolbar.addEventListener('click',ev=>{const b=ev.target.closest('[data-cmd]');if(b&&!b.disabled)runCmd(b.dataset.cmd,b)});
toolbar.addEventListener('change',ev=>{if(ev.target.id==='tbSize')setSize(parseFloat(ev.target.value))});
toolbar.addEventListener('keydown',ev=>{if(ev.target.id==='tbSize'&&ev.key==='Enter'){ev.preventDefault();setSize(parseFloat(ev.target.value));restoreSel()}});
function weightItems(types,allowNone){return(allowNone?[0]:[]).concat([1,2,3,4,6,8,12]).map(v=>({label:v?v+' px':'Nenhuma',checked:propOf('strokeW')===v,act:()=>{if(v&&!propOf('stroke'))setProp('stroke','fg',types);setProp('strokeW',v,types)}}))}
function runCmd(c,a){
  const e=editEl()||selEls()[0];
  switch(c){
    case 'newSlide':addSlide();break;case 'newSlideLayout':layoutPop(a,k=>addSlide(k));break;
    case 'undo':undo();break;case 'redo':redo();break;
    case 'paint':if(painter)stopPainter();else startPainter();break;
    case 'zoom':openMenu(zoomItems(),a);break;
    case 'toolText':if(editId)exitEdit();setTool(tool&&tool.kind==='text'?null:{kind:'text'});break;
    case 'image':openMenu([{label:'Fazer upload do computador…',act:()=>pickImage()},{label:'Por endereço (URL)…',act:imageUrlModal},{label:'Vídeo ou áudio…',act:mediaModal}],a);break;
    case 'shapes':shapesPop(a);break;case 'lines':openMenu(lineItems(),a);break;
    case 'tablePop':tablePop(a);break;case 'eq':eqPop(a);break;case 'link':linkPop(a);break;case 'comment':startComment();break;
    case 'bg':openMenu([{label:'Cor…',act:()=>colorPop(a,slide().bg,col=>col?setSlideBg(col):resetSlideBg(),{none:'Usar o fundo do tema'})},{label:'Imagem…',act:()=>pickBgImage('slide')},{label:'Redefinir',act:resetSlideBg}],a);break;
    case 'layout':layoutPop(a,k=>applyLayout(k));break;
    case 'themePanel':openSide('theme');break;case 'animPanel':openSide('anim');break;case 'formatPanel':openSide('format');break;
    case 'animate':animateSel();openSide('anim',true);break;
    case 'arrange':openMenu([{label:'Ordem',sub:orderItems},{label:'Alinhar',sub:alignItems},{label:'Distribuir horizontalmente',act:()=>distribute('h')},{label:'Distribuir verticalmente',act:()=>distribute('v')},{label:'Agrupar',act:groupSel},{label:'Desagrupar',act:ungroupSel}],a);break;
    case 'fill':colorPop(a,e.fill,col=>{if(col&&!(e.fillOpacity>0))setProp('fillOpacity',1,['box']);setProp('fill',col,['box'])},{none:'Sem preenchimento'});break;
    case 'stroke':colorPop(a,e.stroke,col=>{const ty=e.type==='line'?['line']:['box','image'];if(!col){if(e.type!=='line')setProp('strokeW',0,ty);return}if(e.type!=='line'&&!(e.strokeW>0))setProp('strokeW',2,ty);setProp('stroke',col,ty)},{none:e.type==='line'?null:'Sem borda'});break;
    case 'weight':openMenu(weightItems(e.type==='line'?['line']:['box','image'],e.type!=='line'),a);break;
    case 'dash':openMenu([['solid','Contínua'],['dash','Tracejada'],['dot','Pontilhada'],['dashdot','Traço e ponto']].map(d=>({label:d[1],checked:e.dash===d[0],act:()=>{if(e.type==='box'&&!(e.strokeW>0)){setProp('stroke',e.stroke||'fg',['box']);setProp('strokeW',2,['box'])}setProp('dash',d[0],['box','line'])}})),a);break;
    case 'routePop':openMenu(Object.keys(ROUTES).map(k=>({label:ROUTES[k],checked:e.route===k,act:()=>setProp('route',k,['line'])})),a);break;
    case 'capsPop':openMenu([{label:'Início',sub:Object.keys(CAPS).map(k=>({label:CAPS[k],checked:e.startCap===k,act:()=>setProp('startCap',k,['line'])}))},{label:'Fim',sub:Object.keys(CAPS).map(k=>({label:CAPS[k],checked:e.endCap===k,act:()=>setProp('endCap',k,['line'])}))}],a);break;
    case 'font':openMenu([{label:'Títulos do tema ('+deck.theme.titleFont+')',font:deck.theme.titleFont,act:()=>setFont('title')},{label:'Corpo do tema ('+deck.theme.bodyFont+')',font:deck.theme.bodyFont,act:()=>setFont('body')},{sep:1}].concat(Object.keys(FONTS).map(f=>({label:f,font:f,act:()=>setFont(f)}))),a);break;
    case 'sizeDec':stepSize(-1);break;case 'sizeInc':stepSize(1);break;
    case 'bold':textCmd('bold');break;case 'italic':textCmd('italic');break;case 'underline':textCmd('underline');break;
    case 'color':colorPop(a,e.color,col=>setTextColor(col));break;
    case 'hilite':colorPop(a,null,col=>setHighlight(col),{none:'Sem realce'});break;
    case 'align':openMenu([['left','À esquerda'],['center','Centralizado'],['right','À direita'],['justify','Justificado']].map(x=>({label:x[1],act:()=>alignText(x[0])})),a);break;
    case 'valign':openMenu([['top','Em cima'],['middle','No meio'],['bottom','Embaixo']].map(x=>({label:x[1],act:()=>valignText(x[0])})),a);break;
    case 'ul':textCmd('insertUnorderedList');break;case 'ol':textCmd('insertOrderedList');break;
    case 'bulletStyle':openMenu([{label:'Marcadores',sub:BULLETS.map(b=>({label:b[1]+'  '+b[2],act:()=>setListStyle(b[0],false)}))},{label:'Numeração',sub:NUMBERS.map(n=>({label:n[1],act:()=>setListStyle(n[0],true)}))}],a);break;
    case 'indent':indent(1);break;case 'outdent':indent(-1);break;
    case 'lh':openMenu([1,1.15,1.25,1.5,2].map(v=>({label:'Linhas: '+String(v).replace('.',','),checked:e.lh===v,act:()=>setProp('lh',v,['box'])})).concat([{sep:1}],[0,.3,.6,1].map(v=>({label:'Parágrafos: '+String(v).replace('.',',')+' em',checked:(e.ps||0)===v,act:()=>setProp('ps',v,['box'])}))),a);break;
    case 'clear':clearFormat();break;
    case 'cellFill':colorPop(a,null,col=>setCellProp('fill',col),{none:'Sem preenchimento'});break;
    case 'tbBorder':colorPop(a,e.borderColor,col=>{if(!col){setProp('borderW',0,['table']);return}if(!(e.borderW>0))setProp('borderW',1,['table']);setProp('borderColor',col,['table'])},{none:'Sem bordas'});break;
    case 'tbWeight':openMenu([0,1,2,3,4].map(v=>({label:v?v+' px':'Sem bordas',checked:e.borderW===v,act:()=>setProp('borderW',v,['table'])})),a);break;
    case 'tableMenu':openMenu(tableItems(),a);break;
    case 'crop':enterCrop(e);break;case 'cropDone':exitCrop();break;
    case 'maskPop':openMenu(maskItems(),a);break;case 'resetImg':resetImage(selEls()[0]);break;case 'replaceImg':pickImage(e);break;
    case 'chartKind':openMenu(Object.keys(CHART_KINDS).map(k=>({label:CHART_KINDS[k],checked:e.kind===k,act:()=>{setProp('kind',k,['chart']);renderSide()}})),a);break;
  }
}
