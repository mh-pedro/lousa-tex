/* ================= arquivo .lousa no computador =================
   Com o Lousa TeX instalado como aplicativo (Chrome ou Edge), um duplo clique num arquivo .lousa abre
   a apresentação direto no programa. Quando o navegador oferece acesso a arquivos (File System Access),
   Ctrl+S grava no mesmo arquivo e as mudanças seguintes são salvas nele automaticamente. */
const FS={handle:null,deckId:null,name:'',canWrite:false,busy:null};
const LOUSA_EXT='.lousa';
const fsApi=()=>standalone&&window.isSecureContext&&'showSaveFilePicker' in window&&'showOpenFilePicker' in window;
const LOUSA_TYPES=[{description:'Apresentação do Lousa TeX',accept:{'application/json':['.lousa','.json'],'text/html':['.html']}}];
const HTML_TYPES=[{description:'Apresentação do Lousa TeX (abre no navegador)',accept:{'text/html':['.html']}}];
const SITE_URL=()=>{const b=document.baseURI||location.href;return /^https?:/.test(b)?b.split(/[?#]/)[0].replace(/[^/]*$/,''):'https://mh-pedro.github.io/lousa-tex/'};
/* arquivo .lousa.html: abre no navegador com duplo clique, em qualquer sistema, e carrega o Lousa TeX com a apresentação */
function deckFileHtml(){
  const site=SITE_URL(),title=esc(deck.title||'Apresentação');
  const json=JSON.stringify(deck).replace(/</g,'\\u003c');
  return '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="generator" content="Lousa TeX">\n<title>'+title+' · Lousa TeX</title>\n</head>\n<body style="margin:0;display:grid;place-items:center;height:100vh;font:16px system-ui,sans-serif;color:#333;background:#f1f3f4">\n'+
  '<div id="lousa-msg" style="max-width:520px;text-align:center;padding:24px"><p style="font-size:22px;margin:0 0 8px"><b>'+title+'</b></p><p>Abrindo no Lousa TeX…</p></div>\n'+
  '<script type="application/json" id="lousa-deck">'+json+'<\/script>\n'+
  '<script>\n(function(){\n  var SITE='+JSON.stringify(site)+';\n  var deck=JSON.parse(document.getElementById("lousa-deck").textContent);\n'+
  '  fetch(SITE+"index.html",{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.text()}).then(function(h){\n'+
  '    window.__LOUSA_DECK=deck;\n    h=h.replace("<head>","<head>\\n<base href=\\""+SITE+"\\">\\n<script>window.__LOUSA_FROM_FILE=true<\\/script>");\n'+
  '    document.open();document.write(h);document.close();\n'+
  '  }).catch(function(e){document.getElementById("lousa-msg").innerHTML="<p><b>Não consegui carregar o Lousa TeX.</b></p><p>Verifique a conexão com a internet e abra o arquivo de novo. Se preferir, acesse <a href=\\""+SITE+"\\">"+SITE+"</a> e use Arquivo › Abrir arquivo do computador.</p>"});\n})();\n<\/script>\n</body>\n</html>\n';
}
const fileLinked=()=>!!(FS.handle&&FS.deckId===deck.id);
function fileStatus(){if(FS.fromFile&&!FS.handle){setSaveState('Aberto de '+FS.name);return}if(fileLinked())setSaveState((FS.canWrite?'Salvo em ':'Aberto de ')+FS.name)}
async function filePerm(h,ask){
  try{const o={mode:'readwrite'};if(await h.queryPermission(o)==='granted')return true;return ask?(await h.requestPermission(o))==='granted':false}catch(e){return false}
}
async function openFromHandle(h){
  try{const f=await h.getFile();const d=parseDeckText(await f.text());
    if(!d){toast('Não reconheci '+f.name+' como uma apresentação do Lousa TeX.');return}
    if(!d.id)d.id=uid();openDeck(d,'Arquivo '+f.name+' aberto.');
    FS.handle=h;FS.deckId=deck.id;FS.name=f.name;FS.canWrite=await filePerm(h,false);fileStatus();
  }catch(e){toast('Não consegui abrir o arquivo: '+(e.message||e))}
}
async function writeFile(h){
  const data=/\.html?$/i.test(h.name||'')?deckFileHtml():JSON.stringify(deck);const w=await h.createWritable();await w.write(data);await w.close();
}
async function saveToFile(saveAs){
  if(editId)exitEdit();commitSoon.flush();
  const nm=(FS.fromFile&&FS.name)||slug(deck.title)+'.lousa.html';
  if(!fsApi()){saveFile(nm,deckFileHtml(),'text/html');return}
  let h=!saveAs&&fileLinked()?FS.handle:null;
  if(!h){try{h=await window.showSaveFilePicker({id:'lousa-arquivos',suggestedName:nm,types:HTML_TYPES})}catch(e){return}}
  if(!await filePerm(h,true)){toast('Sem permissão para gravar nesse arquivo. Use Arquivo › Salvar como…');return}
  try{await writeFile(h);FS.handle=h;FS.deckId=deck.id;FS.name=h.name;FS.canWrite=true;fileStatus();FS.fromFile=false;toast('Salvo em '+h.name+'. As próximas mudanças vão direto para esse arquivo; um duplo clique nele abre a apresentação.')}
  catch(e){toast('Não consegui gravar: '+(e.message||e))}
}
const fileSaveSoon=debounce(()=>{
  if(!fileLinked()||!FS.canWrite)return;
  FS.busy=(FS.busy||Promise.resolve()).then(()=>writeFile(FS.handle)).then(fileStatus).catch(()=>{FS.canWrite=false;setSaveState('Não salvo no arquivo');toast('Não consegui gravar em '+FS.name+'. Use Ctrl+S para tentar de novo.')});
},1500);
async function openFileSmart(){
  if(!fsApi()){openFilePicker('open');return}
  let hs;try{hs=await window.showOpenFilePicker({id:'lousa-arquivos',types:LOUSA_TYPES,multiple:false})}catch(e){return}
  if(hs&&hs[0])openFromHandle(hs[0]);
}
/* abrir pelo sistema (duplo clique no arquivo, com o app instalado) */
function setupLaunchQueue(){
  if(!('launchQueue' in window))return;
  window.launchQueue.setConsumer(p=>{if(p&&p.files&&p.files.length)openFromHandle(p.files[0])});
}
/* instalar como aplicativo */
let installEvt=null;
window.addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();installEvt=ev});
window.addEventListener('appinstalled',()=>{installEvt=null;toast('Lousa TeX instalado. Agora os arquivos .lousa abrem com duplo clique.')});
const isInstalled=()=>window.matchMedia&&(matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: window-controls-overlay)').matches);
function installApp(){
  if(installEvt){const e=installEvt;installEvt=null;e.prompt();return}
  openModal('Instalar o Lousa TeX',
    (isInstalled()?'<p class="hint">O Lousa TeX já está aberto como aplicativo.</p>':'')+
    '<p class="hint">Instalado, o Lousa TeX ganha janela própria e ícone, e os arquivos <code>.lousa</code> passam a abrir com duplo clique.</p>'+
    '<ol class="hint"><li><b>Chrome ou Edge no computador:</b> clique no ícone de instalar na barra de endereço (um monitor com seta) ou no menu ⋮ › <i>Transmitir, salvar e compartilhar</i> › <i>Instalar página como app</i>.</li>'+
    '<li>Depois, clique com o botão direito num arquivo <code>.lousa</code> › <i>Abrir com</i> › <b>Lousa TeX</b>, e marque para usar sempre.</li></ol>'+
    '<p class="hint">Firefox e Safari não permitem abrir arquivos com duplo clique em apps da web. Neles, use Arquivo › Abrir arquivo do computador.</p>'+
    (location.protocol==='file:'?'<p class="hint err">Este arquivo foi aberto do computador. A instalação só funciona pelo site publicado.</p>':''));
}
/* service worker: permite instalar e abrir mesmo com a conexão instável */
if(standalone&&'serviceWorker' in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
