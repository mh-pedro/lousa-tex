/* ================= página inicial ================= */
const landing=$('#landing');
const landingOn=()=>!landing.hidden;
function showLanding(){
  landing.hidden=false;landing.scrollTop=0;closePop();
  if(driveHosted()&&driveReady())driveLoad().catch(()=>{});
  setTimeout(()=>{const b=landing.querySelector('[data-ld="google"]');if(b)b.focus({preventScroll:true})},60);
}
function hideLanding(){
  landing.hidden=true;
  try{if(location.hash!=='#editor')history.replaceState(null,'',location.pathname+location.search+'#editor')}catch(e){}
  fit();
}
async function landingGoogle(btn){
  if(!driveHosted()){hideLanding();driveInfoModal();return}
  if(!driveReady()){hideLanding();driveSetupModal();return}
  landing.querySelectorAll('[data-ld="google"]').forEach(b=>b.disabled=true);
  try{await driveToken(true);showHome()}
  catch(e){driveErr(e)}
  finally{landing.querySelectorAll('[data-ld="google"]').forEach(b=>b.disabled=false)}
}
function googleStartModal(){
  const linked=!!driveIdOf();
  openModal('Conectado ao Google Drive','<p class="hint">Suas apresentações podem ficar no seu Google Drive. O que você quer fazer agora?</p>'+
    '<div class="gstart"><button type="button" class="btn primary" data-g="open">Abrir uma apresentação do Drive</button>'+
    '<button type="button" class="btn" data-g="new">Nova apresentação, salva no Drive</button>'+
    '<button type="button" class="btn" data-g="cur">Continuar “'+esc(deck.title||'Apresentação')+'”'+(linked?'':' e salvar no Drive')+'</button></div>',
    {mount:b=>b.addEventListener('click',ev=>{const t=ev.target.closest('[data-g]');if(!t)return;const g=t.dataset.g;closeModal();
      if(g==='open')driveOpen();
      else if(g==='new'){newDeck();driveSaveMenu(false)}
      else if(!linked)driveSaveMenu(false)})});
}
landing.addEventListener('click',ev=>{
  const t=ev.target.closest('[data-ld]');if(!t)return;const a=t.dataset.ld;
  if(a!=='google')ev.preventDefault();
  if(a==='google')landingGoogle(t);
  else if(a==='local')showHome();
  else if(a==='file'){hideLanding();openFileSmart()}
});
