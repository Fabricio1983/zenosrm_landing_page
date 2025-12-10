import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone'; // Need to check if this is installed, if not will use standard input
import { Upload, FileText, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UploadStepProps {
  onComplete: (files: File[]) => void;
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => {
      const newFiles = [...prev, ...acceptedFiles].slice(0, 3);
      return newFiles;
    });
  }, []);

  // Simple drag and drop implementation without extra library if needed, 
  // but let's assume standard HTML5 drag and drop for simplicity and speed in prototype
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 3));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = () => {
    setIsProcessing(true);
    // Simulate AI Processing
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      if (p > 100) {
        clearInterval(interval);
        setIsProcessing(false);
        onComplete(files);
      } else {
        setProgress(p);
      }
    }, 150); // 3 seconds total approx
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold text-foreground">Calcule sua Economia com Equalização Inteligente</h2>
        <p className="text-muted-foreground">Faça upload de até 3 orçamentos para nossa IA analisar.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative">
            {files[i] ? (
              <Card className="h-48 border-2 border-primary/20 bg-blue-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => removeFile(i)} className="p-1 hover:bg-red-100 rounded-full text-red-500">
                    <X size={16} />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                  <Check size={24} />
                </div>
                <p className="font-semibold text-sm text-center truncate w-full px-2">{files[i].name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(files[i].size / 1024).toFixed(1)} KB</p>
                {isProcessing && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                )}
              </Card>
            ) : (
              <label className="h-48 border-2 border-dashed border-border hover:border-primary/50 hover:bg-slate-50 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all group">
                <input 
                  type="file" 
                  accept=".pdf,.xlsx,.csv,.jpg,.png,.jpeg" 
                  className="hidden" 
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-blue-50 flex items-center justify-center mb-3 transition-colors">
                  <Upload size={24} />
                </div>
                <p className="font-medium text-sm text-center text-foreground">Orçamento {i + 1}</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Arraste ou clique</p>
              </label>
            )}
          </div>
        ))}
      </div>

      {isProcessing && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary font-medium">
            <Loader2 className="animate-spin" size={20} />
            <span>Processando com IA...</span>
          </div>
          <p className="text-xs text-muted-foreground">Extraindo itens, quantidades e preços unitários...</p>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button 
          size="lg" 
          className="w-full md:w-auto min-w-[200px] h-12 text-lg font-bold shadow-lg shadow-primary/20"
          disabled={files.length < 2 || isProcessing} // Require at least 2 for meaningful comparison
          onClick={handleProcess}
        >
          {isProcessing ? 'Processando...' : 'Processar Orçamentos'}
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
