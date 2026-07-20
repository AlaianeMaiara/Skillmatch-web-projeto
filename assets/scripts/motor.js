/**
 * motor.js
 * ------------------------------------------------------------
 * O MOTOR do SkillConect: as classes de domínio (RF07 — POO) e as
 * funções que orquestram compatibilidade, classificação, melhor
 * vaga e recomendação de estudo. Nenhuma função aqui toca no DOM —
 * só lógica pura, testável isoladamente.
 */

// --- RF07: POO — classes de domínio ---------------------------------
//
// `Vaga` é a classe base: sabe seus próprios dados e sabe calcular
// sua própria compatibilidade com um candidato (método usa `this`).
//
// `VagaFrontEnd extends Vaga` acrescenta `stack` e SOBRESCREVE
// calcularCompatibilidade() para dar um bônus quando o candidato
// domina a stack específica pedida pela vaga — front-end costuma
// valorizar isso mais do que uma conta genérica de requisitos. Esse
// é o motivo da herança (não é só para "cumprir tabela").

export class Vaga {
  constructor(id, empresa, cargo, requisitos, salario, modalidade, senioridadeMeses) {
    this.id = id;
    this.empresa = empresa;
    this.cargo = cargo;
    this.requisitos = requisitos; // array de strings
    this.salario = salario;
    this.modalidade = modalidade;
    // Experiência (em meses) tipicamente esperada para esta vaga.
    // Usado logo abaixo para desempatar vagas com o mesmo percentual
    // de compatibilidade, comparando com o experienciaMeses do
    // candidato (RF01).
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
//
// `criarContadorDeAnalises` devolve dois métodos que compartilham
// acesso à variável `total`, mas `total` em si fica "trancada" no
// escopo da função — ninguém de fora consegue ler ou alterar
// `total` diretamente, só através de `registrar()`/`obterTotal()`.
// Isso É uma closure: as funções devolvidas "lembram" do escopo
// onde nasceram, mesmo depois de criarContadorDeAnalises() já ter
// terminado de executar.
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

// Uma única instância do contador, compartilhada pela sessão inteira
// (enquanto a página não for recarregada).
const contadorDeAnalises = criarContadorDeAnalises();

export function obterTotalDeAnalises() {
  return contadorDeAnalises.obterTotal();
}

// --- RF04: CLASSIFICAÇÃO -------------------------------------------

/**
 * Classifica um percentual de compatibilidade em uma faixa.
 * (if/else aqui; poderia ser switch ou ternário — se seu professor
 * pedir para ver as três formas, é só trocar a implementação.)
 */
export function classificarCompatibilidade(percentual) {
  if (percentual >= 80) return "Alta";
  if (percentual >= 50) return "Média";
  return "Baixa";
}

// --- RF08: CALLBACK explícito ---------------------------------------

/**
 * Ordena uma lista usando uma função de comparação recebida por
 * parâmetro. Quem chama esta função decide COMO comparar (isso é
 * um callback: uma função passada como argumento para outra função,
 * que decide quando/como executá-la).
 */
export function ordenarPor(itens, funcaoComparadora) {
  return [...itens].sort(funcaoComparadora);
}

// --- RF03 + RF06: cálculo de compatibilidade para todas as vagas ----

/**
 * Calcula a compatibilidade de CADA vaga com o candidato.
 * Usa .map() (RF06): para cada vaga, pede a ELA MESMA que calcule
 * sua compatibilidade (polimorfismo — uma VagaFrontEnd calcula
 * diferente de uma Vaga comum, sem este código saber disso).
 */
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
 * Filtra e ordena os resultados. Recebe o CANDIDATO inteiro (não só
 * as habilidades) porque o critério de desempate (RF01) usa
 * candidato.experienciaMeses: entre duas vagas com o MESMO
 * percentual, vence a que exige uma experiência (senioridadeMeses)
 * mais próxima da experiência real do candidato.
 *
 * @param {{ habilidades: string[], experienciaMeses: number }} candidato
 */
export function encontrarMelhoresVagas(candidato, vagas, opcoes = {}) {
  const { limite = Infinity, percentualMinimo = 0 } = opcoes;

  const resultados = calcularTodasCompatibilidades(candidato.habilidades, vagas)
    .filter((resultado) => resultado.percentual >= percentualMinimo);

  const ordenados = ordenarPor(resultados, (a, b) => {
    if (b.percentual !== a.percentual) {
      return b.percentual - a.percentual; // critério principal: maior % primeiro
    }
    // Empate no percentual: desempate por proximidade de experiência.
    const distanciaA = Math.abs(a.vaga.senioridadeMeses - candidato.experienciaMeses);
    const distanciaB = Math.abs(b.vaga.senioridadeMeses - candidato.experienciaMeses);
    return distanciaA - distanciaB;
  });

  return ordenados.slice(0, limite);
}

// --- RF05: melhor vaga + recomendação de estudo ----------------------

/**
 * Encontra a vaga de maior compatibilidade usando .reduce() (RF06):
 * percorre todos os resultados carregando "o melhor até agora" e
 * substituindo sempre que encontra um percentual maior.
 */
export function encontrarMelhorVaga(resultados) {
  if (resultados.length === 0) return null;

  return resultados.reduce((melhorAteAgora, atual) =>
    atual.percentual > melhorAteAgora.percentual ? atual : melhorAteAgora
  );
}

/**
 * Gera uma recomendação de estudo com base nas skills que MAIS
 * aparecem como "faltando" entre os resultados analisados.
 * Usa .reduce() (RF06) para montar um objeto de contagem
 * { skill: quantasVezesFaltou }.
 */
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
