/* ================= tela de arquivos (depois de entrar) ================= */
const home=$('#home');
const homeOn=()=>!home.hidden;
const THUMB_KEY='lousa-thumb-';
function snapThumb(){
  try{const n=thumbsEl.children[0]&&thumbsEl.children[0].querySelector('.slide');if(!n)return;
    const html=n.outerHTML;if(html.length>450000)return;lsSet(THUMB_KEY+deck.id,JSON.stringify({w:W,h:H,html:html}))}catch(e){}
}
function thumbHTML(id){
  let t=null;try{t=JSON.parse(lsGet(THUMB_KEY+id)||'null')}catch(e){}
  if(!t||!t.html)return '<div class="hm-th ph"><span class="ld-logo">T<span>E</span>X</span></div>';
  return '<div class="hm-th" data-w="'+(+t.w||1280)+'">'+t.html+'</div>';
}
function fitThumbs(root){root.querySelectorAll('.hm-th[data-w]').forEach(th=>{const w=th.clientWidth||210;th.style.setProperty('--k',w/(+th.dataset.w))})}
const driveByLocal=()=>driveMap();
function homeAccount(){
  const acc=$('#hmAcc');
  if(!driveHosted()||!driveReady()){acc.innerHTML='';return}
  acc.innerHTML=driveOn()?'<span>Conectado ao Google Drive</span><button type="button" class="btn small" data-hm="logout">Sair</button>'
    :'<button type="button" class="btn primary" data-hm="login">Entrar com Google</button>';
}
function localCards(q){
  const map=driveByLocal(),list=libList().filter(x=>!q||(x.title||'').toLowerCase().includes(q));
  if(!list.length)return '<div class="hm-empty">'+(q?'Nenhuma apresentação com esse nome neste navegador.':'Nenhuma apresentação salva neste navegador ainda.')+'</div>';
  return '<div class="hm-grid">'+list.map(x=>'<div class="hm-card" role="button" tabindex="0" data-open="'+esc(x.id)+'">'+thumbHTML(x.id)+
    '<div class="hm-meta"><div><b>'+esc(x.title||'Sem título')+(map[x.id]?'<span class="hm-badge">Drive</span>':'')+'</b><small>'+(x.slides||'?')+' slides · '+fmtDate(x.updated)+'</small></div></div>'+
    '<button type="button" class="hm-del" data-del="'+esc(x.id)+'" aria-label="Excluir “'+esc(x.title||'Sem título')+'” deste navegador" title="Excluir deste navegador">'+MI('trash')+'</button></div>').join('')+'</div>';
}
let driveFiles=null,driveFilesErr='';
async function loadDriveFiles(){
  driveFilesErr='';
  try{const q=encodeURIComponent("mimeType='"+DRIVE_MIME+"' and trashed=false");
    const r=await dfetch('https://www.googleapis.com/drive/v3/files?q='+q+'&orderBy=modifiedTime%20desc&pageSize=100&fields=files(id,name,modifiedTime)');
    driveFiles=(await r.json()).files||[]}
  catch(e){driveFiles=null;driveFilesErr=String(e&&e.message||e)}
}
function driveCards(q){
  if(!driveHosted()||!driveReady())return '<div class="hm-empty">O Google Drive ainda não está configurado neste endereço.</div>';
  if(!driveOn())return '<div class="hm-empty">Entre com a sua conta Google para ver e salvar apresentações no seu Drive. Sem conta, salve no computador com Ctrl+S e abra depois por “Abrir do computador” ou com duplo clique no arquivo.<button type="button" class="btn primary" data-hm="login">Entrar com Google</button></div>';
  if(driveFiles==null)return '<div class="hm-empty">'+(driveFilesErr?'Não consegui listar os arquivos do Drive ('+esc(driveFilesErr)+').':'Carregando arquivos do Drive…')+'</div>';
  const local={};Object.entries(driveByLocal()).forEach(([lid,fid])=>{local[fid]=lid});
  const list=driveFiles.filter(f=>!q||(f.name||'').toLowerCase().includes(q));
  if(!list.length)return '<div class="hm-empty">'+(q?'Nenhum arquivo do Drive com esse nome.':'Você ainda não salvou nenhuma apresentação no Drive. Crie uma nova acima: ela é salva lá automaticamente.')+'</div>';
  return '<div class="hm-grid">'+list.map(f=>'<div class="hm-card" role="button" tabindex="0" data-drive="'+esc(f.id)+'">'+(local[f.id]?thumbHTML(local[f.id]):thumbHTML(''))+
    '<div class="hm-meta">'+MI('cloud')+'<div><b>'+esc((f.name||'Sem título').replace(/\.lousa(\.json)?$/,''))+'</b><small>Editada em '+fmtDate(f.modifiedTime)+'</small></div></div>'+
    '<button type="button" class="hm-del" data-ddel="'+esc(f.id)+'" data-name="'+esc((f.name||'Sem título').replace(/\.lousa(\.json)?$/,''))+'" aria-label="Mover para a lixeira do Drive" title="Mover para a lixeira do Drive">'+MI('trash')+'</button></div>').join('')+'</div>';
}
function renderHome(){
  const q=($('#hmQ').value||'').trim().toLowerCase();
  homeAccount();$('#hmDrive').innerHTML=driveCards(q);
  requestAnimationFrame(()=>fitThumbs(home));
}
function setRoute(h){try{if(location.hash!==h)history.replaceState(null,'',location.pathname+location.search+h)}catch(e){}}
function showHome(){
  if(editId)exitEdit(true);commitSoon.flush();saveSoon.flush();snapThumb();
  if(!landing.hidden)landing.hidden=true;
  home.hidden=false;home.scrollTop=0;prefs.homeSeen=true;savePrefs();setRoute('#arquivos');closePop();
  driveFiles=null;renderHome();
  if(driveOn())loadDriveFiles().then(renderHome);
}
function hideHome(){home.hidden=true;setRoute('#editor');fit();rerenderAll()}
async function homeLogin(){
  if(!driveHosted()){driveInfoModal();return}if(!driveReady()){driveSetupModal();return}
  try{await driveToken(true);driveFiles=null;renderHome();await loadDriveFiles();renderHome()}catch(e){driveErr(e)}
}
async function homeNew(sample){
  const d=sample?sampleDeck():null;
  if(d){d.id=uid();openDeck(d,'Exemplo aberto. Edite à vontade.')}else newDeck();
  hideHome();
  if(driveOn()){try{await driveSaveNew();toast('Nova apresentação criada no seu Google Drive. As alterações são salvas lá automaticamente.')}catch(e){driveErr(e)}}
  else toast('Sem conta, use Ctrl+S para salvar a apresentação num arquivo do computador.',6000);
}
function openLocalFromHome(id){
  if(id!==deck.id){const d=loadDeckById(id);if(!d){toast('Não encontrei essa apresentação.');return}snapThumb();openDeck(d,'')}
  hideHome();
}
async function openDriveFromHome(fid){
  const lid=Object.entries(driveMap()).find(([l,f])=>f===fid);
  try{snapThumb();await driveOpenId(fid);hideHome()}
  catch(e){if(lid){openLocalFromHome(lid[0]);toast('Abri a cópia deste navegador: não consegui ler o arquivo do Drive.')}else driveErr(e)}
}
async function trashDriveFile(fid,name){
  try{await dfetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(fid),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({trashed:true})});
    const m=driveMap();Object.keys(m).forEach(l=>{if(m[l]===fid){if(l!==deck.id){deleteDeckFromLib(l);lsDel(THUMB_KEY+l)}delete m[l]}});try{lsSet('lousa-drive-map',JSON.stringify(m))}catch(e){}
    if(driveFiles)driveFiles=driveFiles.filter(f=>f.id!==fid);renderHome();toast('“'+name+'” foi para a lixeira do Google Drive. Dá para recuperar por lá em até 30 dias.')}
  catch(e){driveErr(e)}
}
home.addEventListener('click',ev=>{
  const dd=ev.target.closest('[data-ddel]');
  if(dd){ev.stopPropagation();const fid=dd.dataset.ddel,name=dd.dataset.name;confirmBox('Excluir do Google Drive','Mover “'+name+'” para a lixeira do seu Google Drive?','Mover para a lixeira',()=>trashDriveFile(fid,name));return}
  const del=ev.target.closest('[data-del]');
  if(del){ev.stopPropagation();const id=del.dataset.del,it=libList().find(x=>x.id===id);
    confirmBox('Excluir apresentação','Excluir “'+((it&&it.title)||'Sem título')+'” deste navegador? '+(driveMap()[id]?'A cópia no Google Drive continua lá.':'Essa ação não pode ser desfeita.'),'Excluir',()=>{
      if(id===deck.id){const other=libList().find(x=>x.id!==id);deleteDeckFromLib(id);lsDel(THUMB_KEY+id);if(other){const d=loadDeckById(other.id);if(d)openDeck(d,'')}else newDeck()}
      else{deleteDeckFromLib(id);lsDel(THUMB_KEY+id)}
      renderHome();toast('Apresentação excluída deste navegador.')});return}
  const c=ev.target.closest('[data-open],[data-drive],[data-hm]');if(!c)return;
  if(c.dataset.open){openLocalFromHome(c.dataset.open);return}
  if(c.dataset.drive){openDriveFromHome(c.dataset.drive);return}
  switch(c.dataset.hm){
    case 'new':homeNew(false);break;case 'sample':homeNew(true);break;
    case 'file':hideHome();openFileSmart();break;
    case 'login':homeLogin();break;
    case 'logout':driveDisconnect();driveFiles=null;renderHome();break;
    case 'landing':home.hidden=true;showLanding();break;
  }
});
home.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('.hm-card')){ev.preventDefault();ev.target.click()}});
$('#hmQ').addEventListener('input',renderHome);
window.addEventListener('resize',()=>{if(homeOn())fitThumbs(home)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&home.hidden)snapThumb()});
