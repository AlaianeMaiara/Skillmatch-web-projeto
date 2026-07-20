# SkillConect

**SkillConect** compara o perfil de um candidato (skills, área e
experiência) com um catálogo de vagas e mostra, para cada uma, o
percentual de compatibilidade, o que já bate e o que falta aprender —
além de apontar a vaga mais compatível e sugerir uma recomendação de
estudo.

## Problema que resolve

Quem está buscando uma vaga de tecnologia geralmente não sabe **quão
perto** está de atender os requisitos de cada oportunidade, nem
**o que estudar primeiro** para aumentar suas chances. O SkillConect
resolve isso comparando as habilidades informadas pelo candidato com
os requisitos de cada vaga do catálogo, calculando um percentual de
compatibilidade e destacando exatamente quais skills estão faltando —
transformando uma busca de emprego às cegas em uma decisão orientada
por dado.

## Tecnologias utilizadas

- **HTML5 semântico** — landmarks, formulário acessível, SEO on-page
- **CSS3** — mobile-first, Flexbox, `clamp()`, media queries, sem framework
- **JavaScript (ES2022+)** — módulos ES (`import`/`export`), classes
  com herança, closures, callbacks, `fetch`/`async`/`await`, `localStorage`
- Sem build step, sem dependências de terceiros, sem back-end — roda
  100% no navegador a partir de arquivos estáticos

### Arquitetura (dados / lógica / interface)

```
skillmatch-web/
├── index.html                    # estrutura semântica + 3 estados (carregando/erro/pronto)
├── README.md
└── assets/
    ├── dados/
    │   └── vagas.json            # catálogo de vagas
    ├── img/
    │   └── logo.svg               # logo (imagem do RF09)
    ├── styles/
    │   └── index.style.css       # mobile-first, Flexbox
    └── scripts/
        ├── dados.js               # fetch das vagas + localStorage do candidato
        ├── motor.js                # classes Vaga/VagaFrontEnd (POO) + regras de compatibilidade
        ├── ui.js                     # formulário, validação, render dos cards, estados de tela
        └── main.js                # ponto de entrada (<script type="module">)
```

- **`dados.js`** cuida de tudo que vem de fora da aplicação: busca o
  catálogo de vagas (`fetch`) e lê/grava o perfil do candidato
  (`localStorage`).
- **`motor.js`** é o "cérebro": as classes `Vaga`/`VagaFrontEnd` e as
  funções de compatibilidade, classificação, melhor vaga e
  recomendação de estudo. Não depende do DOM — poderia rodar em
  qualquer ambiente JavaScript.
- **`ui.js`** é a "tela": lê e valida o formulário, chama o motor, e
  desenha os cards no DOM via `createElement`/`classList`.
- **`main.js`** conecta as três peças acima e controla os estados
  carregando/erro/pronto.

### Modelagem (POO)

`Vaga` é a classe base: guarda os dados da vaga e sabe calcular sua
própria compatibilidade com um candidato. `VagaFrontEnd extends Vaga`
acrescenta um atributo `stack` e **sobrescreve** o cálculo de
compatibilidade para dar um bônus quando o candidato domina a stack
específica pedida pela vaga — um diferencial real que a conta genérica
de requisitos não captura.

## Como executar

O app usa `fetch()` para carregar `vagas.json`, e o navegador bloqueia
esse tipo de requisição quando a página é aberta por duplo clique
(`file://`, política de CORS). Por isso, **é preciso abrir por um
servidor local**:

- **VS Code**: instale a extensão **Live Server** → botão "Go Live"
- **Terminal**: `python3 -m http.server 8000` dentro da pasta do
  projeto, depois acesse `http://localhost:8000`

Nenhuma instalação de dependências é necessária (`npm install` não é
usado neste projeto).

## Regra de compatibilidade

Para cada vaga: `compatibilidade (%) = (skills do candidato que a vaga
exige) ÷ (total de skills exigidas pela vaga) × 100`, arredondado —
mais o bônus de stack, se a vaga for `VagaFrontEnd`. Empates no
percentual são desempatados comparando a experiência do candidato
(`experienciaMeses`) com a experiência tipicamente exigida pela vaga
(`senioridadeMeses`).

Classificação: **Alta** (80–100%) · **Média** (50–79%) · **Baixa** (0–49%).

## Qualidade e performance (Lighthouse)

O projeto foi auditado com o Lighthouse (Chrome DevTools) e ajustado
em cima dos resultados:

- **Acessibilidade — contraste de cor**: todas as combinações de
  texto/fundo do CSS foram conferidas (cálculo de contraste WCAG) e
  ajustadas para atingir no mínimo **4.5:1** (padrão AA).
- **Performance — fonte bloqueando renderização**: a folha de estilo
  da Google Fonts é carregada com a técnica `media="print"` +
  `onload` (não bloqueia a primeira renderização da página) e com
  `rel="preconnect"` para os domínios de fonte.
- **Itens sinalizados como "fora da pontuação"** (tamanho do DOM,
  minificação de CSS, bfcache) foram deixados como estão, por não
  impactarem a nota e/ou não valerem a complexidade extra para o
  porte do projeto.

## Melhorias futuras

- Trocar o catálogo estático (`vagas.json`) por uma API real de vagas
- Adicionar filtro/ordenação por modalidade, salário ou compatibilidade
- Tema claro/escuro persistido em `localStorage`
- Deploy no GitHub Pages para acesso via link direto (resolve também
  a exigência de servidor, já que passa a servir via `https`)
- Testes automatizados para as funções de `motor.js` (é a peça mais
  fácil de testar isoladamente, por não depender do DOM)
