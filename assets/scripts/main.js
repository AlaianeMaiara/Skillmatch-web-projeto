/**
 * main.js
 * ------------------------------------------------------------
 * Ponto de entrada da aplicação. Único script carregado
 * diretamente pelo index.html (via <script type="module">).
 *
 * Papel: orquestrar a busca dos dados (assíncrona) e acionar a
 * troca de estado da tela (carregando -> pronto | erro).
 */

import { getVagas } from "./dados.js";
import { iniciarUI, mostrarCarregando, mostrarErro, mostrarConteudoPronto } from "./ui.js";

/**
 * Função async porque precisa "esperar" (await) o fetch das vagas
 * antes de decidir o que mostrar na tela.
 */
async function iniciarAplicacao() {
  mostrarCarregando();

  try {
    const vagas = await getVagas();
    mostrarConteudoPronto();
    iniciarUI(vagas);
  } catch (erro) {
    // Qualquer falha no fetch (arquivo não encontrado, sem conexão,
    // CORS bloqueado por abrir via file:// etc.) cai aqui.
    console.error("Falha ao carregar vagas:", erro);
    mostrarErro();
  }
}

// Permite tentar novamente sem precisar recarregar a página inteira.
document
  .querySelector("#botao-tentar-novamente")
  .addEventListener("click", iniciarAplicacao);

iniciarAplicacao();
