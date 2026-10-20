/* ================= themes, fonts, shapes, layouts ================= */
const THEMES={
  quadro:{name:'Quadro branco',bg:'#ffffff',fg:'#1f252d',title:'#11161c',accent:'#b4532a',titleFont:'STIX Two Text',bodyFont:'STIX Two Text'},
  moderno:{name:'Moderno',bg:'#ffffff',fg:'#26303b',title:'#0f3a6b',accent:'#1f6feb',titleFont:'Fira Sans',bodyFont:'Source Sans 3'},
  lousa:{name:'Lousa',bg:'#1f2d27',fg:'#e6ece3',title:'#ffffff',accent:'#f0c35e',titleFont:'Fira Sans',bodyFont:'STIX Two Text'},
  papel:{name:'Papel',bg:'#f5f0e6',fg:'#2b2620',title:'#5b281c',accent:'#9a4330',titleFont:'Lora',bodyFont:'Source Serif 4'},
  noite:{name:'Noite',bg:'#0f1b2e',fg:'#dbe4f1',title:'#ffffff',accent:'#7aaefc',titleFont:'IBM Plex Sans',bodyFont:'IBM Plex Sans'},
  contraste:{name:'Alto contraste',bg:'#000000',fg:'#ffffff',title:'#ffd23f',accent:'#ffd23f',titleFont:'Fira Sans',bodyFont:'Fira Sans'}
};
const FONTS={'STIX Two Text':"'STIX Two Text','Times New Roman',serif",'Source Serif 4':"'Source Serif 4',Georgia,serif",'Lora':"'Lora',Georgia,serif",
  'Source Sans 3':"'Source Sans 3','Helvetica Neue',Arial,sans-serif",'Fira Sans':"'Fira Sans','Helvetica Neue',Arial,sans-serif",'IBM Plex Sans':"'IBM Plex Sans','Helvetica Neue',Arial,sans-serif",
  'IBM Plex Mono':"'IBM Plex Mono',ui-monospace,monospace"};
const SIZES={'16:9':{w:1280,h:720,name:'Widescreen 16:9'},'16:10':{w:1280,h:800,name:'Widescreen 16:10'},'4:3':{w:960,h:720,name:'Padrão 4:3'},'A4':{w:1123,h:794,name:'A4 paisagem'}};

const SHAPE_CATS=[
  ['Formas básicas',['rect','round','ellipse','triangle','rtriangle','diamond','pentagon','hexagon','octagon','parallelogram','trapezoid','plus','donut','can','heart','star','star6']],
  ['Setas de bloco',['arrow','arrowL','arrowU','arrowD','arrowLR','arrowUD','chevron','homePlate']],
  ['Fluxograma',['pill','fcDecision','fcData','fcDocument','fcPredefined','fcManual','fcDelay','fcConnector','fcPrep']],
  ['Balões de fala',['wedgeRect','wedgeRound','wedgeEllipse']],
  ['Equação',['mPlus','mMinus','mTimes','mDivide','mEqual','mNotEqual']]
];
const SHAPES={text:'Sem forma (caixa de texto)',rect:'Retângulo',round:'Retângulo arredondado',ellipse:'Elipse',triangle:'Triângulo',rtriangle:'Triângulo retângulo',diamond:'Losango',
  pentagon:'Pentágono',hexagon:'Hexágono',octagon:'Octógono',parallelogram:'Paralelogramo',trapezoid:'Trapézio',plus:'Cruz',donut:'Anel',can:'Cilindro',heart:'Coração',star:'Estrela de 5 pontas',star6:'Estrela de 6 pontas',
  arrow:'Seta para a direita',arrowL:'Seta para a esquerda',arrowU:'Seta para cima',arrowD:'Seta para baixo',arrowLR:'Seta dupla horizontal',arrowUD:'Seta dupla vertical',chevron:'Divisa',homePlate:'Pentágono seta',
  pill:'Terminação',fcDecision:'Decisão',fcData:'Dados',fcDocument:'Documento',fcPredefined:'Processo predefinido',fcManual:'Entrada manual',fcDelay:'Atraso',fcConnector:'Conector',fcPrep:'Preparação',
  wedgeRect:'Balão retangular',wedgeRound:'Balão arredondado',wedgeEllipse:'Balão oval',
  mPlus:'Mais',mMinus:'Menos',mTimes:'Multiplicação',mDivide:'Divisão',mEqual:'Igual',mNotEqual:'Diferente'};
const f2=v=>(Math.round(v*100)/100);
function poly(pts){return 'M'+pts.map(p=>f2(p[0])+' '+f2(p[1])).join('L')+'Z'}
function starPts(n,w,h,inner){const p=[];for(let i=0;i<2*n;i++){const r=i%2?inner:1,a=-Math.PI/2+i*Math.PI/n;p.push([w/2+Math.cos(a)*w/2*r,h/2+Math.sin(a)*h/2*r])}return p}
function regPoly(n,w,h){const p=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;p.push([w/2+Math.cos(a)*w/2,h/2+Math.sin(a)*h/2])}return p}
function rrect(w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));if(!r)return 'M0 0H'+w+'V'+h+'H0Z';
  return 'M'+r+' 0H'+(w-r)+'A'+r+' '+r+' 0 0 1 '+w+' '+r+'V'+(h-r)+'A'+r+' '+r+' 0 0 1 '+(w-r)+' '+h+'H'+r+'A'+r+' '+r+' 0 0 1 0 '+(h-r)+'V'+r+'A'+r+' '+r+' 0 0 1 '+r+' 0Z'}
function ell(cx,cy,rx,ry){return 'M'+(cx-rx)+' '+cy+'A'+rx+' '+ry+' 0 1 0 '+(cx+rx)+' '+cy+'A'+rx+' '+ry+' 0 1 0 '+(cx-rx)+' '+cy+'Z'}
function band(w,y,t){return poly([[0,y-t/2],[w,y-t/2],[w,y+t/2],[0,y+t/2]])}
function shapeD(k,w,h,radius){
  switch(k){
    case 'text':case 'rect':return rrect(w,h,radius||0);
    case 'round':return rrect(w,h,Math.max(radius||0,Math.min(w,h)*.14));
    case 'pill':return rrect(w,h,Math.min(w,h)/2);
    case 'ellipse':case 'fcConnector':return ell(w/2,h/2,w/2,h/2);
    case 'triangle':return poly([[w/2,0],[w,h],[0,h]]);
    case 'rtriangle':return poly([[0,0],[w,h],[0,h]]);
    case 'diamond':case 'fcDecision':return poly([[w/2,0],[w,h/2],[w/2,h],[0,h/2]]);
    case 'pentagon':return poly(regPoly(5,w,h));
    case 'hexagon':case 'fcPrep':{const a=Math.min(w*.25,h*.5);return poly([[a,0],[w-a,0],[w,h/2],[w-a,h],[a,h],[0,h/2]])}
    case 'octagon':{const a=Math.min(w,h)*.29;return poly([[a,0],[w-a,0],[w,a],[w,h-a],[w-a,h],[a,h],[0,h-a],[0,a]])}
    case 'parallelogram':case 'fcData':{const a=Math.min(w*.25,h*.6);return poly([[a,0],[w,0],[w-a,h],[0,h]])}
    case 'trapezoid':{const a=Math.min(w*.22,h*.8);return poly([[a,0],[w-a,0],[w,h],[0,h]])}
    case 'plus':case 'mPlus':{const t=Math.min(w,h)*(k==='plus'?.34:.2),x1=(w-t)/2,y1=(h-t)/2;
      return poly([[x1,0],[x1+t,0],[x1+t,y1],[w,y1],[w,y1+t],[x1+t,y1+t],[x1+t,h],[x1,h],[x1,y1+t],[0,y1+t],[0,y1],[x1,y1]])}
    case 'donut':{const t=Math.min(w,h)*.22;return ell(w/2,h/2,w/2,h/2)+ell(w/2,h/2,Math.max(1,w/2-t),Math.max(1,h/2-t))}
    case 'can':{const ry=Math.min(h*.15,w*.3),rx=w/2;return 'M0 '+ry+'A'+rx+' '+ry+' 0 0 1 '+w+' '+ry+'V'+(h-ry)+'A'+rx+' '+ry+' 0 0 1 0 '+(h-ry)+'Z M0 '+ry+'A'+rx+' '+ry+' 0 0 0 '+w+' '+ry}
    case 'heart':return 'M'+w/2+' '+h*.28+'C'+w*.45+' '+h*.02+' 0 '+h*.02+' 0 '+h*.34+'C0 '+h*.6+' '+w*.32+' '+h*.78+' '+w/2+' '+h+'C'+w*.68+' '+h*.78+' '+w+' '+h*.6+' '+w+' '+h*.34+'C'+w+' '+h*.02+' '+w*.55+' '+h*.02+' '+w/2+' '+h*.28+'Z';
    case 'star':return poly(starPts(5,w,h,.42));
    case 'star6':return poly(starPts(6,w,h,.58));
    case 'arrow':{const hw=Math.min(w*.45,h),t=h*.27;return poly([[0,t],[w-hw,t],[w-hw,0],[w,h/2],[w-hw,h],[w-hw,h-t],[0,h-t]])}
    case 'arrowL':{const hw=Math.min(w*.45,h),t=h*.27;return poly([[w,t],[hw,t],[hw,0],[0,h/2],[hw,h],[hw,h-t],[w,h-t]])}
    case 'arrowU':{const hh=Math.min(h*.45,w),t=w*.27;return poly([[t,h],[t,hh],[0,hh],[w/2,0],[w,hh],[w-t,hh],[w-t,h]])}
    case 'arrowD':{const hh=Math.min(h*.45,w),t=w*.27;return poly([[t,0],[t,h-hh],[0,h-hh],[w/2,h],[w,h-hh],[w-t,h-hh],[w-t,0]])}
    case 'arrowLR':{const hw=Math.min(w*.3,h),t=h*.27;return poly([[0,h/2],[hw,0],[hw,t],[w-hw,t],[w-hw,0],[w,h/2],[w-hw,h],[w-hw,h-t],[hw,h-t],[hw,h]])}
    case 'arrowUD':{const hh=Math.min(h*.3,w),t=w*.27;return poly([[w/2,0],[w,hh],[w-t,hh],[w-t,h-hh],[w,h-hh],[w/2,h],[0,h-hh],[t,h-hh],[t,hh],[0,hh]])}
    case 'chevron':{const a=Math.min(w*.35,h*.5);return poly([[0,0],[w-a,0],[w,h/2],[w-a,h],[0,h],[a,h/2]])}
    case 'homePlate':{const a=Math.min(w*.35,h*.5);return poly([[0,0],[w-a,0],[w,h/2],[w-a,h],[0,h]])}
    case 'fcDocument':return 'M0 0H'+w+'V'+h*.82+'C'+w*.72+' '+h*.6+' '+w*.38+' '+h*1.08+' 0 '+h*.86+'Z';
    case 'fcPredefined':{const a=w*.1;return 'M0 0H'+w+'V'+h+'H0Z M'+a+' 0V'+h+' M'+(w-a)+' 0V'+h}
    case 'fcManual':return poly([[0,h*.25],[w,0],[w,h],[0,h]]);
    case 'fcDelay':return 'M0 0H'+w/2+'A'+w/2+' '+h/2+' 0 0 1 '+w/2+' '+h+'H0Z';
    case 'wedgeRect':return poly([[0,0],[w,0],[w,h],[w*.4,h],[w*.12,h*1.32],[w*.2,h],[0,h]]);
    case 'wedgeRound':{const r=Math.min(w,h)*.18;return 'M'+r+' 0H'+(w-r)+'A'+r+' '+r+' 0 0 1 '+w+' '+r+'V'+(h-r)+'A'+r+' '+r+' 0 0 1 '+(w-r)+' '+h+'H'+w*.4+'L'+w*.12+' '+h*1.32+'L'+w*.22+' '+h+'H'+r+'A'+r+' '+r+' 0 0 1 0 '+(h-r)+'V'+r+'A'+r+' '+r+' 0 0 1 '+r+' 0Z'}
    case 'wedgeEllipse':{const p=a=>[w/2+Math.cos(a)*w/2,h/2+Math.sin(a)*h/2],a1=100*Math.PI/180,a2=128*Math.PI/180,P1=p(a1),P2=p(a2);
      return 'M'+f2(P2[0])+' '+f2(P2[1])+'A'+w/2+' '+h/2+' 0 1 1 '+f2(P1[0])+' '+f2(P1[1])+'L'+f2(w*.1)+' '+f2(h*1.3)+'Z'}
    case 'mMinus':return band(w,h/2,h*.22);
    case 'mEqual':return band(w,h*.32,h*.2)+band(w,h*.68,h*.2);
    case 'mNotEqual':return band(w,h*.32,h*.2)+band(w,h*.68,h*.2)+poly([[w*.58,0],[w*.72,0],[w*.42,h],[w*.28,h]]);
    case 'mDivide':{const r=Math.min(w,h)*.11;return band(w,h/2,h*.18)+ell(w/2,h*.17,r,r)+ell(w/2,h*.83,r,r)}
    case 'mTimes':{const t=.2,s=Math.SQRT1_2,pts=[[-t/2,-.5],[t/2,-.5],[t/2,-t/2],[.5,-t/2],[.5,t/2],[t/2,t/2],[t/2,.5],[-t/2,.5],[-t/2,t/2],[-.5,t/2],[-.5,-t/2],[-t/2,-t/2]]
      .map(p=>[(p[0]*s-p[1]*s)*.95+.5,(p[0]*s+p[1]*s)*.95+.5]).map(p=>[p[0]*w,p[1]*h]);return poly(pts)}
    default:return rrect(w,h,0);
  }
}
const EVENODD=new Set(['donut']);

const TEXPKG={
  physics:['physics','Derivadas, bra-ket, vetores e operadores: \\dv, \\pdv, \\ket, \\expval, \\grad, \\abs, \\order','\\dv{f}{x},\\;\\pdv{\\mathcal{L}}{\\phi},\\;\\expval{H}{\\psi}'],
  mathtools:['mathtools','Extensões do amsmath: \\coloneqq, \\prescript, matrizes com alinhamento, \\xrightarrow','a \\coloneqq b,\\;\\xrightarrow[\\text{baixo}]{\\text{cima}}'],
  gensymb:['gensymb','Unidades em modo texto: \\degree, \\celsius, \\micro, \\ohm','30\\,\\degree,\\;5\\,\\micro\\text{m}'],
  upgreek:['upgreek','Letras gregas retas: \\upalpha, \\upmu, \\uppi','\\upmu\\text{m},\\;\\uppi'],
  centernot:['centernot','Barra centralizada em símbolos: \\centernot\\implies','A\\centernot\\implies B'],
  extpfeil:['extpfeil','Setas extensíveis: \\xtwoheadrightarrow, \\xmapsto','\\xmapsto{\\;f\\;}'],
  empheq:['empheq','Equações com caixas e chaves laterais','\\begin{empheq}[box=\\fbox]{align} E&=mc^2 \\end{empheq}'],
  bussproofs:['bussproofs','Árvores de demonstração (lógica)','\\begin{prooftree}\\AxiomC{A}\\UnaryInfC{B}\\end{prooftree}'],
  colortbl:['colortbl','Cores em células de matrizes e arrays','\\begin{array}{cc}\\rowcolor{yellow}a&b\\end{array}']
};
const PH={title:'Clique para adicionar um título',subtitle:'Clique para adicionar um subtítulo',body:'Clique para adicionar texto',body2:'Clique para adicionar texto',eq:'Clique para escrever a equação em LaTeX'};
const EFFECTS={
  in:{appear:'Aparecer',fade:'Esmaecer',rise:'Subir',flyL:'Entrar pela esquerda',flyR:'Entrar pela direita',flyT:'Entrar por cima',flyB:'Entrar por baixo',zoom:'Zoom',spin:'Girar',wipe:'Revelar'},
  out:{disappear:'Desaparecer',fade:'Esmaecer',sink:'Afundar',flyL:'Sair pela esquerda',flyR:'Sair pela direita',flyT:'Sair por cima',flyB:'Sair por baixo',zoom:'Zoom',spin:'Girar',wipe:'Ocultar'},
  emph:{pulse:'Pulsar',spin:'Girar 360°',shake:'Tremer',flash:'Piscar',grow:'Aumentar e voltar'}
};
const KINDS={in:'Entrada',out:'Saída',emph:'Ênfase'};
const STARTS={click:'Ao clicar',with:'Com a anterior',after:'Após a anterior'};
const TRANSITIONS={none:'Nenhuma',morph:'Transformar (Morph)',fade:'Esmaecer',slideL:'Deslizar da direita',slideU:'Deslizar de baixo',zoom:'Zoom',flip:'Virar'};
const CAPS={none:'Nenhuma',arrow:'Seta',open:'Seta aberta',circle:'Círculo',square:'Quadrado',diamond:'Losango'};
const ROUTES={straight:'Reta',elbow:'Angular',curve:'Curva'};
const CHART_KINDS={fn:'Função f(x)',bar:'Colunas',barh:'Barras',line:'Linhas',area:'Área',scatter:'Dispersão',pie:'Pizza'};

/* ================= constructors ================= */
const BASE={rot:0,flipH:false,flipV:false,opacity:1,anim:null,group:null,locked:false,link:null,alt:'',shadow:false};
function box(o){return Object.assign({id:uid(),type:'box',shape:'text',x:100,y:100,w:400,h:60},BASE,{html:'',size:28,color:null,font:null,bold:false,align:'left',valign:'top',lh:1.25,ps:0,pad:10,
  fill:null,fillOpacity:1,stroke:null,strokeW:0,dash:'solid',join:'round',radius:0,role:null,fit:'grow',dir:'ltr',outline:null,outlineW:0,textShadow:false},o)}
function shapeEl(kind,o){return box(Object.assign({shape:kind,x:490,y:270,w:300,h:180,fill:'accent',fillOpacity:.16,stroke:'accent',strokeW:2,align:'center',valign:'middle',fit:'none'},o))}
function imageEl(o){return Object.assign({id:uid(),type:'image',x:0,y:0,w:100,h:100},BASE,{src:'',crop:{l:0,t:0,r:0,b:0},mask:null,radius:0,stroke:null,strokeW:0,bright:0,contrast:0,gray:false,reflect:false},o)}
function lineEl(o){return Object.assign({id:uid(),type:'line',x1:440,y1:360,x2:840,y2:360},BASE,{stroke:'fg',strokeW:3,dash:'solid',cap:'round',startCap:'none',endCap:'none',route:'straight',a1:null,a2:null},o)}
function tikzEl(o){return Object.assign({id:uid(),type:'tikz',x:340,y:160,w:600,h:400},BASE,{code:'',libs:'',pkgs:[],svg:'',vw:0,vh:0,themeInk:true,err:''},o)}
function inkEl(o){return Object.assign({id:uid(),type:'ink',x:0,y:0,w:10,h:10},BASE,{vw:10,vh:10,strokes:[]},o)}
function cellObj(o){return Object.assign({html:'',fill:null,align:'left',valign:'middle',rs:1,cs:1,hide:false},o)}
function tableEl(rows,cols,o){
  const cells=[];for(let r=0;r<rows;r++){const row=[];for(let c=0;c<cols;c++)row.push(cellObj());cells.push(row)}
  return Object.assign({id:uid(),type:'table',x:190,y:180,w:900,h:rows*46},BASE,{rows:rows,cols:cols,colW:Array(cols).fill(1/cols),rowH:Array(rows).fill(44),cells:cells,
    borderColor:'muted',borderW:1,size:22,color:null,font:null,pad:8,header:true,headerFill:'accent',band:false},o);
}
function chartEl(kind,o){return Object.assign({id:uid(),type:'chart',x:320,y:150,w:640,h:420},BASE,{kind:kind||'bar',title:'',xTitle:'',yTitle:'',legend:true,grid:true,logY:false,logX:false,size:18,colors:null,fns:'sin(x)/x | $\\operatorname{sinc}(x)$\ncos(x)*exp(-x^2/40) | $\\cos x\\; e^{-x^2/40}$',xMin:'-12',xMax:'12',yMin:'',yMax:'',samples:400,
  data:LANG==='en'?'Category\tSeries 1\tSeries 2\nA\t4\t2.5\nB\t3\t4.4\nC\t5\t1.8\nD\t2\t3.1':'Categoria\tSérie 1\tSérie 2\nA\t4\t2,5\nB\t3\t4,4\nC\t5\t1,8\nD\t2\t3,1'},o)}
function mediaEl(o){return Object.assign({id:uid(),type:'media',x:320,y:150,w:640,h:360},BASE,{kind:'video',url:'',src:'',title:'',start:0,end:0,autoplay:false,muted:false,loop:false},o)}
function T44(){return box({role:'title',x:80,y:36,w:1120,h:100,size:44,bold:true,valign:'middle',font:'title',fit:'grow'})}
const LAYOUTS={
  title:{name:'Slide de título',els:()=>[box({role:'title',x:100,y:200,w:1080,h:150,size:60,bold:true,align:'center',valign:'bottom',font:'title',fit:'grow'}),box({role:'subtitle',x:100,y:370,w:1080,h:80,size:28,align:'center',color:'muted',fit:'grow'})]},
  titleBody:{name:'Título e corpo',els:()=>[T44(),box({role:'body',x:80,y:156,w:1120,h:500,size:28,fit:'grow'})]},
  twoCol:{name:'Duas colunas',els:()=>[T44(),box({role:'body',x:80,y:156,w:540,h:500,size:26,fit:'grow'}),box({role:'body2',x:660,y:156,w:540,h:500,size:26,fit:'grow'})]},
  equation:{name:'Equação em destaque',els:()=>[T44(),box({role:'eq',x:140,y:210,w:1000,h:200,size:40,align:'center',valign:'middle',fit:'grow'}),box({role:'body',x:140,y:450,w:1000,h:160,size:26,align:'center',fit:'grow'})]},
  section:{name:'Cabeçalho de seção',els:()=>[box({role:'title',x:100,y:240,w:1080,h:130,size:54,bold:true,align:'center',valign:'bottom',font:'title',fit:'grow'}),box({role:'subtitle',x:100,y:384,w:1080,h:70,size:26,align:'center',color:'muted',fit:'grow'})]},
  titleOnly:{name:'Apenas título',els:()=>[T44()]},
  blank:{name:'Em branco',els:()=>[]}
};
function scaler(size){const sx=(size?size.w:W)/1280,sy=(size?size.h:H)/720;return o=>Object.assign(o,{x:Math.round(o.x*sx),y:Math.round(o.y*sy),w:Math.round(o.w*sx),h:Math.round(o.h*sy)})}
function layoutEls(layout,size){const S=scaler(size);return(LAYOUTS[layout]||LAYOUTS.blank).els().map(S)}
function makeSlide(layout,size){return{id:uid(),layout:layout,bg:null,bgImage:null,bgFit:'cover',notes:'',skip:false,hideMaster:false,transition:null,transDur:null,els:layoutEls(layout,size)}}

/* light markup → html (samples, pasted text, old files) */
const MATH_RE=/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<!\\)\$(?:\\\$|[^$\n])+?(?<!\\)\$/g;
function md(src){
  const math=[];
  let s=String(src).replace(MATH_RE,m=>{math.push(m);return '\u0000'+(math.length-1)+'\u0000'});
  s=esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*([^*\n]+?)\*/g,'<i>$1</i>');
  let out='',list=null,li=false;
  const closeLi=()=>{if(li){out+='</li>';li=false}};
  const close=()=>{closeLi();if(list){out+='</'+list+'>';list=null}};
  s.split('\n').forEach(ln=>{
    let m;
    if((m=ln.match(/^\s*[-•]\s+(.*)$/))){if(list!=='ul'){close();out+='<ul>';list='ul'}closeLi();out+='<li>'+m[1];li=true}
    else if((m=ln.match(/^\s*\d+[.)]\s+(.*)$/))){if(list!=='ol'){close();out+='<ol>';list='ol'}closeLi();out+='<li>'+m[1];li=true}
    else if(list&&ln.trim()){out+='<div>'+ln+'</div>'}
    else{close();out+=ln.trim()?'<div>'+ln+'</div>':'<div><br></div>'}
  });
  close();
  return out.replace(/\u0000(\d+)\u0000/g,(_,i)=>esc(math[+i]));
}
function anim(o){return Object.assign({kind:'in',fx:'fade',start:'click',dur:.5,delay:0,byPara:false,order:0},o)}

function sampleDeck(){
  const L=i18n;
  const th=THEMES.quadro,size={w:1280,h:720,name:'16:9'};
  const s1=makeSlide('title',size);
  s1.els[0].html=md(L('Violação de Lorentz em neutrinos'));
  s1.els[1].html=md(L('Relações de dispersão modificadas e sinais em telescópios de neutrinos'));
  s1.els.push(shapeEl('rect',{x:580,y:478,w:120,h:4,fill:'accent',fillOpacity:1,strokeW:0}));
  s1.notes=L('Apresentação de exemplo do Lousa TeX. Edite ou apague à vontade.');
  const s2=makeSlide('titleBody',size);
  s2.els[0].html=md(L('Relação de dispersão modificada'));
  Object.assign(s2.els[1],{w:620,html:md(L('- Termo de ordem $n$ suprimido pela escala de Planck:\n$$E^2 = p^2 + m^2 + \\xi_n\\,\\frac{p^{\\,n+2}}{\\Mpl^{\\,n}}$$\n- Para $n=1$, a correção relativa cresce linearmente com $E$\n- Neutrinos de PeV tornam acessíveis valores $\\xi_1 \\lesssim 10^{-2}$')),anim:anim({fx:'fade',byPara:true,order:1})});
  s2.els.push(shapeEl('round',{x:730,y:176,w:480,h:250,fill:'accent',fillOpacity:.08,stroke:'accent',strokeW:2,size:22,color:'fg',pad:18,
    html:md(L('**Velocidade de grupo**\n$$v_g = \\frac{\\partial E}{\\partial p} \\simeq 1 - \\frac{m^2}{2p^2} + \\frac{(n+1)\\,\\xi_n}{2}\\left(\\frac{E}{\\Mpl}\\right)^{\\!n}$$')),anim:anim({fx:'rise',order:2})}));
  s2.notes=L('Os tópicos aparecem um a um (animação por parágrafo). O quadro da direita sobe por último.');
  const s3=makeSlide('equation',size);
  s3.els[0].html=md(L('Probabilidade de oscilação'));
  s3.els[1].html=md('$$P_{\\nu_\\mu\\to\\nu_\\tau} = \\sin^2 2\\theta\\;\\sin^2\\!\\left(\\frac{\\Delta m^2 L}{4E} + \\frac{\\delta\\xi_1\\,E^{2} L}{2\\Mpl}\\right)$$');
  s3.els[2].html=md(L('O termo de massa cai como $L/E$; o termo de violação cresce como $E^2 L$.'));
  const s4=makeSlide('titleOnly',size);
  s4.els[0].html=md(L('Observáveis para $n = 1$'));
  const tb=tableEl(4,2,{x:140,y:170,w:1000,colW:[.42,.58],rowH:[52,70,70,70],size:24});
  [[L('Observável'),L('Expressão')],[L('Velocidade de grupo'),'$v_g \\simeq 1 + \\xi_1\\, E/\\Mpl$'],[L('Atraso de chegada'),'$\\Delta t \\simeq \\xi_1\\,\\dfrac{E}{\\Mpl}\\,\\dfrac{L}{c}$'],[L('Fase extra na oscilação'),'$\\dfrac{\\delta\\xi_1\\,E^{2} L}{2\\Mpl}$']]
    .forEach((row,r)=>row.forEach((t,c)=>{tb.cells[r][c].html=md(t)}));
  s4.els.push(tb);
  s4.els.push(box({x:140,y:520,w:1000,h:60,size:20,color:'muted',html:md(L('Tabelas aceitam LaTeX em cada célula. Clique numa célula da tabela selecionada para escrever.'))}));
  const s5=makeSlide('titleOnly',size);
  s5.els[0].html=md(L('Gráficos editáveis'));
  s5.els.push(chartEl('line',{x:90,y:150,w:700,h:470,title:L('Atraso relativo (dados ilustrativos)'),xTitle:L('Energia (TeV)'),yTitle:L('Atraso (unid. arb.)'),legend:false,
    data:L('Energia\tAtraso\n10\t0,1\n50\t0,52\n100\t0,98\n200\t2,05\n400\t3,96')}));
  s5.els.push(box({x:830,y:180,w:370,h:300,size:22,html:md(L('- Colunas, barras, linhas, área, dispersão e pizza\n- Cole os dados direto do Planilhas ou do Excel em **Opções de formato**\n- As cores seguem o tema'))}));
  const s6=makeSlide('twoCol',size);
  s6.els[0].html=md(L('Como usar'));
  s6.els[1].html=md(L('- **Clique duas vezes** numa caixa para escrever direto no slide\n- \\$E=mc^2\\$ vira $E=mc^2$ quando você sai da caixa\n- \\$\\$ … \\$\\$ cria uma equação destacada\n- Uma prévia mostra o LaTeX enquanto você digita\n- O botão $\\Sigma$ insere símbolos e estruturas\n- **Ajuda › Pesquisar nos menus** encontra qualquer comando'));
  Object.assign(s6.els[2],{shape:'round',fill:'accent',fillOpacity:.07,pad:20,html:md(L('**Macros do preâmbulo** (Slide › Editar tema)\n$$\\Mpl \\approx 1{,}22\\times 10^{19}\\ \\mathrm{GeV}$$\n**Ambientes do AMS**\n$$\\begin{aligned} \\nabla\\cdot\\mathbf{E} &= \\rho/\\varepsilon_0 \\\\ \\nabla\\times\\mathbf{B} - \\tfrac{1}{c^2}\\,\\partial_t\\mathbf{E} &= \\mu_0\\mathbf{J} \\end{aligned}$$'))});
  return normalize({version:3,id:uid(),title:L('Violação de Lorentz em neutrinos'),size:size,
    theme:{bg:th.bg,fg:th.fg,title:th.title,accent:th.accent,titleFont:th.titleFont,bodyFont:th.bodyFont,transition:'fade',transDur:.5,showNumbers:true},
    preamble:'\\newcommand{\\Mpl}{M_{\\mathrm{Pl}}}\n\\newcommand{\\dd}{\\mathrm{d}}',slides:[s1,s2,s3,s4,s5,s6]});
}

/* ================= old files ================= */
function migrateV1(d){
  const th=d.theme||{},font=th.font||'STIX Two Text';
  return{version:2,title:d.title,theme:{bg:th.bg||'#ffffff',fg:th.fg||'#1f252d',title:th.fg||'#11161c',accent:th.accent||'#b4532a',titleFont:font,bodyFont:font,transition:'none',showNumbers:false},
    preamble:d.preamble||'',slides:(d.slides||[]).map(s=>({id:s.id||uid(),layout:'blank',bg:s.bg||null,notes:'',els:(s.els||[]).map(e=>{
      if(e.type==='text')return box({id:e.id||uid(),x:e.x,y:e.y,w:e.w,h:40,html:md(e.text||''),size:e.size||28,color:e.color||null,align:e.align||'left',bold:!!e.bold,
        fill:e.fill&&e.fillOpacity>0?e.fill:null,fillOpacity:e.fillOpacity||1,stroke:e.stroke&&e.strokeW>0?e.stroke:null,strokeW:e.strokeW||0,radius:e.radius||0});
      if(e.type==='rect'||e.type==='ellipse')return box({id:e.id||uid(),shape:e.type,x:e.x,y:e.y,w:e.w,h:e.h,fill:e.fill||null,fillOpacity:e.fillOpacity==null?1:e.fillOpacity,
        stroke:e.stroke&&e.strokeW>0?e.stroke:null,strokeW:e.strokeW||0,radius:e.radius||0,align:'center',valign:'middle',fit:'none'});
      if(e.type==='image')return imageEl({id:e.id||uid(),src:e.src,x:e.x,y:e.y,w:e.w,h:e.h});
      return null}).filter(Boolean)}))};
}
function normAnim(a){if(!a)return null;
  const fx=a.fx||(a.effect==='appear'?'appear':a.effect==='rise'?'rise':'fade');const kind=EFFECTS[a.kind]?a.kind:'in';
  return anim({kind:kind,fx:EFFECTS[kind][fx]?fx:Object.keys(EFFECTS[kind])[1],start:STARTS[a.start]?a.start:'click',dur:a.dur!=null?+a.dur:.5,delay:+a.delay||0,byPara:!!a.byPara,order:+a.order||0})}
function pxToEm(html,base){
  if(!html||html.indexOf('px')<0)return html;
  const t=document.createElement('template');t.innerHTML=html;const d=t.content;
  d.querySelectorAll('[style]').forEach(n=>{const fs=n.style.fontSize;if(/px$/.test(fs))n.style.fontSize=(+(parseFloat(fs)/base).toFixed(4))+'em'});
  return t.innerHTML;
}
/* ---------- segurança: arquivos de outras pessoas não podem executar código ---------- */
const safeId=v=>typeof v==='string'&&/^[\w-]{1,64}$/.test(v)?v:uid();
const safeColor=v=>v==null?null:(typeof v==='string'&&v.length<80&&!/[<>"'`;{}\\]/.test(v)?v:null);
const COLOR_KEYS=['fill','stroke','color','outline','bg','hl','textShadowColor'];
function sanitizeSVG(str){
  if(typeof str!=='string'||!str)return '';
  const t=document.createElement('template');t.innerHTML=str;
  t.content.querySelectorAll('script,foreignObject,iframe,object,embed,link,meta,base,animate,set,animateMotion,animateTransform,handler,listener').forEach(n=>n.remove());
  t.content.querySelectorAll('*').forEach(n=>{Array.from(n.attributes).forEach(a=>{const k=a.name.toLowerCase(),v=a.value;
    if(k.startsWith('on'))n.removeAttribute(a.name);
    else if((k==='href'||k==='xlink:href'||k==='src')&&!/^(#|data:image\/(png|jpe?g|gif|webp);)/i.test(v.trim()))n.removeAttribute(a.name);
    else if(k==='style'&&/url\s*\(\s*['"]?\s*(?!#|data:)/i.test(v))n.removeAttribute(a.name)})});
  t.content.querySelectorAll('style').forEach(s=>{if(/@import|url\s*\(\s*['"]?\s*(?!#|data:)|expression\s*\(/i.test(s.textContent))s.remove()});
  return t.innerHTML;
}
function safeEl(o){
  o.id=safeId(o.id);if(o.group!=null)o.group=typeof o.group==='string'&&/^[\w-]{1,64}$/.test(o.group)?o.group:null;
  COLOR_KEYS.forEach(k=>{if(k in o)o[k]=safeColor(o[k])});
  if(o.type==='box'&&typeof o.html==='string')o.html=sanitizeHTML(o.html);
  if(o.type==='table')o.cells.forEach(r=>r.forEach(c=>{c.html=sanitizeHTML(String(c.html||''));c.fill=safeColor(c.fill)}));
  if(o.type==='tikz')o.svg=sanitizeSVG(o.svg);
  if(o.type==='ink')o.strokes=(Array.isArray(o.strokes)?o.strokes:[]).filter(s=>s&&typeof s.d==='string'&&/^[MLCQSTAHVZmlcqstahvz0-9.,\se+-]*$/.test(s.d)).map(s=>Object.assign(s,{c:safeColor(s.c)||'fg',w:+s.w||4}));
  if(o.type==='line'){['a1','a2'].forEach(k=>{if(o[k])o[k]=o[k].id&&/^[\w-]{1,64}$/.test(o[k].id)?{id:o[k].id,side:String(o[k].side||'').replace(/[^\w-]/g,'')}:null})}
  if(o.type==='image'&&typeof o.src==='string'&&!/^(data:image\/|https?:|blob:)/i.test(o.src))o.src='';
  if(o.type==='media'&&typeof o.url==='string'&&!/^(https?:|data:(video|audio)\/|blob:)/i.test(o.url))o.url='';
  if(o.link&&typeof o.link==='object'&&o.link.url&&!safeHref(o.link.url))o.link=null;
  return o;
}
function normEl(e){
  if(!e||!e.type)return null;
  let o;
  if(e.type==='box'){o=Object.assign(box({}),e);o.html=pxToEm(o.html||'',o.size||28);if(o.fit==null)o.fit=o.role?'shrink':'grow'}
  else if(e.type==='image'){o=Object.assign(imageEl({}),e);o.crop=Object.assign({l:0,t:0,r:0,b:0},e.crop||{})}
  else if(e.type==='line'){o=Object.assign(lineEl({}),e);
    if('arrowEnd' in e){o.endCap=e.arrowEnd?'arrow':'none';delete o.arrowEnd}if('arrowStart' in e){o.startCap=e.arrowStart?'arrow':'none';delete o.arrowStart}}
  else if(e.type==='table'){o=Object.assign(tableEl(1,1,{}),e);
    o.cells=(e.cells||[]).map(row=>(row||[]).map(c=>cellObj(c)));o.rows=o.cells.length;o.cols=o.rows?o.cells[0].length:0;
    if(!o.rows||!o.cols)return null;
    if(!Array.isArray(o.colW)||o.colW.length!==o.cols)o.colW=Array(o.cols).fill(1/o.cols);
    if(!Array.isArray(o.rowH)||o.rowH.length!==o.rows)o.rowH=Array(o.rows).fill(44)}
  else if(e.type==='chart')o=Object.assign(chartEl('bar',{}),e);
  else if(e.type==='media')o=Object.assign(mediaEl({}),e);
  else if(e.type==='ink')o=Object.assign(inkEl({}),e);
  else if(e.type==='tikz')o=Object.assign(tikzEl({}),e);
  else return null;
  o.id=e.id||uid();o.anim=normAnim(e.anim);
  return safeEl(o);
}
function normalize(d){
  if(!d||typeof d!=='object')d={};
  if(!d.version||d.version<2)d=migrateV1(d);
  d.version=3;d.id=d.id||uid();d.title=d.title||i18n('Sem título');
  d.size=d.size&&d.size.w>=200&&d.size.h>=200?{w:Math.round(d.size.w),h:Math.round(d.size.h),name:d.size.name||''}:{w:1280,h:720,name:'Widescreen 16:9'};
  d.theme=Object.assign({bg:'#ffffff',fg:'#1f252d',title:'#11161c',accent:'#b4532a',titleFont:'STIX Two Text',bodyFont:'STIX Two Text',transition:'none',transDur:.5,showNumbers:false,bgImage:null,bgFit:'cover',progress:'none',refFooter:true,eqAuto:false},d.theme||{});
  if(!FONTS[d.theme.titleFont])d.theme.titleFont='STIX Two Text';if(!FONTS[d.theme.bodyFont])d.theme.bodyFont='STIX Two Text';
  if(!TRANSITIONS[d.theme.transition])d.theme.transition='none';
  d.preamble=typeof d.preamble==='string'?d.preamble:'';
  d.packages=Array.isArray(d.packages)?d.packages.filter(p=>TEXPKG[p]):[];
  if((d.fitV||0)<2){[d.master].concat(d.slides||[]).forEach(sl=>{if(sl&&Array.isArray(sl.els))sl.els.forEach(e=>{if(e&&e.type==='box'&&e.fit==='shrink')e.fit='grow'})});d.fitV=2}
  d.texPkgs=Array.isArray(d.texPkgs)?d.texPkgs.filter(p=>p&&p.id&&p.name):[];d.texPkgs.forEach(p=>{p.code=String(p.code||'');if(p.math==null)p.math=true;if(p.mathCode==null)pkgPrepare(p)});
  d.texFonts=d.texFonts&&typeof d.texFonts==='object'?d.texFonts:{};
  d.refs=Array.isArray(d.refs)?d.refs.filter(r=>r&&r.key):[];
  d.guides=d.guides&&Array.isArray(d.guides.v)?{v:d.guides.v.filter(isFinite),h:(d.guides.h||[]).filter(isFinite)}:{v:[],h:[]};
  d.comments=Array.isArray(d.comments)?d.comments.filter(c=>c&&c.id).map(c=>Object.assign(c,{id:safeId(c.id),replies:Array.isArray(c.replies)?c.replies:[]})):[];
  ['bg','fg','title','accent','numColor','numBgColor'].forEach(k=>{if(d.theme[k]!=null&&!safeColor(d.theme[k]))d.theme[k]=k==='bg'?'#ffffff':k==='accent'?'#b4532a':k==='numColor'||k==='numBgColor'?'':'#1f252d'});
  if(d.theme.bgImage&&!/^(data:image\/|https?:)/i.test(d.theme.bgImage))d.theme.bgImage=null;
  d.master={id:'master',layout:'blank',bg:null,bgImage:null,bgFit:'cover',notes:'',els:((d.master&&d.master.els)||[]).map(normEl).filter(Boolean)};
  d.slides=(Array.isArray(d.slides)?d.slides:[]).map(s=>({id:safeId(s.id||uid()),layout:LAYOUTS[s.layout]?s.layout:'blank',bg:safeColor(s.bg),bgImage:s.bgImage&&/^(data:image\/|https?:)/i.test(s.bgImage)?s.bgImage:null,num:s.num&&typeof s.num==='object'?{color:safeColor(s.num.color)||undefined,bg:safeColor(s.num.bg)||undefined,hide:s.num.hide?true:undefined}:undefined,bgFit:s.bgFit||'cover',
    notes:s.notes||'',skip:!!s.skip,hideMaster:!!s.hideMaster,transition:TRANSITIONS[s.transition]?s.transition:null,transDur:s.transDur||null,els:(s.els||[]).map(normEl).filter(Boolean)}));
  if(!d.slides.length)d.slides=[makeSlide('title',d.size)];
  return d;
}
