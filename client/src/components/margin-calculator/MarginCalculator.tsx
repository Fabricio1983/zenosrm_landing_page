import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { MarginCalculatorForm } from './MarginCalculatorForm';
import { MarginDashboard } from './MarginDashboard';
import { MarginInputs, DiagnosticoResult } from './types';
import { calcularDiagnostico, getIndicadoresCriticos } from './calculations';
import { useMutation } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';

interface Props {
  onWaitlist: () => void;
}

export function MarginCalculator({ onWaitlist }: Props) {
  const [result, setResult] = useState<DiagnosticoResult | null>(null);
  const [inputs, setInputs] = useState<MarginInputs | null>(null);
  const [recomendacoes, setRecomendacoes] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const aiMutation = useMutation({
    mutationFn: async (data: { inputs: MarginInputs; result: DiagnosticoResult }) => {
      const response = await fetch('/api/margin-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to get recommendations');
      return response.json();
    },
    onSuccess: (data) => {
      setRecomendacoes(data.recommendations);
    },
  });

  const handleSubmit = (formInputs: MarginInputs) => {
    const diagnostico = calcularDiagnostico(formInputs);
    setInputs(formInputs);
    setResult(diagnostico);
    setShowDashboard(true);
    
    aiMutation.mutate({ inputs: formInputs, result: diagnostico });
  };

  const handleReset = () => {
    setResult(null);
    setInputs(null);
    setRecomendacoes(null);
    setShowDashboard(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-border shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                    Diagnóstico de Margem Industrial
                  </h2>
                  <p className="text-muted-foreground">
                    Descubra onde sua indústria está perdendo margem e caixa
                  </p>
                </div>
                <MarginCalculatorForm onSubmit={handleSubmit} isLoading={aiMutation.isPending} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-border shadow-xl">
              <CardContent className="p-6 sm:p-8">
                {result && inputs && (
                  <MarginDashboard
                    result={result}
                    segmento={inputs.segmento}
                    recomendacoes={recomendacoes}
                    isLoadingAI={aiMutation.isPending}
                    onReset={handleReset}
                    onWaitlist={onWaitlist}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
