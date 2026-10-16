/* ================= arquivo .lousa no computador =================
   Com o Lousa TeX instalado como aplicativo (Chrome ou Edge), um duplo clique num arquivo .lousa abre
   a apresentação direto no programa. Quando o navegador oferece acesso a arquivos (File System Access),
   Ctrl+S grava no mesmo arquivo e as mudanças seguintes são salvas nele automaticamente. */
const FS={handle:null,deckId:null,name:'',canWrite:false,busy:null};
const LOUSA_EXT='.lousa';
const fsApi=()=>standalone&&window.isSecureContext&&'showSaveFilePicker' in window&&'showOpenFilePicker' in window;
const LOUSA_TYPES=[{description:'Apresentação do Lousa TeX',accept:{'application/json':['.lousa','.json']}}];
const fileLinked=()=>!!(FS.handle&&FS.deckId===deck.id);
function fileStatus(){if(fileLinked())setSaveState((FS.canWrite?'Salvo em ':'Aberto de ')+FS.name)}
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
  const data=JSON.stringify(deck);const w=await h.createWritable();await w.write(data);await w.close();
}
async function saveToFile(saveAs){
  if(editId)exitEdit();commitSoon.flush();
  if(!fsApi()){exportJSON();return}
  let h=!saveAs&&fileLinked()?FS.handle:null;
  if(!h){try{h=await window.showSaveFilePicker({suggestedName:slug(deck.title)+LOUSA_EXT,types:LOUSA_TYPES})}catch(e){return}}
  if(!await filePerm(h,true)){toast('Sem permissão para gravar nesse arquivo. Use Arquivo › Salvar como…');return}
  try{await writeFile(h);FS.handle=h;FS.deckId=deck.id;FS.name=h.name;FS.canWrite=true;fileStatus();toast('Salvo em '+h.name+'. As próximas mudanças vão direto para esse arquivo.')}
  catch(e){toast('Não consegui gravar: '+(e.message||e))}
}
const fileSaveSoon=debounce(()=>{
  if(!fileLinked()||!FS.canWrite)return;
  FS.busy=(FS.busy||Promise.resolve()).then(()=>writeFile(FS.handle)).then(fileStatus).catch(()=>{FS.canWrite=false;setSaveState('Não salvo no arquivo');toast('Não consegui gravar em '+FS.name+'. Use Ctrl+S para tentar de novo.')});
},1500);
async function openFileSmart(){
  if(!fsApi()){openFilePicker('open');return}
  let hs;try{hs=await window.showOpenFilePicker({types:LOUSA_TYPES,multiple:false})}catch(e){return}
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
