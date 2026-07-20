import { Vaga, VagaFrontEnd } from "./motor.js";
 
const CAMINHO_VAGAS = "./assets/dados/vagas.json";
 
const CHAVE_LOCALSTORAGE_CANDIDATO = "skillmatch:candidato";

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
 
export function salvarCandidato(candidato) {
  localStorage.setItem(CHAVE_LOCALSTORAGE_CANDIDATO, JSON.stringify(candidato));
}

export function carregarCandidato() {
  const textoSalvo = localStorage.getItem(CHAVE_LOCALSTORAGE_CANDIDATO);
  if (textoSalvo === null) return null;
 
  try {
    return JSON.parse(textoSalvo);
  } catch {
    return null;
  }
}
 