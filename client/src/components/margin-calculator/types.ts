export interface MarginInputs {
  segmento: 'musculacao' | 'hvls';
  quantidadeVendida: number;
  precoMedioUnitario: number;
  materiaPrima: number;
  componentes: number;
  maoDeObra: number;
  energia: number;
  impostos: number;
  comissao: number;
  frete: number;
  administrativo: number;
  comercial: number;
  marketing: number;
  engenharia: number;
}

export interface IndicadorResult {
  nome: string;
  valor: number;
  valorFormatado: string;
  status: 'saudavel' | 'atencao' | 'critico';
  benchmark: number;
  benchmarkFormatado: string;
  percentualDoIdeal: number;
}

export interface DiagnosticoResult {
  receita: number;
  cmv: number;
  margemBruta: IndicadorResult;
  markup: IndicadorResult;
  margemContribuicao: number;
  ebitda: IndicadorResult;
  margemEbitda: IndicadorResult;
  pontoEquilibrio: IndicadorResult;
  custosFixos: number;
  custosVariaveis: number;
}

export interface Benchmark {
  margemBruta: { saudavel: number; atencao: number };
  markup: { saudavel: number; atencao: number };
  margemEbitda: { saudavel: number; atencao: number };
  pontoEquilibrio: { saudavel: number; atencao: number };
}

export const BENCHMARKS: Record<string, Benchmark> = {
  musculacao: {
    margemBruta: { saudavel: 40, atencao: 30 },
    markup: { saudavel: 1.8, atencao: 1.4 },
    margemEbitda: { saudavel: 12, atencao: 8 },
    pontoEquilibrio: { saudavel: 65, atencao: 80 },
  },
  hvls: {
    margemBruta: { saudavel: 45, atencao: 35 },
    markup: { saudavel: 2.2, atencao: 1.6 },
    margemEbitda: { saudavel: 18, atencao: 12 },
    pontoEquilibrio: { saudavel: 50, atencao: 70 },
  },
};

export const SEGMENTOS = [
  { value: 'musculacao', label: 'Máquinas de Musculação' },
  { value: 'hvls', label: 'Ventiladores HVLS' },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}
