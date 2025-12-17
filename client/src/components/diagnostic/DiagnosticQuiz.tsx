import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; weight?: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'faturamento',
    question: 'Qual o faturamento mensal da sua empresa?',
    options: [
      { value: 'ate100k', label: 'Até R$ 100 mil', weight: 1 },
      { value: '100k-300k', label: 'R$ 100 mil a R$ 300 mil', weight: 2 },
      { value: '300k-1m', label: 'R$ 300 mil a R$ 1 milhão', weight: 3 },
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
    question: 'O que mais faria diferença com mais caixa?',
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
}

interface DiagnosticQuizProps {
  onComplete?: (answers: Record<string, string>, score: number) => void;
}

export function DiagnosticQuiz({ onComplete }: DiagnosticQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [aiDiagnostic, setAiDiagnostic] = useState<AIDiagnostic | null>(null);
  const [aiError, setAiError] = useState(false);

  const progress = ((currentQuestion) / QUESTIONS.length) * 100;

  const handleAnswer = async (questionId: string, value: string, weight: number = 1) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    } else {
      setIsAnalyzing(true);
      const totalScore = Object.keys(newAnswers).reduce((acc, key) => {
        const question = QUESTIONS.find(q => q.id === key);
        const option = question?.options.find(o => o.value === newAnswers[key]);
        return acc + (option?.weight || 0);
      }, 0);
      setScore(totalScore);
      
      // Call AI to generate personalized diagnostic
      try {
        const response = await fetch('/api/generate-diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers, score: totalScore })
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
      onComplete?.(newAnswers, totalScore);
    }
  };

  const calculateFallbackSavings = () => {
    const comprasAnswer = answers['compras'];
    let baseValue = 30000;
    
    if (comprasAnswer === 'ate20k') baseValue = 15000;
    else if (comprasAnswer === '20k-40k') baseValue = 30000;
    else if (comprasAnswer === '40k-70k') baseValue = 55000;
    else if (comprasAnswer === 'acima70k') baseValue = 85000;
    
    const savingsRate = Math.min(0.08 + (score / 100), 0.15);
    return Math.round(baseValue * savingsRate);
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

  if (isAnalyzing) {
    return (
      <Card className="border-none shadow-xl bg-white max-w-2xl mx-auto">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
            <Sparkles className="w-5 h-5 text-accent absolute top-0 right-1/3 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Analisando seu cenário...</h3>
          <p className="text-muted-foreground">Nossa IA está preparando seu diagnóstico personalizado</p>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const { color, bg, border } = getScoreLevel();
    const savings = aiDiagnostic?.savings || calculateFallbackSavings();
    const annualSavings = aiDiagnostic?.annualSavings || (savings * 12);

    return (
      <Card className="border-none shadow-xl bg-white max-w-2xl mx-auto">
        <CardContent className="p-8 md:p-12 space-y-8">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bg} ${color} font-semibold text-sm mb-4 border ${border}`}>
              <CheckCircle2 size={18} />
              Diagnóstico Concluído
            </div>
            
            {aiDiagnostic && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-4 ml-2">
                <Sparkles size={12} />
                Gerado por IA
              </div>
            )}
            
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              {aiDiagnostic?.headline || (score >= 30 
                ? 'Alerta: Você pode estar deixando muito dinheiro na mesa.'
                : score >= 20 
                  ? 'Há espaço para melhorar seu processo de compras.'
                  : 'Seu processo de compras parece bem estruturado!'
              )}
            </h3>
          </div>

          <div className={`p-6 rounded-xl ${bg} border ${border}`}>
            <div className="flex items-center gap-4 mb-4">
              {score >= 25 ? (
                <AlertTriangle className={`w-10 h-10 ${color} shrink-0`} />
              ) : (
                <TrendingDown className={`w-10 h-10 ${color} shrink-0`} />
              )}
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Economia potencial mensal</div>
                <div className={`text-3xl font-bold ${color}`}>
                  R$ {savings.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {aiDiagnostic?.diagnostic || `Com base nas suas respostas, identificamos oportunidades de economia de aproximadamente R$ ${savings.toLocaleString('pt-BR')} por mês em suas compras. Isso significa R$ ${annualSavings.toLocaleString('pt-BR')} por ano que poderiam estar no seu caixa.`}
            </p>
          </div>

          {aiDiagnostic?.opportunities && aiDiagnostic.opportunities.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lightbulb size={18} className="text-accent" />
                Oportunidades identificadas:
              </div>
              <ul className="space-y-2">
                {aiDiagnostic.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              Quer validar esse cenário com uma compra real?
            </p>
            <Button 
              size="lg" 
              className="w-full sm:w-auto min-w-[250px] h-14 text-lg font-bold bg-accent hover:bg-orange-600 shadow-lg shadow-orange-500/20"
              onClick={scrollToEqualization}
              data-testid="button-diagnostic-cta"
            >
              Validar com uma compra real
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <p className="text-xs text-muted-foreground">
              Leva menos de 3 minutos. Sem cadastro.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
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

          <div className="grid gap-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.value, option.weight)}
                className="w-full p-4 text-left rounded-xl border-2 border-border hover:border-primary hover:bg-blue-50/50 transition-all font-medium text-foreground active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-testid={`option-${question.id}-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
