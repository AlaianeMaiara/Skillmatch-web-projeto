/**
 * dados.js
 * ------------------------------------------------------------
 * Tudo que envolve "trazer dado de fora da aplicação" mora aqui:
 *   1. Buscar o catálogo de vagas (fetch + async/await)
 *   2. Persistir/recuperar o perfil do candidato (localStorage)
 *
 * Nenhuma função aqui toca no DOM — quem lê o formulário e desenha
 * a tela é o ui.js. Este módulo só sabe "buscar" e "guardar".
 */

import { Vaga, VagaFrontEnd } from "./motor.js";

const CAMINHO_VAGAS = "./assets/dados/vagas.json";

// IMPORTANTE (RF14 — fronteira de segurança): só guardamos aqui
// dados que o próprio usuário digitou e que não têm valor sensível
// (nome, área, skills, meses de experiência). NUNCA guarde senhas,
// tokens de acesso ou documentos pessoais em localStorage — ele não
// é criptografado e fica acessível a qualquer script rodando na
// mesma origem da página.
const CHAVE_LOCALSTORAGE_CANDIDATO = "skillmatch:candidato";

// --- Busca das vagas (fetch + async/await) --------------------------

/**
 * Decide qual classe instanciar a partir do campo "tipo" do JSON.
 * Essa função é passada como CALLBACK para vagasJson.map() logo
 * abaixo — um exemplo explícito de callback: uma função (nomeada,
 * não anônima) entregue como argumento para outra função decidir
 * quando executá-la, uma vez para cada item do array.
 */
function criarVagaAPartirDoJSON(vagaJson) {
  if (vagaJson.tipo === "frontend") {
    return new VagaFrontEnd(
      vagaJson.id,
      vagaJson.empresa,
      vagaJson.cargo,
      vagaJson.requisitos,
      vagaJson.salario,
      vagaJson.modalidade,
      vagaJson.senioridadeMeses,
      vagaJson.stack
    );
  }

  return new Vaga(
    vagaJson.id,
    vagaJson.empresa,
    vagaJson.cargo,
    vagaJson.requisitos,
    vagaJson.salario,
    vagaJson.modalidade,
    vagaJson.senioridadeMeses
  );
}

/**
 * Busca o vagas.json e devolve um array de instâncias de Vaga
 * (algumas podem ser VagaFrontEnd, dependendo do "tipo" no JSON).
 *
 * Pode lançar um erro (throw) se a requisição falhar — quem chamar
 * essa função deve tratar com try/catch (é o que main.js faz, para
 * mostrar o estado de "erro" na tela).
 *
 * @returns {Promise<Vaga[]>}
 */
export async function getVagas() {
  const resposta = await fetch(CAMINHO_VAGAS);

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível carregar as vagas (status ${resposta.status}).`
    );
  }

  const vagasJson = await resposta.json();
  return vagasJson.map(criarVagaAPartirDoJSON);
}

// --- Persistência do candidato (localStorage) — RF14 -----------------

/**
 * Salva o objeto candidato inteiro no localStorage. localStorage só
 * guarda STRINGS, por isso usamos JSON.stringify() para transformar
 * o objeto em texto antes de guardar.
 */
export function salvarCandidato(candidato) {
  localStorage.setItem(CHAVE_LOCALSTORAGE_CANDIDATO, JSON.stringify(candidato));
}

/**
 * Recupera o candidato salvo, se existir. localStorage.getItem()
 * devolve `null` na primeira visita (nunca foi salvo nada ainda) —
 * tratamos esse caso devolvendo `null` explicitamente. JSON.parse()
 * desfaz o JSON.stringify() do momento em que foi salvo.
 */
export function carregarCandidato() {
  const textoSalvo = localStorage.getItem(CHAVE_LOCALSTORAGE_CANDIDATO);
  if (textoSalvo === null) return null;

  try {
    return JSON.parse(textoSalvo);
  } catch {
    return null;
  }
}
