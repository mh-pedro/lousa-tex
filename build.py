import glob,sys,os
ROOT=os.path.dirname(os.path.abspath(__file__))
css=open(os.path.join(ROOT,'src/style.css')).read()
body=open(os.path.join(ROOT,'src/body.html')).read()
js='\n'.join(open(f).read() for f in sorted(glob.glob(os.path.join(ROOT,'src/js/*.js'))))
FONTS='https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,700;1,400;1,700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=STIX+Two+Text:ital,wght@0,400;0,700;1,400;1,700&family=Source+Sans+3:ital,wght@0,400;0,700;1,400;1,700&family=Source+Serif+4:ital,wght@0,400;0,700;1,400;1,700&display=swap'
MJ='https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg-full.js'
def page(mj):
    return f'''<title>Lousa TeX</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>
{css}
</style>
<script>
window.mathReady=new Promise(function(r){{window.__mjResolve=r}});
window.__mjFail=function(){{window.__mjFailed=true;window.__mjResolve()}};
window.MathJax={{
  tex:{{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']],processEscapes:true}},
  svg:{{fontCache:'local'}},
  options:{{enableMenu:false,ignoreHtmlClass:'tex2jax_ignore'}},
  startup:{{typeset:false,ready:function(){{MathJax.startup.defaultReady();MathJax.startup.promise.then(function(){{window.__mjResolve()}})}}}}
}};
</script>
<script async src="{mj}" onerror="window.__mjFail()"></script>
{body}
<script>
(function(){{
{js}
}})();
</script>
'''
wrap=lambda s:'<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+s+'\n</html>\n'
import os
HEAD_SITE='<title>Lousa TeX</title>\n<link rel="manifest" href="manifest.webmanifest">\n<meta name="theme-color" content="#b25c1c">\n<link rel="icon" href="icons/icon-192.png">\n<script src="config.js"></script>'
out=wrap(page(MJ)).replace('<title>Lousa TeX</title>',HEAD_SITE,1)
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'index.html'),'w').write(out)
print('index.html gerado,',len(out),'bytes')
if len(sys.argv)>2 and sys.argv[1]=='--artifact':
    open(sys.argv[2],'w').write(page(MJ));print('versão para o Claude gerada em',sys.argv[2])
