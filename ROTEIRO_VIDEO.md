# Roteiro de fala — vídeo de entrega do SkillConect

> Tempo alvo: ~7 minutos. Fale no seu ritmo normal — não precisa
> decorar palavra por palavra, use isso como guia. Trechos entre
> `[colchetes]` são instruções de tela, não fala.

---

## 1. Objetivo do sistema + demonstração (≈ 1min30)

"Oi, meu nome é [seu nome] e esse é o SkillConect, o projeto que
desenvolvi pro módulo de JavaScript.

A ideia do sistema é simples: quem está procurando vaga na área de
tecnologia geralmente não sabe **quão perto** está de atender os
requisitos de cada oportunidade, nem **o que estudar primeiro** pra
aumentar as chances. O SkillConect resolve isso comparando o perfil
do candidato — nome, área, experiência e as skills que ele domina —
com um catálogo de vagas, e mostrando pra cada vaga o percentual de
compatibilidade, o que já bate, e o que está faltando.

Deixa eu mostrar funcionando.

[mostrar a tela, preencher nome/área/experiência e algumas skills,
tipo 'javascript, css, html, git']

Preenchi meu perfil aqui e cliquei em 'Encontrar vagas'. Repara que
cada card mostra a empresa, o cargo, o percentual de compatibilidade
com uma classificação — Alta, Média ou Baixa — e duas listas de
skills: as que eu já tenho, em verde, e as que estão faltando, em
laranja. Essa aqui, com a estrelinha, é a vaga que o sistema
identificou como a melhor combinação pro meu perfil. E logo abaixo eu
tenho uma recomendação de estudo, calculada a partir de qual skill
mais aparece faltando entre as vagas que eu me encaixo."

---

## 2. Como executar o sistema (≈ 1 min)

"Pra rodar, é só clonar o repositório e abrir com um servidor local —
não dá pra abrir com duplo clique no `index.html`, porque o projeto
usa `fetch()` pra carregar o catálogo de vagas, e o navegador bloqueia
esse tipo de requisição quando a página é aberta direto do disco, por
causa da política de CORS.

[mostrar abrindo com Live Server ou rodando `python3 -m http.server`]

Uso a extensão Live Server do VS Code — é só clicar em 'Go Live' aqui
embaixo, e a página abre normalmente em `127.0.0.1:5500`. Também dá
pra rodar por linha de comando com `python3 -m http.server`, caso a
pessoa não use VS Code. Não precisa instalar nenhuma dependência,
não tem `npm install`, é HTML, CSS e JavaScript puro rodando 100% no
navegador."

---

## 3. Como organizei as tarefas antes de desenvolver (≈ 1min30)

"Antes de escrever a primeira linha de código, pensei na arquitetura:
separar o projeto em quatro responsabilidades bem definidas.

[pode mostrar a estrutura de pastas no VS Code enquanto fala]

Tenho o `dados.js`, que cuida de tudo que vem de fora da aplicação —
busca o catálogo de vagas com `fetch` e lê/grava o perfil do candidato
no `localStorage`. Tenho o `motor.js`, que é o cérebro: as classes
`Vaga` e `VagaFrontEnd`, e as funções que calculam compatibilidade,
classificam as vagas e geram a recomendação de estudo. Esse arquivo
não sabe que existe uma tela — ele só recebe dado e devolve resultado,
o que facilita muito testar isoladamente. Tenho o `ui.js`, que é a
tela: lê o formulário, valida, e desenha os cards no DOM. E o
`main.js`, que só conecta essas três peças e controla os estados de
carregando, erro e pronto.

Essa separação foi a primeira decisão que tomei, antes de qualquer
funcionalidade, porque ela é o que permite eu trocar uma peça — tipo
trocar de onde vêm as vagas — sem precisar mexer nas outras."

---

## 4. Quais branches criei e o objetivo de cada uma (≈ 1min15)

"Pro controle de versão, segui o fluxo com `develop` e feature
branches.

[mostrar a aba de branches no GitHub]

A `main` ficou reservada só pra versão final, já testada. Toda a
implementação aconteceu em cima da `develop`, e a partir dela criei
uma branch por bloco de funcionalidade. Por exemplo,
`feature/rf02-catalogo-vagas` pra estruturar o catálogo de vagas e o
`fetch`; `feature/rf07-poo-classes` pra implementar as classes `Vaga`
e `VagaFrontEnd` com herança; `feature/rf10-formulario-validacao` pro
formulário e a validação acessível; `feature/rf13-fetch-estados` pros
três estados de carregamento; e `feature/rf14-localstorage` pra
persistência do perfil do candidato.

Cada uma dessas branches virou um Pull Request pra `develop`, com
commits pequenos e descritivos — tipo 'implementa classe Vaga com
herança' ou 'corrige referência quebrada no ui.js' — sempre no
imperativo, poucos arquivos por commit. No final, fiz o merge de
`develop` pra `main` com o projeto já validado."

---

## 5. Bugs que enfrentei durante o desenvolvimento (≈ 1min15)

"Quero contar rapidamente 3 bugs reais que apareceram no meio do
caminho, porque acho que mostra bem o processo de debugar, não só
escrever código que funciona de primeira.

O primeiro foi depois de eu reorganizar os módulos — mudei onde
ficavam algumas funções de `localStorage`, movendo do `ui.js` pro
`dados.js`, mas esqueci de atualizar duas chamadas que ainda usavam o
nome antigo da função. Isso deu um `ReferenceError` no console — a
função simplesmente não existia mais com aquele nome. Corrigi
atualizando as duas chamadas, e depois passei a validar com uma
varredura em todos os arquivos, conferindo se todo `import` batia com
um `export` que realmente existia.

O segundo foi mais sutil: minha caixa de mensagem de erro não sumia
da tela mesmo depois das vagas carregarem com sucesso. O problema era
CSS: eu tinha declarado `display: flex` na mesma classe que eu
escondia via atributo `hidden` do HTML, e o CSS que eu escrevi
"venceu" o comportamento padrão do `hidden`, mesmo com o JavaScript
setando `hidden = true` corretamente. Resolvi adicionando uma regra
`[hidden] { display: none !important; }`, garantindo que o atributo
`hidden` sempre tenha prioridade.

O terceiro apareceu quando rodei o Lighthouse: algumas cores de texto
não tinham contraste suficiente com o fundo pra passar no critério de
acessibilidade. Calculei a taxa de contraste de cada combinação de
cor do meu CSS e escurecei as que estavam abaixo do mínimo de 4.5:1
exigido pelo padrão AA."

---

## 6. O que você acha que faltou / poderia melhorar (≈ 45s)

"Sendo honesto sobre os pontos que eu melhoraria: hoje o catálogo de
vagas é um arquivo `vagas.json` fixo — uma evolução natural seria
consumir uma API real de vagas. Também não implementei filtro ou
ordenação por modalidade ou salário, que ficaria fácil de acrescentar
já que o `motor.js` já devolve os dados calculados prontos pra isso.
E não escrevi testes automatizados — como o `motor.js` não depende do
DOM, ele seria a peça mais fácil de cobrir com testes, e é algo que eu
faria numa próxima versão.

Foi isso, obrigado[a] por assistir!"

---

## Checklist antes de gravar

- [ ] Testei o projeto do zero (clone + Live Server) pra garantir que funciona igual ao que vou mostrar
- [ ] Deixei o navegador com zoom/fonte legível pra quem assistir
- [ ] Vídeo na vertical ou horizontal, com boa iluminação e meu rosto aparecendo
- [ ] Cronometrei um ensaio — se passar de 7 minutos, corto primeiro a seção 5 dos bugs (é a mais fácil de resumir em 1 frase por bug)
- [ ] Depois de gravar: subo pro Google Drive em modo "qualquer pessoa com o link pode visualizar" e colo o link na submissão do AVA
