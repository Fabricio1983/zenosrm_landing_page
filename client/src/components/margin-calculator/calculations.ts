import { 
  MarginInputs, 
  DiagnosticoResult, 
  IndicadorResult, 
  BENCHMARKS,
  formatCurrency,
  formatPercent,
  formatMultiplier
} from './types';

function getStatus(
  valor: number, 
  benchmark: { saudavel: number; atencao: number },
  invertido: boolean = false
): 'saudavel' | 'atencao' | 'critico' {
  if (invertido) {
    if (valor <= benchmark.saudavel) return 'saudavel';
    if (valor <= benchmark.atencao) return 'atencao';
    return 'critico';
  } else {
    if (valor >= benchmark.saudavel) return 'saudavel';
    if (valor >= benchmark.atencao) return 'atencao';
    return 'critico';
  }
}

export function calcularDiagnostico(inputs: MarginInputs): DiagnosticoResult {
  const benchmark = BENCHMARKS[inputs.segmento];
  
  const receita = inputs.quantidadeVendida * inputs.precoMedioUnitario;
  
  const cmv = inputs.materiaPrima + inputs.componentes + inputs.maoDeObra + inputs.energia;
  
  const margemBrutaValor = receita > 0 ? ((receita - cmv) / receita) * 100 : 0;
  const margemBruta: IndicadorResult = {
    nome: 'Margem Bruta',
    valor: margemBrutaValor,
    valorFormatado: formatPercent(margemBrutaValor),
    status: getStatus(margemBrutaValor, benchmark.margemBruta),
    benchmark: benchmark.margemBruta.saudavel,
    benchmarkFormatado: `>${benchmark.margemBruta.saudavel}%`,
    percentualDoIdeal: Math.min(100, (margemBrutaValor / benchmark.margemBruta.saudavel) * 100),
  };
  
  const markupValor = cmv > 0 ? receita / cmv : 0;
  const markup: IndicadorResult = {
    nome: 'Markup',
    valor: markupValor,
    valorFormatado: formatMultiplier(markupValor),
    status: getStatus(markupValor, benchmark.markup),
    benchmark: benchmark.markup.saudavel,
    benchmarkFormatado: `>${benchmark.markup.saudavel}x`,
    percentualDoIdeal: Math.min(100, (markupValor / benchmark.markup.saudavel) * 100),
  };
  
  const custosVariaveis = inputs.impostos + inputs.comissao + inputs.frete;
  const margemContribuicao = receita - cmv - custosVariaveis;
  
  const custosFixos = inputs.administrativo + inputs.comercial + inputs.marketing + inputs.engenharia;
  const ebitdaValor = margemContribuicao - custosFixos;
  
  const margemEbitdaValor = receita > 0 ? (ebitdaValor / receita) * 100 : 0;
  const margemEbitda: IndicadorResult = {
    nome: 'Margem EBITDA',
    valor: margemEbitdaValor,
    valorFormatado: formatPercent(margemEbitdaValor),
    status: getStatus(margemEbitdaValor, benchmark.margemEbitda),
    benchmark: benchmark.margemEbitda.saudavel,
    benchmarkFormatado: `>${benchmark.margemEbitda.saudavel}%`,
    percentualDoIdeal: Math.min(100, Math.max(0, (margemEbitdaValor / benchmark.margemEbitda.saudavel) * 100)),
  };
  
  const margemContribuicaoPercent = receita > 0 ? margemContribuicao / receita : 0;
  
  let pontoEquilibrioValor: number;
  let pontoEquilibrioPercent: number;
  let pontoEquilibrioStatus: 'saudavel' | 'atencao' | 'critico';
  let pontoEquilibrioFormatado: string;
  let pontoEquilibrioPercentualDoIdeal: number;
  
  if (margemContribuicaoPercent <= 0) {
    pontoEquilibrioValor = Infinity;
    pontoEquilibrioPercent = 999;
    pontoEquilibrioStatus = 'critico';
    pontoEquilibrioFormatado = 'Inviável';
    pontoEquilibrioPercentualDoIdeal = 0;
  } else {
    pontoEquilibrioValor = custosFixos / margemContribuicaoPercent;
    pontoEquilibrioPercent = receita > 0 ? (pontoEquilibrioValor / receita) * 100 : 0;
    pontoEquilibrioStatus = getStatus(pontoEquilibrioPercent, benchmark.pontoEquilibrio, true);
    pontoEquilibrioFormatado = formatCurrency(pontoEquilibrioValor);
    pontoEquilibrioPercentualDoIdeal = Math.min(100, Math.max(0, ((100 - pontoEquilibrioPercent) / (100 - benchmark.pontoEquilibrio.saudavel)) * 100));
  }
  
  const pontoEquilibrio: IndicadorResult = {
    nome: 'Ponto de Equilíbrio',
    valor: pontoEquilibrioValor === Infinity ? 0 : pontoEquilibrioValor,
    valorFormatado: pontoEquilibrioFormatado,
    status: pontoEquilibrioStatus,
    benchmark: benchmark.pontoEquilibrio.saudavel,
    benchmarkFormatado: `≤${benchmark.pontoEquilibrio.saudavel}% da receita`,
    percentualDoIdeal: pontoEquilibrioPercentualDoIdeal,
  };
  
  const ebitda: IndicadorResult = {
    nome: 'EBITDA',
    valor: ebitdaValor,
    valorFormatado: formatCurrency(ebitdaValor),
    status: margemEbitda.status,
    benchmark: benchmark.margemEbitda.saudavel,
    benchmarkFormatado: formatCurrency(receita * benchmark.margemEbitda.saudavel / 100),
    percentualDoIdeal: margemEbitda.percentualDoIdeal,
  };
  
  return {
    receita,
    cmv,
    margemBruta,
    markup,
    margemContribuicao,
    ebitda,
    margemEbitda,
    pontoEquilibrio,
    custosFixos,
    custosVariaveis,
  };
}

export function getIndicadoresCriticos(result: DiagnosticoResult): IndicadorResult[] {
  const indicadores = [result.margemBruta, result.margemEbitda, result.markup, result.pontoEquilibrio];
  return indicadores.filter(i => i.status === 'critico' || i.status === 'atencao');
}
