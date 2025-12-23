import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DiagnosticoResult, IndicadorResult, formatCurrency, SEGMENTOS } from './types';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  result: DiagnosticoResult;
  segmento: string;
  recomendacoes: string | null;
  isLoadingAI: boolean;
  onReset: () => void;
  onWaitlist: () => void;
}

const STATUS_CONFIG = {
  saudavel: { 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: CheckCircle,
    label: 'Saudável',
    barColor: 'bg-green-500'
  },
  atencao: { 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200',
    icon: AlertTriangle,
    label: 'Atenção',
    barColor: 'bg-yellow-500'
  },
  critico: { 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: TrendingDown,
    label: 'Crítico',
    barColor: 'bg-red-500'
  },
};

function KPICard({ indicador, delay }: { indicador: IndicadorResult; delay: number }) {
  const config = STATUS_CONFIG[indicador.status];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className={`${config.bg} ${config.border} border-2 overflow-hidden`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">{indicador.nome}</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
              <Icon size={12} />
              {config.label}
            </div>
          </div>
          <div className={`text-3xl font-bold ${config.color} mb-3`}>
            {indicador.valorFormatado}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Você</span>
              <span>Ideal: {indicador.benchmarkFormatado}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${config.barColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, indicador.percentualDoIdeal)}%` }}
                transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ComparisonBar({ label, valor, valorFormatado, benchmark, benchmarkFormatado, status, delay }: {
  label: string;
  valor: number;
  valorFormatado: string;
  benchmark: number;
  benchmarkFormatado: string;
  status: 'saudavel' | 'atencao' | 'critico';
  delay: number;
}) {
  const config = STATUS_CONFIG[status];
  const maxValue = Math.max(valor, benchmark) * 1.2;
  const voceWidth = (valor / maxValue) * 100;
  const idealWidth = (benchmark / maxValue) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-foreground">{label}</span>
        <span className={`font-bold ${config.color}`}>{valorFormatado}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-12">Você</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${config.barColor} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${voceWidth}%` }}
              transition={{ delay: delay + 0.2, duration: 0.6 }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-12">Ideal</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary/30 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${idealWidth}%` }}
              transition={{ delay: delay + 0.4, duration: 0.6 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{benchmarkFormatado}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function MarginDashboard({ result, segmento, recomendacoes, isLoadingAI, onReset, onWaitlist }: Props) {
  const segmentoLabel = SEGMENTOS.find(s => s.value === segmento)?.label || segmento;
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
          Diagnóstico de Margem
        </h2>
        <p className="text-muted-foreground">
          Segmento: <span className="font-semibold text-foreground">{segmentoLabel}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Receita analisada: <span className="font-bold text-primary">{formatCurrency(result.receita)}</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard indicador={result.margemBruta} delay={0.1} />
        <KPICard indicador={result.margemEbitda} delay={0.2} />
        <KPICard indicador={result.markup} delay={0.3} />
        <KPICard indicador={result.pontoEquilibrio} delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Target className="text-primary" size={20} />
              Comparativo com Benchmark do Segmento
            </h3>
            <div className="space-y-6">
              <ComparisonBar 
                label="Margem Bruta"
                valor={result.margemBruta.valor}
                valorFormatado={result.margemBruta.valorFormatado}
                benchmark={result.margemBruta.benchmark}
                benchmarkFormatado={result.margemBruta.benchmarkFormatado}
                status={result.margemBruta.status}
                delay={0.6}
              />
              <ComparisonBar 
                label="Margem EBITDA"
                valor={result.margemEbitda.valor}
                valorFormatado={result.margemEbitda.valorFormatado}
                benchmark={result.margemEbitda.benchmark}
                benchmarkFormatado={result.margemEbitda.benchmarkFormatado}
                status={result.margemEbitda.status}
                delay={0.7}
              />
              <ComparisonBar 
                label="Markup"
                valor={result.markup.valor}
                valorFormatado={result.markup.valorFormatado}
                benchmark={result.markup.benchmark}
                benchmarkFormatado={result.markup.benchmarkFormatado}
                status={result.markup.status}
                delay={0.8}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-4">
              <Sparkles className="text-primary" size={20} />
              Recomendações da IA
            </h3>
            {isLoadingAI ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Analisando seus dados...</span>
              </div>
            ) : recomendacoes ? (
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                {recomendacoes}
              </div>
            ) : (
              <p className="text-muted-foreground">Não foi possível gerar recomendações no momento.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="space-y-4"
      >
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold bg-accent hover:bg-orange-600 shadow-lg"
          onClick={onWaitlist}
          data-testid="button-waitlist-margin"
        >
          Entrar na Lista de Espera do Zeno
          <ArrowRight className="ml-2" size={20} />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full h-12"
          onClick={onReset}
          data-testid="button-reset-margin"
        >
          <RefreshCw className="mr-2" size={18} />
          Fazer Novo Diagnóstico
        </Button>
      </motion.div>
    </div>
  );
}
