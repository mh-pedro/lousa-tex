/* ================= contador de visitas (GoatCounter) =================
   Conta apenas abrir o site publicado: sem cookies, sem identificar ninguém e sem ler o conteúdo das
   apresentações. O endereço vem de config.js (LOUSA_CONFIG.stats); vazio desliga. */
(function(){
  const cfg=window.LOUSA_CONFIG||{},url=typeof cfg.stats==='string'?cfg.stats:'';
  if(!url||!/^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/.test(url))return;
  if(location.protocol!=='https:'||!/\.github\.io$/.test(location.hostname))return;
  const s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter=url;
  s.dataset.goatcounterSettings=JSON.stringify({path:location.pathname});
  document.head.appendChild(s);
})();
