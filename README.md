# Lousa TeX

Editor de slides no navegador, no estilo do Google Apresentações, com LaTeX nativo e editável (MathJax), diagramas TikZ (TikZJax), citações, animações, modo apresentador e exportação para Beamer e PowerPoint.

Tudo roda no navegador: não há servidor. Os arquivos ficam salvos no próprio navegador e, se configurado, no seu Google Drive.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O programa inteiro |
| `config.js` | Dados do Google Drive (preencha depois de criar o projeto no Google Cloud) |
| `.nojekyll` | Faz o GitHub Pages servir os arquivos sem processar |

## 1. Publicar no GitHub Pages

1. Entre em github.com e clique em **New repository**. Nome sugerido: `lousa-tex`. Deixe **Public** (o GitHub Pages gratuito exige repositório público).
2. Na página do repositório, clique em **Add file › Upload files** e arraste `index.html`, `config.js`, `README.md` e `.nojekyll`. Clique em **Commit changes**.
   * Se o `.nojekyll` não aparecer para arrastar (arquivos que começam com ponto ficam ocultos), crie com **Add file › Create new file**, nome `.nojekyll`, conteúdo vazio.
3. Vá em **Settings › Pages**. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em um ou dois minutos o site fica em `https://SEU-USUARIO.github.io/lousa-tex/`.

## 2. Criar o projeto no Google Cloud (uma vez só)

1. Abra console.cloud.google.com e crie um projeto (por exemplo, "Lousa TeX").
2. Em **APIs e serviços › Biblioteca**, ative **Google Drive API** e **Google Picker API**.
3. Em **APIs e serviços › Tela de consentimento OAuth** (ou **Google Auth Platform**):
   * Tipo de usuário: **Externo**.
   * Nome do app: Lousa TeX. E-mail de suporte: o seu.
   * Escopos: adicione `.../auth/drive.file` (vê só os arquivos que o próprio app abriu ou criou).
   * **Usuários de teste**: adicione o seu e-mail Google (e de quem mais for usar enquanto o app estiver em teste).
4. Em **Credenciais › Criar credenciais › ID do cliente OAuth**:
   * Tipo: **Aplicativo da Web**.
   * **Origens JavaScript autorizadas**: `https://SEU-USUARIO.github.io` (sem `/lousa-tex` e sem barra no fim).
   * Copie o **ID do cliente**.
5. Em **Credenciais › Criar credenciais › Chave de API**. Depois, em **Restringir chave**:
   * Restrição de aplicativo: **Referenciadores HTTP**, com `https://SEU-USUARIO.github.io/*`.
   * Restrição de API: **Google Picker API** e **Google Drive API**.
   * Copie a chave.
6. Na página inicial do projeto, copie o **Número do projeto** (só dígitos).

## 3. Ligar o Drive no site

No GitHub, abra `config.js`, clique no lápis (editar), preencha os três campos e faça **Commit changes**:

```js
window.LOUSA_CONFIG = {
  drive: {
    clientId: '1234567890-abc...apps.googleusercontent.com',
    apiKey: 'AIza...',
    appId: '1234567890'
  }
};
```

Espere um minuto, recarregue o site e use **Arquivo › Google Drive › Conectar**. Os arquivos são salvos como `.lousa` no Drive; **Arquivo › Google Drive › Abrir** mostra o seletor do Google.

Alternativa sem editar o `config.js`: **Arquivo › Google Drive › Configurar…** dentro do site (vale só para o navegador onde você preencher).

## 4. Atualizar o programa

Quando houver uma nova versão, substitua só o `index.html` no repositório (**Add file › Upload files**, mesmo nome). O `config.js` continua valendo.

## Observações

* Enquanto o app estiver em modo de teste no Google Cloud, só os usuários de teste conseguem conectar. Para uso próprio isso basta. Para abrir a qualquer conta Google, publique o app na tela de consentimento (o escopo `drive.file` não exige verificação de segurança, mas o Google pode pedir verificação da marca).
* Diagramas TikZ baixam o TeX do jsDelivr na primeira compilação (cerca de 6 MB) e depois ficam no cache do navegador.
* O ID do cliente e a chave de API não são senhas: eles aparecem para qualquer pessoa que abrir o site, e a proteção vem das restrições de origem configuradas acima.
