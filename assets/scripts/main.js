import { getVagas } from "./dados.js";
import { iniciarUI, mostrarCarregando, mostrarErro, mostrarConteudoPronto } from "./ui.js";
 

async function iniciarAplicacao() {
  mostrarCarregando();
 
  try {
    const vagas = await getVagas();
    mostrarConteudoPronto();
    iniciarUI(vagas);
  } catch (erro) {
    
    console.error("Falha ao carregar vagas:", erro);
    mostrarErro();
  }
}
 
document
  .querySelector("#botao-tentar-novamente")
  .addEventListener("click", iniciarAplicacao);
 
iniciarAplicacao();
