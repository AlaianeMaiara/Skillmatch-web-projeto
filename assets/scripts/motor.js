
export class Vaga {
  constructor(id, empresa, cargo, requisitos, salario, modalidade, senioridadeMeses) {
    this.id = id;
    this.empresa = empresa;
    this.cargo = cargo;
    this.requisitos = requisitos; 
    this.salario = salario;
    this.modalidade = modalidade;
    this.senioridadeMeses = senioridadeMeses;
  }
 
  normalizar(skill) {
    return skill.trim().toLowerCase();
  }
 
  calcularCompatibilidade(habilidadesCandidato) {
    const candidatoNorm = habilidadesCandidato.map((skill) => this.normalizar(skill));
    const requisitosNorm = this.requisitos.map((skill) => this.normalizar(skill));
 
    const emComum = requisitosNorm.filter((skill) => candidatoNorm.includes(skill));
    const faltando = requisitosNorm.filter((skill) => !candidatoNorm.includes(skill));
 
    const percentual = this.requisitos.length === 0
      ? 0
      : Math.round((emComum.length / this.requisitos.length) * 100);
 
    return { vaga: this, percentual, emComum, faltando };
  }
 
  getRotulo() {
    return this.cargo;
  }
}
 
export class VagaFrontEnd extends Vaga {
  constructor(id, empresa, cargo, requisitos, salario, modalidade, senioridadeMeses, stack) {
    super(id, empresa, cargo, requisitos, salario, modalidade, senioridadeMeses);
    this.stack = stack;
  }
 
  calcularCompatibilidade(habilidadesCandidato) {
    const resultadoBase = super.calcularCompatibilidade(habilidadesCandidato);
 
    const candidatoNorm = habilidadesCandidato.map((skill) => this.normalizar(skill));
    const dominaStack = Boolean(this.stack) && candidatoNorm.includes(this.normalizar(this.stack));
    const bonus = dominaStack ? 10 : 0;
 
    return {
      ...resultadoBase,
      percentual: Math.min(100, resultadoBase.percentual + bonus),
      bonusStack: dominaStack
    };
  }
 
  getRotulo() {
    return `${this.cargo} (${this.stack})`;
  }
}
 
// --- RF08: CLOSURE ------------------------------------------------

export function criarContadorDeAnalises() {
  let total = 0;
 
  return {
    registrar() {
      total += 1;
    },
    obterTotal() {
      return total;
    }
  };
}
 
const contadorDeAnalises = criarContadorDeAnalises();
 
export function obterTotalDeAnalises() {
  return contadorDeAnalises.obterTotal();
}
 
// --- RF04: CLASSIFICAÇÃO -------------------------------------------
 
export function classificarCompatibilidade(percentual) {
  if (percentual >= 80) return "Alta";
  if (percentual >= 50) return "Média";
  return "Baixa";
}
 
// --- RF08: CALLBACK ---------------------------------------
 
export function ordenarPor(itens, funcaoComparadora) {
  return [...itens].sort(funcaoComparadora);
}
 
// --- RF03 + RF06: cálculo de compatibilidade para todas as vagas ----
 
export function calcularTodasCompatibilidades(habilidadesCandidato, vagas) {
  contadorDeAnalises.registrar(); // toda análise completa conta 1 aqui
 
  return vagas.map((vaga) => {
    const resultado = vaga.calcularCompatibilidade(habilidadesCandidato);
    return {
      ...resultado,
      classificacao: classificarCompatibilidade(resultado.percentual)
    };
  });
}
 
/**
 * @param {{ habilidades: string[], experienciaMeses: number }} candidato
 */
export function encontrarMelhoresVagas(candidato, vagas, opcoes = {}) {
  const { limite = Infinity, percentualMinimo = 0 } = opcoes;
 
  const resultados = calcularTodasCompatibilidades(candidato.habilidades, vagas)
    .filter((resultado) => resultado.percentual >= percentualMinimo);
 
  const ordenados = ordenarPor(resultados, (a, b) => {
    if (b.percentual !== a.percentual) {
      return b.percentual - a.percentual; 
    }

    const distanciaA = Math.abs(a.vaga.senioridadeMeses - candidato.experienciaMeses);
    const distanciaB = Math.abs(b.vaga.senioridadeMeses - candidato.experienciaMeses);
    return distanciaA - distanciaB;
  });
 
  return ordenados.slice(0, limite);
}
 
// --- RF05: melhor vaga + recomendação de estudo ----------------------
 
export function encontrarMelhorVaga(resultados) {
  if (resultados.length === 0) return null;
 
  return resultados.reduce((melhorAteAgora, atual) =>
    atual.percentual > melhorAteAgora.percentual ? atual : melhorAteAgora
  );
}
 
export function gerarRecomendacaoDeEstudo(resultados) {
  if (resultados.length === 0) return null;
 
  const frequenciaFaltantes = resultados.reduce((contagem, resultado) => {
    resultado.faltando.forEach((skill) => {
      contagem[skill] = (contagem[skill] || 0) + 1;
    });
    return contagem;
  }, {});
 
  const skillsOrdenadas = Object.entries(frequenciaFaltantes).sort(
    (a, b) => b[1] - a[1]
  );
 
  if (skillsOrdenadas.length === 0) {
    return "Você já cobre todos os requisitos das vagas analisadas!";
  }
 
  const [skillMaisFaltante, vezes] = skillsOrdenadas[0];
  return `Estudar "${skillMaisFaltante}" pode aumentar sua compatibilidade: essa skill falta em ${vezes} das vagas analisadas.`;
}