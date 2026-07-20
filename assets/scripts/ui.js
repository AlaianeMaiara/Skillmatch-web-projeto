/**
 * ui.js
 * ------------------------------------------------------------
 * Camada de TELA (View). Escuta eventos, lê e valida o formulário,
 * desenha os cards via createElement/classList e alterna entre os
 * três estados da aplicação (carregando / erro / pronto). Não
 * decide regra de negócio — só pergunta pro motor.js (e pra cada
 * Vaga) e desenha a resposta.
 */

import {
  encontrarMelhoresVagas,
  encontrarMelhorVaga,
  gerarRecomendacaoDeEstudo,
  obterTotalDeAnalises
} from "./motor.js";

import { salvarCandidato, carregarCandidato } from "./dados.js";

// --- Referências ao DOM ---------------------------------------

const estadoCarregando = document.querySelector("#estado-carregando");
const estadoErro = document.querySelector("#estado-erro");
const conteudoPronto = document.querySelector("#conteudo-pronto");

const formulario = document.querySelector("#form-busca");
const formErro = document.querySelector("#form-erro");
const inputNome = document.querySelector("#input-nome");
const inputArea = document.querySelector("#input-area");
const inputExperiencia = document.querySelector("#input-experiencia");
const inputSkills = document.querySelector("#input-skills");
const perfilResumo = document.querySelector("#perfil-resumo");
const listaResultados = document.querySelector("#lista-resultados");
const mensagemVazia = document.querySelector("#mensagem-vazia");
const contadorResultados = document.querySelector("#contador-resultados");
const recomendacaoEstudo = document.querySelector("#recomendacao-estudo");
const contadorAnalises = document.querySelector("#contador-analises");

// --- Persistência (localStorage) — RF14 ---------------------------

function extrairSkillsDoInput(textoBruto) {
  return textoBruto
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

function lerCandidatoDoFormulario() {
  return {
    nome: inputNome.value.trim(),
    area: inputArea.value.trim(),
    habilidades: extrairSkillsDoInput(inputSkills.value),
    experienciaMeses: Number(inputExperiencia.value) || 0
  };
}

function preencherFormularioComCandidato(candidato) {
  inputNome.value = candidato.nome ?? "";
  inputArea.value = candidato.area ?? "";
  inputExperiencia.value = candidato.experienciaMeses ?? "";
  inputSkills.value = (candidato.habilidades ?? []).join(", ");
}

// --- RF10: validação do formulário ---------------------------------

/**
 * Marca/desmarca um campo como inválido (aria-invalid), o que também
 * é usado pelo CSS para destacar a borda do campo com problema.
 */
function marcarValidacaoDoCampo(input, valido) {
  input.setAttribute("aria-invalid", valido ? "false" : "true");
}

/**
 * Valida os campos obrigatórios do candidato. Devolve um array de
 * mensagens de erro (vazio se tudo estiver certo). Cada campo
 * inválido também recebe aria-invalid="true" para leitores de tela.
 */
function validarCandidato(candidato) {
  const erros = [];

  marcarValidacaoDoCampo(inputNome, candidato.nome.length > 0);
  if (candidato.nome.length === 0) {
    erros.push("Informe seu nome.");
  }

  marcarValidacaoDoCampo(inputArea, candidato.area.length > 0);
  if (candidato.area.length === 0) {
    erros.push("Informe sua área de atuação.");
  }

  marcarValidacaoDoCampo(inputSkills, candidato.habilidades.length > 0);
  if (candidato.habilidades.length === 0) {
    erros.push("Liste ao menos uma skill, separada por vírgula.");
  }

  return erros;
}

/**
 * Exibe a lista de erros na região acessível (role="alert" já está
 * no HTML, então o leitor de tela anuncia automaticamente quando o
 * texto muda) e move o foco para o primeiro campo com problema.
 */
function exibirErrosDeValidacao(erros) {
  if (erros.length === 0) {
    formErro.hidden = true;
    formErro.textContent = "";
    return;
  }

  formErro.hidden = false;
  formErro.textContent = erros.join(" ");

  const primeiroCampoInvalido = formulario.querySelector('[aria-invalid="true"]');
  primeiroCampoInvalido?.focus();
}

// --- Controle de estado da tela ---------------------------------

export function mostrarCarregando() {
  estadoCarregando.hidden = false;
  estadoErro.hidden = true;
  conteudoPronto.hidden = true;
}

export function mostrarErro() {
  estadoCarregando.hidden = true;
  estadoErro.hidden = false;
  conteudoPronto.hidden = true;
}

export function mostrarConteudoPronto() {
  estadoCarregando.hidden = true;
  estadoErro.hidden = true;
  conteudoPronto.hidden = false;

  const candidatoSalvo = carregarCandidato();
  if (candidatoSalvo) {
    preencherFormularioComCandidato(candidatoSalvo);
  }
}

// --- Renderização dos resultados ---------------------------------

function formatarSalario(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarExperiencia(meses) {
  if (meses <= 0) return "sem experiência prévia";
  if (meses < 12) return `${meses} mês(es) de experiência`;
  const anos = Math.floor(meses / 12);
  return `${anos} ano(s) de experiência`;
}

function exibirResumoDoPerfil(candidato) {
  perfilResumo.textContent = "";

  if (!candidato.nome) {
    perfilResumo.hidden = true;
    return;
  }

  perfilResumo.hidden = false;

  const nomeForte = document.createElement("strong");
  nomeForte.textContent = candidato.nome;
  perfilResumo.appendChild(nomeForte);

  const detalhes = document.createTextNode(
    `${candidato.area ? ` · ${candidato.area}` : ""} · ${formatarExperiencia(candidato.experienciaMeses)}`
  );
  perfilResumo.appendChild(detalhes);
}

function classeDaClassificacao(classificacao) {
  const mapaClassificacaoParaClasseCSS = {
    Alta: "badge--alta",
    Média: "badge--media",
    Baixa: "badge--baixa"
  };
  return mapaClassificacaoParaClasseCSS[classificacao] ?? "badge--baixa";
}

/** Cria uma <span> de tag (skill em comum ou faltante) via createElement. */
function criarTagDeSkill(skill, ehSkillEmComum) {
  const tag = document.createElement("span");
  tag.classList.add("tag", ehSkillEmComum ? "tag--match" : "tag--gap");
  tag.textContent = skill;
  return tag;
}

/**
 * Monta o card de UMA vaga inteiramente via createElement/classList
 * (RF11) — nenhum HTML é escrito à mão, tudo é construído em tempo
 * de execução a partir do objeto `resultado`.
 */
function criarCardVaga(resultado, ehMelhorVaga) {
  const { vaga, percentual, emComum, faltando, classificacao } = resultado;

  const card = document.createElement("li");
  card.classList.add("card-vaga");
  if (ehMelhorVaga) card.classList.add("card-vaga--melhor");
  card.style.setProperty("--compatibilidade", `${percentual}%`);

  if (ehMelhorVaga) {
    const selo = document.createElement("p");
    selo.classList.add("card-vaga__selo");
    selo.textContent = "★ Melhor combinação";
    card.appendChild(selo);
  }

  const cabecalho = document.createElement("div");
  cabecalho.classList.add("card-vaga__cabecalho");

  const titulo = document.createElement("h3");
  titulo.classList.add("card-vaga__titulo");
  titulo.textContent = vaga.getRotulo();

  const percentualSpan = document.createElement("span");
  percentualSpan.classList.add("card-vaga__percentual");
  percentualSpan.append(`${percentual}% `);

  const badge = document.createElement("span");
  badge.classList.add("badge", classeDaClassificacao(classificacao));
  badge.textContent = classificacao;
  percentualSpan.appendChild(badge);

  cabecalho.append(titulo, percentualSpan);
  card.appendChild(cabecalho);

  const detalhes = document.createElement("dl");
  detalhes.classList.add("card-vaga__detalhes");
  const paresDetalhe = [
    ["Empresa", vaga.empresa],
    ["Modalidade", vaga.modalidade],
    ["Salário", formatarSalario(vaga.salario)]
  ];
  paresDetalhe.forEach(([rotulo, valor]) => {
    const dt = document.createElement("dt");
    dt.textContent = rotulo;
    const dd = document.createElement("dd");
    dd.textContent = valor;
    detalhes.append(dt, dd);
  });
  card.appendChild(detalhes);

  const barra = document.createElement("div");
  barra.classList.add("card-vaga__barra");
  barra.setAttribute("role", "img");
  barra.setAttribute("aria-label", `Compatibilidade de ${percentual}%`);
  const barraPreenchida = document.createElement("div");
  barraPreenchida.classList.add("card-vaga__barra-preenchida");
  barra.appendChild(barraPreenchida);
  card.appendChild(barra);

  const skills = document.createElement("div");
  skills.classList.add("card-vaga__skills");
  emComum.forEach((skill) => skills.appendChild(criarTagDeSkill(skill, true)));
  faltando.forEach((skill) => skills.appendChild(criarTagDeSkill(skill, false)));
  card.appendChild(skills);

  return card;
}

function limparResultados() {
  listaResultados.innerHTML = "";
}

/**
 * RF13 — estado "vazio": distingue o texto de "ainda não pesquisei"
 * do texto de "pesquisei e não achei nada", já que são situações
 * diferentes para quem está usando a página.
 */
function renderizarResultados(resultados, buscaFoiFeita) {
  limparResultados();

  const houveResultados = resultados.length > 0;
  mensagemVazia.hidden = houveResultados;
  mensagemVazia.textContent = !buscaFoiFeita
    ? 'Digite suas skills acima e clique em "Encontrar vagas" para ver os resultados aqui.'
    : "Nada encontrado: nenhuma vaga bateu com essas skills.";

  contadorResultados.textContent = houveResultados
    ? `${resultados.length} vaga(s) encontrada(s)`
    : "";

  const melhorVaga = encontrarMelhorVaga(resultados);

  resultados.forEach((resultado) => {
    const ehMelhorVaga = melhorVaga !== null && resultado.vaga.id === melhorVaga.vaga.id;
    listaResultados.appendChild(criarCardVaga(resultado, ehMelhorVaga));
  });

  recomendacaoEstudo.textContent = gerarRecomendacaoDeEstudo(resultados) ?? "";
  recomendacaoEstudo.hidden = !houveResultados;

  contadorAnalises.textContent = `Análises feitas nesta sessão: ${obterTotalDeAnalises()}`;
}

function lidarComEnvioDoFormulario(evento, vagas) {
  evento.preventDefault(); // RF10: impede o reload padrão do form

  const candidato = lerCandidatoDoFormulario();
  const erros = validarCandidato(candidato);

  if (erros.length > 0) {
    exibirErrosDeValidacao(erros);
    return; // não busca nem salva nada enquanto o formulário for inválido
  }

  exibirErrosDeValidacao([]); // limpa erros de uma tentativa anterior

  salvarCandidato(candidato);
  exibirResumoDoPerfil(candidato);

  const resultados = encontrarMelhoresVagas(candidato, vagas, {
    percentualMinimo: 1
  });

  renderizarResultados(resultados, true);
}

/**
 * Ponto de entrada da camada de UI. Recebe as vagas (já em
 * instâncias de Vaga/VagaFrontEnd) e liga os eventos da página.
 */
export function iniciarUI(vagas) {
  formulario.addEventListener("submit", (evento) =>
    lidarComEnvioDoFormulario(evento, vagas)
  );

  if (inputSkills.value.trim().length > 0) {
    formulario.dispatchEvent(new Event("submit"));
  }
}
