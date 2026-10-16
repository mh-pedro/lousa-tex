# Lousa TeX

**Editor de apresentações no navegador, no estilo do Google Apresentações, com LaTeX nativo e editável.**

🔗 **Usar agora:** https://mh-pedro.github.io/lousa-tex/

As fórmulas não viram imagem: continuam texto LaTeX que você pode editar a qualquer momento, inclusive dentro de tabelas, gráficos e diagramas. Não precisa instalar nada nem criar conta. Tudo roda no seu navegador.

---

## Sumário

- [O que a ferramenta faz](#o-que-a-ferramenta-faz)
- [Primeiros passos](#primeiros-passos)
- [Escrevendo LaTeX](#escrevendo-latex)
- [Pacotes LaTeX](#pacotes-latex)
- [Diagramas TikZ](#diagramas-tikz)
- [Gráficos, tabelas e imagens](#gráficos-tabelas-e-imagens)
- [Citações, referências e equações numeradas](#citações-referências-e-equações-numeradas)
- [Animações e transições](#animações-e-transições)
- [Apresentando](#apresentando)
- [Salvar, abrir e exportar](#salvar-abrir-e-exportar)
- [Google Drive](#google-drive)
- [Aparência](#aparência)
- [Atalhos](#atalhos)
- [Perguntas frequentes](#perguntas-frequentes)
- [Para desenvolvedores](#para-desenvolvedores)

---

## O que a ferramenta faz

| Área | Recursos |
|---|---|
| **Edição** | Caixas de texto, formas, linhas e conectores que grudam nas formas, tabelas com células mescladas, imagens com corte e máscara, vídeo e áudio, desenho à mão livre, agrupar, alinhar, distribuir, guias, réguas e grade |
| **LaTeX** | `$…$` na linha e `$$…$$` em destaque, ambientes do AMS, macros próprias no preâmbulo, pacotes extras (physics, mathtools, braket…) e importação de arquivos `.sty` |
| **Diagramas** | TikZ compilado no próprio navegador, com modelos de Feynman (tikz-feynman), pgfplots, tikz-cd e 3D |
| **Ciência** | Gráficos de funções com legendas em LaTeX, citações do INSPIRE-HEP ou BibTeX, numeração automática de equações, blocos no estilo Beamer, sumário automático |
| **Apresentação** | Tela cheia, visualização do apresentador com cronômetro e anotações, laser com rastro, caneta, marca-texto, texto sobre o slide, lupa, câmera, gravação em vídeo |
| **Exportação** | LaTeX Beamer, PowerPoint (.pptx), PDF pela impressão, arquivo próprio `.lousa.json` |
| **Armazenamento** | Salvamento automático no navegador, histórico de versões e Google Drive (opcional) |

---

## Primeiros passos

1. Abra https://mh-pedro.github.io/lousa-tex/. Na primeira vez aparece uma apresentação de exemplo; edite ou apague à vontade.
2. **Novo slide:** botão `+` no canto superior esquerdo ou `Ctrl+M`. A setinha ao lado do `+` escolhe o layout.
3. **Escrever:** clique duas vezes numa caixa de texto. Clicar duas vezes numa área vazia cria uma caixa nova.
4. **Inserir:** pelo menu **Inserir** ou pela barra de ferramentas (texto, imagem, forma, linha, tabela, equação, link, comentário).
5. **Formatar:** selecione o elemento e use a barra de cima, ou **Formatar › Opções de formato** para o painel lateral completo.
6. **Tema:** botão **Tema** na barra (com nada selecionado) troca cores e fontes de toda a apresentação.
7. **Apresentar:** `F5` ou o botão **Apresentar**.

Tudo é salvo sozinho no navegador. Para ver todas as suas apresentações, use **Arquivo › Abrir** (`Ctrl+O`).

> 💡 **Dica:** `Alt+/` abre a pesquisa nos menus. Digite o que quer fazer ("tabela", "laser", "beamer") e aperte Enter.

---

## Escrevendo LaTeX

Dentro de qualquer caixa de texto ou célula de tabela:

| Você digita | Resultado |
|---|---|
| `A energia é $E = mc^2$.` | fórmula no meio da frase |
| `$$\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}$$` | equação em destaque, centralizada |
| `$$\begin{aligned} a &= b + c \\ d &= e \end{aligned}$$` | equações alinhadas |
| `$$\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$$` | matriz |

- Enquanto você digita, aparece uma **prévia** da fórmula. Ao sair da caixa, ela é renderizada.
- `Ctrl+Shift+M` insere uma equação na linha. O botão **Σ** abre uma paleta de símbolos, onde você também pode guardar **seus próprios atalhos**.
- Para escrever um cifrão comum, use `\$`.

### Macros próprias

No painel **Tema**, em **Preâmbulo**, defina macros que valem na apresentação inteira:

```latex
\newcommand{\ket}[1]{\left|#1\right\rangle}
\newcommand{\dd}{\mathrm{d}}
\DeclareMathOperator{\Tr}{Tr}
```

---

## Pacotes LaTeX

Abra **Ferramentas › Pacotes LaTeX…**.

**Extensões prontas:** marque para ativar `physics`, `mathtools`, `gensymb`, `upgreek`, `centernot`, `extpfeil`, `empheq`, `bussproofs` ou `colortbl`.

**Importar seu próprio pacote:** cole o código, abra arquivos `.sty`/`.tex` (vários de uma vez; os `\input` entre eles são juntados) ou baixe por endereço (links do GitHub e do jsDelivr funcionam).

Para cada pacote importado você escolhe onde ele vale:

- **Equações e textos:** o programa aproveita as definições compatíveis com o MathJax (`\newcommand`, `\def`, `\DeclareMathOperator`, `\newenvironment`, `\let`).
- **Todos os diagramas TikZ:** o pacote inteiro entra no LaTeX dos diagramas, inclusive código interno com `@` e condicionais.

Na exportação para Beamer, todos os pacotes importados vão para o preâmbulo.

---

## Diagramas TikZ

**Inserir › Diagrama TikZ** traz modelos prontos:

- Diagramas de Feynman (`tikz-feynman`)
- Gráficos com `pgfplots`
- Diagramas comutativos (`tikz-cd`)
- Figuras 3D (`tikz-3dplot`)
- Um diagrama em branco

Clique duas vezes no diagrama para abrir o código no painel lateral. Edite e aperte **Compilar** ou `Ctrl+Enter`. Enquanto compila, aparece um círculo girando sobre o diagrama.

- O LaTeX roda **dentro do navegador** (TikZJax). A primeira compilação baixa cerca de 6 MB, que depois ficam no cache.
- **"Desenhar o preto com a cor do texto"** faz o diagrama acompanhar o tema (útil em fundo escuro).
- Bibliotecas TikZ (`arrows.meta`, `calc`, `decorations.pathmorphing`…) vão no campo **Bibliotecas**.

---

## Gráficos, tabelas e imagens

**Gráficos** (**Inserir › Gráfico**): barras, linhas, dispersão, pizza e **gráfico de função**. No gráfico de função, escreva uma expressão por linha com a legenda em LaTeX depois de `|`:

```
sin(x)/x | $\operatorname{sinc}(x)$
cos(x)*exp(-x^2/40) | $\cos x\; e^{-x^2/40}$
```

Funções aceitas: `sin cos tan exp log ln sqrt abs`, hiperbólicas como `sinh`, `floor` e outras, potência com `^`, constantes `pi` e `e`. Também dá para usar escala logarítmica.

**Tabelas:** clique na tabela para selecioná-la e clique de novo numa célula para escrever. Arraste ou use `Shift+clique` para selecionar várias células e mesclar. Dados copiados de uma planilha e colados no slide viram tabela.

**Imagens:**

- Cole com `Ctrl+V` (de sites, do Google Apresentações, de prints de tela), arraste de outra aba ou do computador, ou use **Inserir › Imagem**.
- Clique duas vezes na imagem para **cortar**.
- Máscaras (círculo, estrela, coração…) ficam no clique com o botão direito.

---

## Citações, referências e equações numeradas

**Inserir › Citação e referências…** busca artigos no **INSPIRE-HEP** (por número arXiv, DOI ou texto) ou importa **BibTeX**.

No texto:

```latex
Como mostrado em \cite{Ellis:2008gg}, a relação de dispersão
$$E^2 = p^2 + m^2 + \eta \frac{p^3}{M_P} \label{eq:disp}$$
modificada em \eqref{eq:disp} implica...
```

- `\cite{chave}` vira `[1]`. Os números seguem a ordem em que aparecem nos slides.
- `\label{eq:x}` numera a equação e `\eqref{eq:x}` cita o número. Tudo se renumera sozinho quando você muda slides de lugar.
- **Inserir › Slide de referências** monta a lista no fim. **Inserir › Sumário automático** cria um índice a partir dos títulos.
- **Inserir › Bloco** insere blocos no estilo Beamer: teorema, definição, exemplo, alerta.

---

## Animações e transições

- Selecione um elemento e clique em **Animar**. "Por parágrafo" revela os tópicos de uma lista um a um.
- No painel de animação você ajusta ordem, início (ao clicar, junto ou depois), duração e atraso.
- **Transições entre slides:** desaparecer, deslizar, zoom e **Transformar (Morph)**. Para o Morph:
  1. Duplique um slide (`Ctrl+D` com nada selecionado).
  2. Mude posições, tamanhos ou textos no slide novo.
  3. Escolha a transição **Transformar**. Os elementos correspondentes deslizam de um slide para o outro.

---

## Apresentando

| Como | Atalho |
|---|---|
| Apresentar deste slide | `F5` ou `Ctrl+Enter` |
| Apresentar do início | `Shift+F5` |
| Visualização do apresentador (anotações, cronômetro, próximo slide) | `Ctrl+Alt+P` |

### Ferramentas durante a apresentação

A barra de ferramentas fica escondida e aparece quando o mouse passa pela parte de baixo da tela.

| Tecla | Ferramenta |
|---|---|
| `L` | **Laser.** Segure o botão do mouse e arraste para deixar um rastro |
| `M` | Marca o ponto onde você clicar |
| `D` | Caneta |
| `H` | Marca-texto |
| `T` | Texto escrito por cima do slide |
| `X` | Borracha |
| `Z` | Lupa (clique numa região para ampliar; clique de novo para voltar) |
| `B` ou `.` | Tela preta |
| `N` | Mostrar anotações do apresentador |
| número + `Enter` | Ir direto para aquele slide |
| `Esc` | Voltar à seta normal ou sair |

As anotações feitas durante a apresentação podem ser salvas nos slides ao terminar. Também dá para ligar a **câmera** (sua imagem num canto) e **gravar** a apresentação em vídeo com a sua voz, pelo menu ao lado do botão **Apresentar**.

---

## Salvar, abrir e exportar

| Ação | Onde |
|---|---|
| Salvar | Automático, no navegador. `Ctrl+S` baixa o arquivo `.lousa.json` |
| Abrir outra apresentação | **Arquivo › Abrir** (`Ctrl+O`) |
| Histórico de versões | **Arquivo › Histórico de versões** (`Ctrl+Alt+Shift+H`) |
| LaTeX Beamer | **Arquivo › Fazer download › LaTeX Beamer (.tex)** (equações, TikZ, citações e pacotes incluídos) |
| PowerPoint | **Arquivo › Fazer download › PowerPoint (.pptx)** |
| PDF | **Arquivo › Imprimir** (`Ctrl+P`) e escolha "Salvar como PDF" |

> ⚠️ **Importante:** as apresentações ficam guardadas **no navegador** onde foram criadas. Se você limpar os dados do navegador ou trocar de computador, elas não vão junto. Baixe o `.lousa.json` de vez em quando ou use o Google Drive.

---

## Google Drive

Com o Drive configurado, aparecem **Arquivo › Google Drive › Conectar / Abrir / Salvar**. O login é a janela padrão do Google, e cada pessoa salva no próprio Drive. O programa só enxerga os arquivos que ele mesmo criou ou que você abrir pelo seletor do Google.

A configuração é gratuita e feita uma vez só pelo dono do site.

<details>
<summary><b>Como configurar o Google Drive</b></summary>

1. Em [console.cloud.google.com](https://console.cloud.google.com), crie um projeto. Não é preciso ativar faturamento.
2. Em **APIs e serviços › Biblioteca**, ative a **Google Drive API** e a **Google Picker API**.
3. Em **Tela de consentimento OAuth**:
   - Tipo **Externo**.
   - Escopo `.../auth/drive.file`.
   - Adicione os e-mails que vão usar como **usuários de teste**.
4. Em **Credenciais › ID do cliente OAuth**:
   - Tipo **Aplicativo da Web**.
   - Origem autorizada: `https://mh-pedro.github.io`
5. Em **Credenciais › Chave de API**:
   - Restrinja a `https://mh-pedro.github.io/*`.
   - Libere só a Drive API e a Picker API.
6. Copie o **número do projeto**, que aparece na página inicial do projeto.
7. Preencha o `config.js` deste repositório:

```js
window.LOUSA_CONFIG = {
  drive: {
    clientId: '….apps.googleusercontent.com',
    apiKey: 'AIza…',
    appId: '123456789012'
  }
};
```

Esses valores não são senhas: ficam visíveis no site, e a proteção vem da restrição ao endereço. Enquanto o app estiver em teste no Google Cloud, só os usuários de teste conseguem conectar.

</details>

---

## Aparência

- **Exibir › Aparência do programa:** Automático (segue o sistema), Padrão, Claro, Cinza, Sépia, Noturno, Azul noturno e Preto.
- **Exibir › Fundo da área de trabalho:** a cor em volta do slide (branco, cinza claro, cinza médio, grafite, preto).
- **Exibir › Mostrar conteúdo fora do slide:** o que passa da borda aparece esmaecido, com uma linha marcando o limite. Na apresentação, fica cortado.

---

## Atalhos

A lista completa fica em **Ajuda › Atalhos de teclado** (`Ctrl+/`). Os principais:

### Mouse

| Ação | Resultado |
|---|---|
| `Ctrl` + arrastar | Duplica o que está sendo arrastado |
| `Shift` + arrastar | Move só na horizontal ou vertical |
| `Alt` + arrastar | Desliga o encaixe nas guias |
| `Shift` ao redimensionar | Mantém a proporção |
| `Alt` ou `Ctrl` ao redimensionar | Redimensiona a partir do centro |
| `Alt` ao desenhar forma | Desenha a partir do centro |
| `Shift` ao girar | Gira de 15 em 15 graus |
| Espaço + arrastar, ou botão do meio | Move a área de trabalho |
| `Ctrl` + roda | Zoom |

### Teclado

| Atalho | Ação |
|---|---|
| `Ctrl+D` | Duplicar (sem seleção: duplica o slide) |
| `Ctrl+G` / `Ctrl+Shift+G` | Agrupar / desagrupar |
| `Ctrl+↑ / ↓` | Avançar / recuar camada (sem seleção: move o slide) |
| `Ctrl+Shift+↑ / ↓` | Trazer para a frente / enviar para trás |
| Setas | Mover 1 px (`Shift`: 10 px) |
| `Alt+← / →` | Girar 15° (`Shift`: 1°) |
| `Ctrl+Alt+K / J` | Aumentar / diminuir 10% |
| `Tab` / `Shift+Tab` | Selecionar o próximo / anterior objeto |
| `Ctrl+Alt+C / V` | Copiar / colar formatação |
| `Ctrl+B / I / U` | Negrito / itálico / sublinhado |
| `Ctrl+. / ,` | Sobrescrito / subscrito |
| `Ctrl+Shift+L / E / R / J` | Alinhar texto |
| `Ctrl+K` | Link |
| `Ctrl+Alt+M` | Comentário |
| `Ctrl+H` | Localizar e substituir |
| `Ctrl+0` | Ajustar o slide à tela |
| `Home` / `End` | Primeiro / último slide |

No Mac, use `Cmd` no lugar de `Ctrl` e `Option` no lugar de `Alt`.

---

## Perguntas frequentes

**Preciso de internet?**
Para abrir o site e na primeira compilação de TikZ, sim. Depois disso, a edição funciona mesmo com a conexão instável, porque tudo roda no navegador.

**Outras pessoas veem minhas apresentações?**
Não. Cada pessoa que abre o link tem as próprias apresentações, guardadas no próprio navegador ou no próprio Drive.

**A fórmula aparece em vermelho.**
É erro de LaTeX. Passe o mouse por cima para ver a mensagem. Comandos de pacotes precisam do pacote ativado em **Ferramentas › Pacotes LaTeX…**.

**O diagrama TikZ não compila.**
A mensagem de erro aparece no painel do código. Confira se as bibliotecas usadas estão no campo **Bibliotecas** e se os pacotes estão marcados.

**Funciona no celular?**
Dá para abrir e apresentar. Para editar, o computador é bem mais confortável.

---

## Para desenvolvedores

O site é um único `index.html`, gerado a partir do código em `src/`:

| Caminho | Conteúdo |
|---|---|
| `src/style.css` | Estilos da interface e dos slides |
| `src/body.html` | Estrutura da página |
| `src/js/*.js` | Código, em partes numeradas e juntadas em ordem alfabética |
| `build.py` | Junta tudo em `index.html` |
| `config.js` | Configuração do Google Drive, lida pelo site ao carregar |

Depois de editar algo em `src/`, rode:

```bash
python3 build.py
```

Faça commit do `src/` e do `index.html` juntos. O GitHub Pages publica o `main` automaticamente em um ou dois minutos.

**Bibliotecas usadas (carregadas de CDN):**

- [MathJax 3](https://www.mathjax.org/): equações
- [TikZJax](https://github.com/drgrice1/tikzjax): TikZ no navegador
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/): exportação para PowerPoint
- APIs do Google (Identity Services, Picker e Drive): integração com o Drive
