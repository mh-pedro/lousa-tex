/* ================= Google Drive ================= */
/* Para que todos que abrirem o site já usem o Drive, preencha o arquivo config.js ao lado do index.html.
   Também dá para informar pelo menu Arquivo › Google Drive › Configurar (fica salvo só neste navegador). */
const DRIVE_DEFAULT=Object.assign({clientId:'',apiKey:'',appId:''},(window.LOUSA_CONFIG&&window.LOUSA_CONFIG.drive)||{});
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
const DRIVE_MIME='application/vnd.lousa-tex+json';
const D={token:null,exp:0,tc:null,loaded:null,user:''};
const driveCfg=()=>({clientId:(prefs.driveClientId||DRIVE_DEFAULT.clientId||'').trim(),apiKey:(prefs.driveApiKey||DRIVE_DEFAULT.apiKey||'').trim(),appId:(prefs.driveAppId||DRIVE_DEFAULT.appId||'').trim()});
const driveHosted=()=>standalone&&/^https?:$/.test(location.protocol);
const driveReady=()=>{const c=driveCfg();return !!(c.clientId&&c.apiKey)};
const driveOn=()=>!!D.token&&Date.now()<D.exp-60000;
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=()=>no(new Error('Não consegui carregar '+src+'. Verifique a conexão.'));document.head.appendChild(s)})}
function driveLoad(){
  if(!D.loaded)D.loaded=Promise.all([loadScript('https://accounts.google.com/gsi/client'),loadScript('https://apis.google.com/js/api.js')])
    .then(()=>new Promise(ok=>gapi.load('picker',ok))).catch(e=>{D.loaded=null;throw e});
  return D.loaded;
}
function driveToken(interactive){
  if(driveOn())return Promise.resolve(D.token);
  if(!interactive)return Promise.reject(new Error('reconnect'));
  return driveLoad().then(()=>new Promise((ok,no)=>{
    if(!D.tc)D.tc=google.accounts.oauth2.initTokenClient({client_id:driveCfg().clientId,scope:DRIVE_SCOPE,callback:()=>{}});
    D.tc.callback=r=>{if(r.error){no(new Error(r.error));return}D.token=r.access_token;D.exp=Date.now()+(+r.expires_in||3600)*1000;ok(D.token)};
    D.tc.error_callback=e=>no(new Error((e&&e.type)||'popup_failed'));
    D.tc.requestAccessToken({prompt:''});
  }));
}
function driveErr(e){
  const m=String(e&&e.message||e);
  if(m==='reconnect'){setSaveState('Drive desconectado');toast('A conexão com o Drive expirou. Use Arquivo › Google Drive › Conectar.');return}
  if(/popup_closed|access_denied/.test(m)){toast('Conexão com o Google Drive cancelada.');return}
  if(/popup_failed_to_open|popup_failed/.test(m)){toast('O navegador bloqueou a janela do Google. Permita pop-ups para este site.');return}
  setSaveState('Erro no Drive');toast('Google Drive: '+m);
}
async function dfetch(url,opt){
  const t=await driveToken(false);opt=opt||{};opt.headers=Object.assign({Authorization:'Bearer '+t},opt.headers||{});
  const r=await fetch(url,opt);
  if(r.status===401){D.token=null;throw new Error('reconnect')}
  if(r.status===404)throw new Error('o arquivo não foi encontrado ou o Lousa TeX não tem acesso a ele. Abra-o pelo seletor do Drive.');
  if(!r.ok)throw new Error('o Drive respondeu com erro '+r.status+'.');
  return r;
}
const driveMap=()=>{try{return JSON.parse(lsGet('lousa-drive-map')||'{}')}catch(e){return{}}};
const driveIdOf=()=>driveMap()[deck.id]||null;
function setDriveId(fid){const m=driveMap();if(fid)m[deck.id]=fid;else delete m[deck.id];try{lsSet('lousa-drive-map',JSON.stringify(m))}catch(e){}}
function multipart(meta,body){return '--lousa\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--lousa\r\nContent-Type: '+DRIVE_MIME+'\r\n\r\n'+body+'\r\n--lousa--'}
let driveSaving=null;
async function driveSave(asNew,folderId){
  if(editId)exitEdit();commitSoon.flush();
  const body=JSON.stringify(deck),name=(deck.title||'Apresentação').replace(/[\\/]/g,'-')+'.lousa.json';let fid=asNew?null:driveIdOf();
  setSaveState('Salvando no Drive…');
  if(fid){await dfetch('https://www.googleapis.com/upload/drive/v3/files/'+fid+'?uploadType=multipart&fields=id',{method:'PATCH',headers:{'Content-Type':'multipart/related; boundary=lousa'},body:multipart({name:name},body)})}
  else{const meta={name:name,mimeType:DRIVE_MIME,description:'Apresentação do Lousa TeX'};if(folderId)meta.parents=[folderId];
    const r=await dfetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary=lousa'},body:multipart(meta,body)});
    fid=(await r.json()).id;setDriveId(fid)}
  setSaveState('Salvo no Drive');return fid;
}
const driveAuto=debounce(()=>{if(!driveIdOf()||!driveOn())return;if(driveSaving)return driveAuto();driveSaving=driveSave().catch(driveErr).finally(()=>{driveSaving=null})},3000);
driveHook=()=>{if(driveIdOf())driveAuto()};
async function driveOpenId(fid){
  setSaveState('Abrindo do Drive…');
  const r=await dfetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(fid)+'?alt=media');
  const d=parseDeckText(await r.text());if(!d){setSaveState(draftState());toast('Esse arquivo não é uma apresentação do Lousa TeX.');return}
  openDeck(d,'Aberta do Google Drive. As alterações são salvas lá automaticamente.');setDriveId(fid);setSaveState('Salvo no Drive');
}
function picker(view,title,cb){
  const c=driveCfg();
  const pb=new google.picker.PickerBuilder().setOAuthToken(D.token).setDeveloperKey(c.apiKey).addView(view).setLocale('pt-BR').setTitle(title)
    .setCallback(d=>{if(d.action===google.picker.Action.PICKED&&d.docs&&d.docs[0])cb(d.docs[0])});
  if(c.appId)pb.setAppId(c.appId);pb.build().setVisible(true);
}
function driveGuard(){
  if(!driveHosted()){driveInfoModal();return false}
  if(!driveReady()){driveSetupModal();return false}
  return true;
}
async function driveConnect(){if(!driveGuard())return;try{await driveToken(true);toast('Conectado ao Google Drive.')}catch(e){driveErr(e)}}
async function driveOpen(){
  if(!driveGuard())return;
  try{await driveToken(true);await driveLoad();
    const v=new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes(DRIVE_MIME+',application/json').setMode(google.picker.DocsViewMode.LIST).setIncludeFolders(true);
    picker(v,'Abrir apresentação do Lousa TeX',f=>driveOpenId(f.id).catch(driveErr));
  }catch(e){driveErr(e)}
}
/* pasta "Lousa TeX" no Meu Drive (criada pelo próprio app, sem usar o seletor do Google) */
const DRIVE_FOLDER='application/vnd.google-apps.folder';
async function driveFolder(){
  const saved=lsGet('lousa-drive-folder');
  if(saved){try{const r=await dfetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(saved)+'?fields=id,trashed');const j=await r.json();if(j&&j.id&&!j.trashed)return j.id}catch(e){}}
  const q=encodeURIComponent("mimeType='"+DRIVE_FOLDER+"' and name='Lousa TeX' and trashed=false");
  let id=null;try{const r=await dfetch('https://www.googleapis.com/drive/v3/files?q='+q+'&fields=files(id)&pageSize=1');id=((await r.json()).files||[])[0];id=id&&id.id}catch(e){}
  if(!id){const r=await dfetch('https://www.googleapis.com/drive/v3/files?fields=id',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Lousa TeX',mimeType:DRIVE_FOLDER})});id=(await r.json()).id}
  try{lsSet('lousa-drive-folder',id)}catch(e){}return id;
}
async function driveSaveNew(){const f=await driveFolder();return driveSave(true,f)}
async function driveSaveMenu(asCopy){
  if(!driveGuard())return;
  try{await driveToken(true);
    if(driveIdOf()&&!asCopy){await driveSave();toast('Salvo no Google Drive.');return}
    if(asCopy){const d=JSON.parse(JSON.stringify(deck));d.id=uid();d.title='Cópia de '+deck.title;openDeck(d,'')}
    await driveSaveNew();toast('Salvo no seu Google Drive, na pasta “Lousa TeX”. As próximas alterações vão para lá automaticamente.',6000);
  }catch(e){driveErr(e)}
}
function driveUnlink(){setDriveId(null);setSaveState(draftState());toast('Esta apresentação não está mais ligada ao arquivo do Drive. O arquivo continua lá.')}
function driveDisconnect(){if(D.token&&window.google&&google.accounts)try{google.accounts.oauth2.revoke(D.token,()=>{})}catch(e){}D.token=null;D.exp=0;toast('Google Drive desconectado.')}
function driveItems(){
  const linked=!!driveIdOf();
  return[{label:driveOn()?'Conectado':'Conectar ao Google Drive',checked:driveOn(),act:driveConnect,disabled:driveOn()},
    {label:'Abrir do Drive…',act:async()=>{if(!driveGuard())return;try{await driveToken(true);showHome()}catch(e){driveErr(e)}}},
    {label:'Procurar outro arquivo no Drive…',act:driveOpen},
    {label:linked?'Salvar no Drive agora':'Salvar no Drive…',act:()=>driveSaveMenu(false)},
    {label:'Salvar uma cópia no Drive…',act:()=>driveSaveMenu(true)},
    {sep:1},
    {label:'Desvincular do arquivo do Drive',act:driveUnlink,disabled:!linked},
    {label:'Desconectar a conta',act:driveDisconnect,disabled:!driveOn()},
    (!DRIVE_DEFAULT.clientId||/[?&]dev\b/.test(location.search))?{label:'Configurar…',act:driveSetupModal}:null];
}
function driveInfoModal(){
  openModal('Google Drive','<p class="hint">A conexão com o Google Drive só funciona quando o Lousa TeX está publicado num endereço da web (https), por exemplo no GitHub Pages ou no Netlify. '+
    (standalone?'Aberto como arquivo do computador, o Google não autoriza o login.':'Dentro do Claude, a página não pode carregar os scripts do Google.')+'</p><p class="hint">Depois de publicar, cadastre o endereço no Google Cloud e informe os dados em Arquivo › Google Drive › Configurar.</p>');
}
function driveSetupModal(){
  const c=driveCfg();
  openModal('Configurar o Google Drive','<p class="hint">Crie um projeto em console.cloud.google.com, ative a <b>Google Drive API</b> e a <b>Google Picker API</b>, e crie: (1) um <b>ID do cliente OAuth</b> do tipo "Aplicativo da Web", com o endereço do seu site em "Origens JavaScript autorizadas"; (2) uma <b>chave de API</b>. O número do projeto aparece no painel inicial do projeto.</p>'+
    '<label class="lab">ID do cliente OAuth<input id="dcId" value="'+esc(c.clientId)+'" placeholder="…apps.googleusercontent.com"></label>'+
    '<label class="lab">Chave de API<input id="dcKey" value="'+esc(c.apiKey)+'" placeholder="AIza…"></label>'+
    '<label class="lab">Número do projeto (App ID)<input id="dcApp" value="'+esc(c.appId)+'" placeholder="123456789012"></label>'+
    '<p class="hint">O Lousa TeX pede só a permissão <code>drive.file</code>: ele enxerga apenas os arquivos que você abrir pelo seletor ou que ele mesmo criar.</p>'+
    (driveHosted()?'':'<p class="hint err">Este endereço ('+esc(location.protocol==='file:'?'arquivo local':'página do Claude')+') não pode usar o Drive. Publique o site primeiro.</p>')+
    '<div class="btns"><button type="button" class="btn primary" id="dcSave">Salvar</button></div>',
    {mount:b=>{b.querySelector('#dcSave').onclick=()=>{prefs.driveClientId=b.querySelector('#dcId').value.trim();prefs.driveApiKey=b.querySelector('#dcKey').value.trim();prefs.driveAppId=b.querySelector('#dcApp').value.trim();
      savePrefs();D.tc=null;D.token=null;closeModal();toast('Configuração do Drive salva.')}}});
}
/* "Abrir com" e "Novo" vindos do próprio Google Drive (integração da interface do Drive) */
function driveBoot(){
  if(!driveHosted())return;let st=null;
  try{const q=new URLSearchParams(location.search).get('state');if(q)st=JSON.parse(q)}catch(e){}
  if(!st)return;try{history.replaceState(null,'',location.pathname)}catch(e){}
  if(!driveReady()){driveSetupModal();return}
  const create=st.action==='create';
  openModal('Google Drive','<p class="hint">'+(create?'Criar uma apresentação nova na pasta do Drive.':'Abrir no Lousa TeX o arquivo escolhido no Drive.')+'</p><div class="btns"><button type="button" class="btn primary" id="dbGo">Conectar e continuar</button></div>',
    {mount:b=>{b.querySelector('#dbGo').onclick=async()=>{closeModal();try{await driveToken(true);
      if(create){newDeck();await driveSave(true,st.folderId);toast('Apresentação criada no Drive.')}else if(st.ids&&st.ids[0])await driveOpenId(st.ids[0])}catch(e){driveErr(e)}}}});
}
