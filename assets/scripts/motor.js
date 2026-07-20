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
    const percentual = this.requisitos.length === 0 ? 0 : Math.round((emComum.length / this.requisitos.length) * 100);
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
    return { ...resultadoBase, percentual: Math.min(100, resultadoBase.percentual + bonus), bonusStack: dominaStack };
  }

  getRotulo() {
    return `${this.cargo} (${this.stack})`;
  }
}
