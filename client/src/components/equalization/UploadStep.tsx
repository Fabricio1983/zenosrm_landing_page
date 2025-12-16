import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Check, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UploadStepProps {
  onComplete: (files: File[]) => void | Promise<void>;
  initialFiles?: File[];
}

const FRASES_IMPACTO = [
  "Empresas que equalizam cotações economizam em média 12% em cada compra.",
  "Você sabia? Pequenas diferenças de preço somam milhares de reais ao ano.",
  "Comprar do fornecedor mais barato nem sempre é a melhor escolha. Equalizar é.",
  "A cada 10 equalizações, empresas descobrem pelo menos 3 oportunidades de economia ocultas.",
  "Tempo é dinheiro: equalizar manualmente leva horas. Com o Zeno, segundos.",
  "Negociar com dados na mão aumenta seu poder de barganha em até 40%.",
  "Profissionais de compras que usam equalização são promovidos 2x mais rápido.",
  "Uma única equalização bem feita pode pagar o Zeno por um ano inteiro.",
  "Fornecedores respeitam quem conhece os preços do mercado.",
  "Cada real economizado em compras vai direto para o lucro da empresa.",
];

const COOLDOWN_SECONDS = 5;

export function UploadStep({ onComplete, initialFiles = [] }: UploadStepProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(COOLDOWN_SECONDS);
  const [progress, setProgress] = useState(0);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  // Rotate phrases during cooldown or processing
  useEffect(() => {
    if (!isProcessing && !isCoolingDown) return;
    
    // Set initial random phrase
    setCurrentPhraseIndex(Math.floor(Math.random() * FRASES_IMPACTO.length));
    
    const interval = setInterval(() => {
      setCurrentPhraseIndex(prev => {
        let next = Math.floor(Math.random() * FRASES_IMPACTO.length);
        while (next === prev && FRASES_IMPACTO.length > 1) {
          next = Math.floor(Math.random() * FRASES_IMPACTO.length);
        }
        return next;
      });
    }, 2500); // Change phrase every 2.5 seconds during cooldown
    
    return () => clearInterval(interval);
  }, [isProcessing, isCoolingDown]);

  const handleAddFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 3) {
        setShowLimitMessage(true);
        setTimeout(() => setShowLimitMessage(false), 5000);
        return combined.slice(0, 3);
      }
      return combined;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleAddFiles,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    multiple: true,
    disabled: isProcessing,
    noClick: true,
    noKeyboard: true
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      handleAddFiles(newFiles);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    // Start cooldown phase first (shows carousel for 5 seconds before calling API)
    setIsCoolingDown(true);
    setCooldownRemaining(COOLDOWN_SECONDS);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Wait for cooldown to complete
    await new Promise(resolve => setTimeout(resolve, COOLDOWN_SECONDS * 1000));
    
    // Now start actual processing
    setIsCoolingDown(false);
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    try {
      await onComplete(files);
      setProgress(100);
    } catch (error) {
      console.error('Error processing:', error);
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold text-foreground">Compare vários orçamentos e veja a economia gerada em segundos</h2>
        <p className="text-muted-foreground">Adicione orçamentos em PDF ou Excel e veja a mágica acontecendo</p>
        <p className="text-xs text-muted-foreground">Dica: Você pode selecionar ou arrastar vários arquivos de uma vez!</p>
      </div>

      {showLimitMessage && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold mb-1">
            <Sparkles size={18} />
            <span>Quer equalizar mais propostas?</span>
          </div>
          <p className="text-sm text-blue-600">
            No <strong>Zeno SRM</strong> você pode comparar quantas propostas quiser, sem limite!
          </p>
        </div>
      )}

      <div 
        {...getRootProps()} 
        className={`grid md:grid-cols-3 gap-4 p-4 -m-4 rounded-2xl transition-all ${
          isDragActive ? 'bg-blue-50 ring-2 ring-primary ring-dashed' : ''
        }`}
      >
        <input {...getInputProps()} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative">
            {files[i] ? (
              <Card className="h-48 border-2 border-primary/20 bg-blue-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                <div className="absolute top-2 right-2">
                  <button onClick={() => removeFile(i)} className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full text-red-500 transition-colors" data-testid={`button-remove-file-${i}`}>
                    <X size={16} />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                  <Check size={24} />
                </div>
                <p className="font-semibold text-sm text-center truncate w-full px-2" data-testid={`text-filename-${i}`}>{files[i].name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(files[i].size / 1024).toFixed(1)} KB</p>
                {isProcessing && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                )}
              </Card>
            ) : (
              <label className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all group ${
                isDragActive ? 'border-primary bg-blue-50' : 'border-border hover:border-primary/50 hover:bg-slate-50'
              }`}>
                <input 
                  type="file" 
                  accept=".pdf,.xlsx,.csv,.jpg,.png,.jpeg" 
                  className="hidden" 
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  multiple
                  data-testid={`input-file-${i}`}
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  isDragActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-blue-50'
                }`}>
                  <Upload size={24} />
                </div>
                <p className="font-medium text-sm text-center text-foreground">
                  {isDragActive ? 'Solte aqui!' : `Orçamento ${i + 1}`}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {isDragActive ? '' : 'Arraste ou clique'}
                </p>
              </label>
            )}
          </div>
        ))}
      </div>

      {isCoolingDown && (
        <div className="w-full max-w-lg mx-auto space-y-6 py-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-4">
              <Sparkles size={16} className="animate-pulse" />
              <span>Preparando análise... {cooldownRemaining}s</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <p className="text-lg text-slate-700 italic text-center animate-in fade-in duration-700" key={currentPhraseIndex}>
              "{FRASES_IMPACTO[currentPhraseIndex]}"
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {FRASES_IMPACTO.slice(0, 5).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentPhraseIndex % 5 ? 'bg-primary scale-125' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="w-full max-w-lg mx-auto space-y-4">
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary flex-shrink-0" size={20} />
            <p className="text-sm text-muted-foreground italic text-center animate-in fade-in duration-500" key={currentPhraseIndex}>
              "{FRASES_IMPACTO[currentPhraseIndex]}"
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button 
          size="lg" 
          className="w-full md:w-auto min-w-[200px] h-12 text-lg font-bold shadow-lg shadow-primary/20"
          disabled={files.length < 2 || isProcessing || isCoolingDown}
          onClick={handleProcess}
        >
          {isCoolingDown ? 'Preparando...' : isProcessing ? 'Processando...' : 'Processar Orçamentos'}
        </Button>
      </div>

      {!isProcessing && files.length === 0 && (
        <div className="text-center pt-2">
          <button 
            onClick={() => {
              // Create dummy files for simulation
              const dummyFiles = [
                new File([""], "Orçamento_Parafusos_A.pdf", { type: "application/pdf" }),
                new File([""], "Orçamento_Fornecedor_B.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
                new File([""], "Orçamento_Distribuidora_C.pdf", { type: "application/pdf" })
              ];
              setFiles(dummyFiles);
              // Small timeout to allow UI to update before processing starts
              setTimeout(() => {
                // Trigger process automatically or let user click? 
                // Let's just fill them and let user click process to feel control, 
                // OR trigger the process function logic directly.
                // Re-using the logic requires extraction or state manipulation.
                // For simplicity in this event handler:
                setIsProcessing(true);
                let p = 0;
                const interval = setInterval(() => {
                  p += 5;
                  if (p > 100) {
                    clearInterval(interval);
                    setIsProcessing(false);
                    onComplete(dummyFiles);
                  } else {
                    setProgress(p);
                  }
                }, 150);
              }, 500);
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            Não tem arquivos agora? <span className="font-bold">Simular com dados de exemplo</span>
          </button>
        </div>
      )}
      
      {files.length < 2 && files.length > 0 && !isProcessing && (
        <p className="text-center text-xs text-muted-foreground">Adicione pelo menos 2 orçamentos para comparar.</p>
      )}
    </div>
  );
}
