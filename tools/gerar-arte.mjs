// Gera as figuras de fundo da página inicial a partir do TikZ e do LaTeX em src/art/.
// Uso: node tools/gerar-arte.mjs <url-da-página-de-teste> <url-base-do-tikzjax>
// A página de teste é o index.html com window.__A = {compileTikz, tikzPost, tikzOpts} exposto
// e window.__TIKZ_BASE apontando para uma cópia local do TikZJax (veja o README, seção Desenvolvimento).
import fs from 'fs';import path from 'path';import {createRequire} from 'module';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright')}catch(e){pw=require(path.join(process.env.PLAYWRIGHT_GLOBAL||'/usr/local/lib/node_modules','playwright'))}
const [page_url,tikz_base]=process.argv.slice(2);
const dir=path.join(path.dirname(new URL(import.meta.url).pathname),'..','src','art');
const b=await pw.chromium.launch();const p=await b.newPage();
await p.goto(page_url);await p.waitForFunction(()=>window.__A&&window.MathJax&&MathJax.tex2svg,null,{timeout:90000});
const fonts=new Set();
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.tex')&&f!=='equacoes.tex')){
  const src=fs.readFileSync(path.join(dir,f),'utf8');
  const pk=(src.match(/^%\s*pacotes:\s*(.+)$/m)||[])[1]||'',lb=(src.match(/^%\s*bibliotecas:\s*(.+)$/m)||[])[1]||'';
  const code=src.split('\n').filter(l=>!/^%/.test(l)).join('\n');
  const r=await p.evaluate(async ([code,pk,lb])=>{const o=__A.tikzOpts({pkgs:pk?pk.split(',').map(s=>s.trim()):[],libs:lb});const raw=await __A.compileTikz(code,o);return __A.tikzPost(raw)},[code,pk,lb]);
  r.fonts.forEach(x=>fonts.add(x));
  fs.writeFileSync(path.join(dir,f.replace('.tex','.svg')),r.svg);console.log('tikz',f,r.vw.toFixed(1)+'x'+r.vh.toFixed(1),r.fonts.join(' '));
}
const blocks=fs.readFileSync(path.join(dir,'equacoes.tex'),'utf8').split(/\n\s*\n/).map(b=>b.split('\n').filter(l=>!/^%/.test(l))).filter(b=>b.length>1);
for(const [name,...tex] of blocks){
  const svg=await p.evaluate(t=>{const n=MathJax.tex2svg(t,{display:true});const s=n.querySelector('svg');s.removeAttribute('style');return s.outerHTML},tex.join('\n'));
  fs.writeFileSync(path.join(dir,'eq-'+name.trim()+'.svg'),svg);console.log('latex',name);
}
let css='';
for(const n of fonts){const r=await fetch(tikz_base+'fonts/'+n+'.woff2');if(!r.ok)continue;const b64=Buffer.from(await r.arrayBuffer()).toString('base64');css+='@font-face{font-family:'+n+';src:url(data:font/woff2;base64,'+b64+') format("woff2")}\n'}
fs.writeFileSync(path.join(dir,'fontes.css'),css);console.log('fontes',[...fonts].join(' '));
await b.close();
