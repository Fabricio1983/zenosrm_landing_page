import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, Lightbulb, RotateCcw, Wallet, Calendar, DollarSign, Target } from 'lucide-react';

const FRASES_IMPACTO_DIAGNOSTICO = [
  "Empresas que equalizam cotações economizam em média 12% em cada compra.",
  "Você sabia? Pequenas diferenças de preço somam milhares de reais ao ano.",
  "Comprar do fornecedor mais barato nem sempre é a melhor escolha. Equalizar é.",
  "A cada 10 equalizações, empresas descobrem pelo menos 3 oportunidades de economia ocultas.",
  "Tempo é dinheiro: equalizar manualmente leva horas. Com o Zeno, segundos.",
  "Negociar com dados na mão aumenta seu poder de barganha em até 40%.",
  "Uma única equalização bem feita pode pagar o Zeno por um ano inteiro.",
  "Fornecedores respeitam quem conhece os preços do mercado.",
  "Cada real economizado em compras vai direto para o lucro da empresa.",
  "Gestão de compras profissional pode aumentar a margem líquida em até 3 pontos percentuais.",
];

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; weight?: number }[];
  multiSelect?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'faturamento',
    question: 'Qual o faturamento mensal da sua empresa?',
    options: [
      { value: 'ate50k', label: 'Até R$ 50 mil', weight: 1 },
      { value: '50k-100k', label: 'R$ 50 mil a R$ 100 mil', weight: 2 },
      { value: '100k-200k', label: 'R$ 100 mil a R$ 200 mil', weight: 2 },
      { value: '200k-500k', label: 'R$ 200 mil a R$ 500 mil', weight: 3 },
      { value: '500k-1m', label: 'R$ 500 mil a R$ 1 milhão', weight: 3 },
      { value: 'acima1m', label: 'Acima de R$ 1 milhão', weight: 4 },
    ]
  },
  {
    id: 'compras',
    question: 'Quanto sua empresa gasta em compras por mês?',
    options: [
      { value: 'ate20k', label: 'Até R$ 20 mil', weight: 1 },
      { value: '20k-40k', label: 'R$ 20 mil a R$ 40 mil', weight: 2 },
      { value: '40k-70k', label: 'R$ 40 mil a R$ 70 mil', weight: 3 },
      { value: 'acima70k', label: 'Acima de R$ 70 mil', weight: 4 },
      { value: 'naosei', label: 'Não sei informar', weight: 2 },
    ]
  },
  {
    id: 'margem',
    question: 'Qual a margem líquida aproximada do seu negócio?',
    options: [
      { value: 'ate5', label: 'Até 5%', weight: 4 },
      { value: '5-10', label: '5% a 10%', weight: 3 },
      { value: '10-15', label: '10% a 15%', weight: 2 },
      { value: 'acima15', label: 'Acima de 15%', weight: 1 },
      { value: 'naosei', label: 'Não sei informar', weight: 3 },
    ]
  },
  {
    id: 'solicitacao',
    question: 'Como as compras são solicitadas na sua empresa?',
    multiSelect: true,
    options: [
      { value: 'whatsapp', label: 'WhatsApp / verbal', weight: 4 },
      { value: 'email', label: 'E-mail', weight: 3 },
      { value: 'planilha', label: 'Planilha', weight: 2 },
      { value: 'sistema', label: 'Sistema', weight: 1 },
    ]
  },
  {
    id: 'fornecedores',
    question: 'Quantos fornecedores você costuma cotar?',
    options: [
      { value: '1', label: 'Apenas 1', weight: 4 },
      { value: '2', label: '2 fornecedores', weight: 3 },
      { value: '3+', label: '3 ou mais', weight: 1 },
      { value: 'depende', label: 'Depende da urgência', weight: 3 },
    ]
  },
  {
    id: 'comparacao',
    question: 'Como você compara os orçamentos?',
    options: [
      { value: 'olhometro', label: 'No "olhômetro"', weight: 4 },
      { value: 'manual', label: 'Comparação manual', weight: 3 },
      { value: 'preco_final', label: 'Só preço final', weight: 3 },
      { value: 'sistema', label: 'Uso algum sistema', weight: 1 },
    ]
  },
  {
    id: 'controle',
    question: 'Você sabe quanto economiza em compras?',
    options: [
      { value: 'sei', label: 'Sei exatamente quanto economizo', weight: 1 },
      { value: 'nocao', label: 'Tenho uma noção', weight: 2 },
      { value: 'naosei', label: 'Não sei informar', weight: 3 },
      { value: 'nunca', label: 'Nunca medi', weight: 4 },
    ]
  },
  {
    id: 'urgencia',
    question: 'Com que frequência você faz compras urgentes?',
    options: [
      { value: 'frequente', label: 'Acontece com frequência', weight: 4 },
      { value: 'as_vezes', label: 'Às vezes', weight: 3 },
      { value: 'raramente', label: 'Raramente', weight: 2 },
      { value: 'nunca', label: 'Nunca', weight: 1 },
    ]
  },
  {
    id: 'caixa',
    question: 'Como está o caixa da sua empresa?',
    options: [
      { value: 'apertado', label: 'Sempre apertado', weight: 4 },
      { value: 'justo', label: 'Controlado, mas justo', weight: 3 },
      { value: 'estavel', label: 'Estável', weight: 2 },
      { value: 'confortavel', label: 'Confortável', weight: 1 },
    ]
  },
  {
    id: 'desejo',
    question: 'O que você faria com mais caixa na empresa?',
    options: [
      { value: 'tranquilidade', label: 'Mais tranquilidade no dia a dia', weight: 3 },
      { value: 'investir', label: 'Investir na empresa', weight: 3 },
      { value: 'retirada', label: 'Melhorar retirada mensal', weight: 3 },
      { value: 'vendas', label: 'Facilitar vendas (preço / prazo)', weight: 3 },
    ]
  },
];

interface AIDiagnostic {
  headline: string;
  diagnostic: string;
  opportunities: string[];
  savings: number;
  annualSavings: number;
  fiveYearSavings?: number;
  currentProfit?: number;
  profitIncrease?: number;
}

interface DiagnosticQuizProps {
  onComplete?: (answers: Record<string, string>, score: number) => void;
  showHeader?: boolean;
}

export function DiagnosticQuiz({ onComplete, showHeader = true }: DiagnosticQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [aiDiagnostic, setAiDiagnostic] = useState<AIDiagnostic | null>(null);
  const [aiError, setAiError] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const analyzingRef = useRef<HTMLDivElement>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [shuffledPhrases, setShuffledPhrases] = useState<string[]>([]);

  const progress = ((currentQuestion) / QUESTIONS.length) * 100;
  
  useEffect(() => {
    if (showResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showResult]);
  
  useEffect(() => {
    if (isAnalyzing) {
      const shuffled = [...FRASES_IMPACTO_DIAGNOSTICO].sort(() => Math.random() - 0.5);
      setShuffledPhrases(shuffled);
      setCurrentPhraseIndex(0);
      
      setTimeout(() => {
        analyzingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      const interval = setInterval(() => {
        setCurrentPhraseIndex(prev => (prev + 1) % shuffled.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const toggleMultiSelect = (value: string) => {
    setMultiSelectAnswers(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      const prevQuestion = QUESTIONS[currentQuestion - 1];
      if (prevQuestion.multiSelect && answers[prevQuestion.id]) {
        setMultiSelectAnswers(answers[prevQuestion.id].split(','));
      }
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const confirmMultiSelect = () => {
    if (multiSelectAnswers.length === 0) return;
    const question = QUESTIONS[currentQuestion];
    const newAnswers = { ...answers, [question.id]: multiSelectAnswers.join(',') };
    setAnswers(newAnswers);
    setMultiSelectAnswers([]);
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      processResults(newAnswers);
    }
  };

  const processResults = async (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    const totalScore = Object.keys(finalAnswers).reduce((acc, key) => {
      const question = QUESTIONS.find(q => q.id === key);
      const answerValue = finalAnswers[key];
      if (answerValue.includes(',')) {
        const values = answerValue.split(',');
        const maxWeight = Math.max(...values.map(v => {
          const opt = question?.options.find(o => o.value === v);
          return opt?.weight || 0;
        }));
        return acc + maxWeight;
      }
      const option = question?.options.find(o => o.value === answerValue);
      return acc + (option?.weight || 0);
    }, 0);
    setScore(totalScore);
    
    try {
      const response = await fetch('/api/generate-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, score: totalScore })
      });
      
      if (response.ok) {
        const diagnostic = await response.json();
        setAiDiagnostic(diagnostic);
      } else {
        console.error('Failed to generate AI diagnostic');
        setAiError(true);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      setAiError(true);
    }
    
    setIsAnalyzing(false);
    setShowResult(true);
    onComplete?.(finalAnswers, totalScore);
  };

  const handleAnswer = async (questionId: string, value: string, weight: number = 1) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    } else {
      processResults(newAnswers);
    }
  };

  const calculateFallbackSavings = () => {
    // Get monthly purchases value
    let comprasValue = 30000;
    const comprasAnswer = answers['compras'];
    if (comprasAnswer === 'ate20k') comprasValue = 15000;
    else if (comprasAnswer === '20k-40k') comprasValue = 30000;
    else if (comprasAnswer === '40k-70k') comprasValue = 55000;
    else if (comprasAnswer === 'acima70k') comprasValue = 85000;
    
    // Calculate savings rate based on process maturity (8% to 15%)
    let baseSavingsRate = 0.10;
    const comparacaoAnswer = answers['comparacao'];
    const controleAnswer = answers['controle'];
    const fornecedoresAnswer = answers['fornecedores'];
    
    if (comparacaoAnswer === 'olhometro') baseSavingsRate += 0.02;
    else if (comparacaoAnswer === 'manual' || comparacaoAnswer === 'preco_final') baseSavingsRate += 0.01;
    else if (comparacaoAnswer === 'sistema') baseSavingsRate -= 0.02;
    
    if (controleAnswer === 'nunca' || controleAnswer === 'naosei') baseSavingsRate += 0.015;
    else if (controleAnswer === 'nocao') baseSavingsRate += 0.005;
    else if (controleAnswer === 'sei') baseSavingsRate -= 0.02;
    
    if (fornecedoresAnswer === '1') baseSavingsRate += 0.02;
    else if (fornecedoresAnswer === '2' || fornecedoresAnswer === 'depende') baseSavingsRate += 0.01;
    else if (fornecedoresAnswer === '3+') baseSavingsRate -= 0.01;
    
    const savingsRate = Math.max(0.08, Math.min(0.15, baseSavingsRate));
    return Math.round(comprasValue * savingsRate);
  };
  
  const calculateFallbackProfitIncrease = (savings: number) => {
    // Get monthly revenue
    let faturamentoValue = 75000;
    const faturamentoAnswer = answers['faturamento'];
    if (faturamentoAnswer === 'ate50k') faturamentoValue = 40000;
    else if (faturamentoAnswer === '50k-100k') faturamentoValue = 75000;
    else if (faturamentoAnswer === '100k-200k') faturamentoValue = 150000;
    else if (faturamentoAnswer === '200k-500k') faturamentoValue = 350000;
    else if (faturamentoAnswer === '500k-1m') faturamentoValue = 750000;
    else if (faturamentoAnswer === 'acima1m') faturamentoValue = 1500000;
    
    // Get net margin percentage
    let margemPercent = 0.075;
    const margemAnswer = answers['margem'];
    if (margemAnswer === 'ate5') margemPercent = 0.04;
    else if (margemAnswer === '5-10') margemPercent = 0.075;
    else if (margemAnswer === '10-15') margemPercent = 0.125;
    else if (margemAnswer === 'acima15') margemPercent = 0.18;
    
    const currentProfit = Math.round(faturamentoValue * margemPercent);
    return currentProfit > 0 ? Math.round((savings / currentProfit) * 100) : 50;
  };

  const getScoreLevel = () => {
    if (score >= 30) return { level: 'alto', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (score >= 20) return { level: 'medio', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { level: 'baixo', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const scrollToEqualization = () => {
    const element = document.getElementById('equalization');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetDiagnostic = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setMultiSelectAnswers([]);
    setShowResult(false);
    setScore(0);
    setAiDiagnostic(null);
    setAiError(false);
  };

  if (isAnalyzing) {
    const currentPhrase = shuffledPhrases[currentPhraseIndex] || FRASES_IMPACTO_DIAGNOSTICO[0];
    
    return (
      <div ref={analyzingRef} className="scroll-mt-8">
        <Card className="border-none shadow-xl bg-white max-w-2xl mx-auto">
          <CardContent className="p-8 md:p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
            <h3 className="text-xl font-bold text-foreground mb-4">Analisando seu cenário...</h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-primary/10 rounded-xl p-5 border border-blue-100 min-h-[100px] flex items-center justify-center">
              <p 
                key={currentPhraseIndex}
                className="text-primary font-medium text-sm md:text-base animate-in fade-in duration-500 leading-relaxed"
              >
                💡 {currentPhrase}
              </p>
            </div>
            
            <p className="text-muted-foreground text-sm mt-4">Preparando seu diagnóstico personalizado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const { color, bg, border } = getScoreLevel();
    const savings = aiDiagnostic?.savings || calculateFallbackSavings();
    const annualSavings = aiDiagnostic?.annualSavings || (savings * 12);
    const fiveYearSavings = aiDiagnostic?.fiveYearSavings || (annualSavings * 5);
    const profitIncrease = aiDiagnostic?.profitIncrease || calculateFallbackProfitIncrease(savings);

    return (
      <div ref={resultRef} className="scroll-mt-4">
        <Card className="border-none shadow-xl bg-white max-w-3xl mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className={`${bg} border-b ${border} p-6 md:p-8 text-center`}>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 ${color} font-semibold text-sm mb-4 border ${border}`}>
                <CheckCircle2 size={18} />
                Diagnóstico Concluído
              </div>
            
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              {aiDiagnostic?.headline || (score >= 30 
                ? 'Alerta: Você pode estar deixando muito dinheiro na mesa.'
                : score >= 20 
                  ? 'Há espaço para melhorar seu processo de compras.'
                  : 'Seu processo de compras parece bem estruturado!'
              )}
            </h3>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-4 border border-red-200 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Por Mês</div>
                <div className="text-3xl md:text-4xl font-bold text-red-600">
                  {savings.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-red-500 mt-1">em economia</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 border border-orange-200 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Por Ano</div>
                <div className="text-3xl md:text-4xl font-bold text-orange-600">
                  {annualSavings.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-orange-500 mt-1">economia anual</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-4 border border-green-200 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Aumento Lucro</div>
                <div className="text-3xl md:text-4xl font-bold text-green-600">
                  +{profitIncrease}%
                </div>
                <div className="text-xs text-green-500 mt-1">no lucro líquido</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Em 5 Anos</div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                  {fiveYearSavings.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-blue-500 mt-1">impacto acumulado</div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
              <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                {aiDiagnostic?.diagnostic || `Com base nas suas respostas, identificamos oportunidades de economia de aproximadamente R$ ${savings.toLocaleString('pt-BR')} por mês em suas compras. Isso significa R$ ${annualSavings.toLocaleString('pt-BR')} por ano que poderiam estar no seu caixa.`}
              </p>
            </div>

            {aiDiagnostic?.opportunities && aiDiagnostic.opportunities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Target size={20} className="text-primary" />
                  Oportunidades identificadas
                </div>
                <div className="grid gap-3">
                  {aiDiagnostic.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-white to-green-50/30 border border-green-100 hover:border-green-200 hover:shadow-sm transition-all">
                      <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-slate-700 pt-1">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-center text-muted-foreground text-sm mb-4">
                Quer validar esse cenário com uma compra real?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto min-w-[250px] h-14 text-lg font-bold bg-accent hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                  onClick={scrollToEqualization}
                  data-testid="button-diagnostic-cta"
                >
                  Validar com uma compra real
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto h-14 text-lg font-medium border-2 hover:bg-slate-50 hover:border-primary transition-all"
                  onClick={resetDiagnostic}
                  data-testid="button-reset-diagnostic"
                >
                  <RotateCcw className="mr-2" size={18} />
                  Refazer Diagnóstico
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <>
      {showHeader && (
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">
            Diagnóstico rápido de compras industriais
          </h2>
          <p className="text-lg text-muted-foreground">
            Responda em menos de 3 minutos e veja o impacto no seu caixa
          </p>
        </div>
      )}
      <Card className="border-none shadow-xl bg-white max-w-2xl mx-auto">
        <CardContent className="p-6 md:p-10 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Pergunta {currentQuestion + 1} de {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-bold text-foreground text-center">
            {question.question}
          </h3>
          
          {question.multiSelect && (
            <p className="text-sm text-muted-foreground text-center">
              Selecione todas as opções que se aplicam
            </p>
          )}

          <div className="grid gap-3">
            {question.multiSelect ? (
              <>
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleMultiSelect(option.value)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center gap-3 ${
                      multiSelectAnswers.includes(option.value)
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-border hover:border-primary hover:bg-blue-50/50 text-foreground'
                    }`}
                    data-testid={`option-${question.id}-${option.value}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      multiSelectAnswers.includes(option.value)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/50'
                    }`}>
                      {multiSelectAnswers.includes(option.value) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    {option.label}
                  </button>
                ))}
                <div className="flex gap-3 mt-2">
                  {currentQuestion > 0 && (
                    <Button
                      variant="outline"
                      className="h-12 px-4 font-semibold border-2"
                      onClick={goBack}
                      data-testid="button-back"
                    >
                      <ArrowLeft size={18} />
                    </Button>
                  )}
                  <Button
                    className="flex-1 h-12 bg-primary hover:bg-blue-600 text-white font-semibold"
                    onClick={confirmMultiSelect}
                    disabled={multiSelectAnswers.length === 0}
                    data-testid="button-continue-multiselect"
                  >
                    Continuar
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </div>
              </>
            ) : (
              question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(question.id, option.value, option.weight)}
                  className="w-full p-4 text-left rounded-xl border-2 border-border hover:border-primary hover:bg-blue-50/50 transition-all font-medium text-foreground active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  data-testid={`option-${question.id}-${option.value}`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
          
          {!question.multiSelect && currentQuestion > 0 && (
            <div className="pt-2">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                onClick={goBack}
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2" size={16} />
                Voltar à pergunta anterior
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
