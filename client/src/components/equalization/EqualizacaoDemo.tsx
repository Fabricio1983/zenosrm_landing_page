import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadStep } from './UploadStep';
import { ReviewStep } from './ReviewStep';
import { LeadModal } from './LeadModal';
import { ResultStep } from './ResultStep';
import { Fornecedor, generateMockFornecedor, AppConfig, DEFAULT_CONFIG, UsageStats } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lock, Phone, Unlock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function EqualizacaoDemo() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Limit Control State
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<"trial" | "daily" | "session" | null>(null);
  const [unlockPhone, setUnlockPhone] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = () => {
    // 1. Load Config
    const savedConfig = localStorage.getItem('zeno_app_config');
    const config: AppConfig = savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;

    if (!config.enableLimits) return;

    // 2. Load Usage Stats
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let stats: UsageStats = JSON.parse(localStorage.getItem('zeno_usage_stats') || 'null');
    
    if (!stats) {
      // First visit ever
      stats = {
        firstVisit: now.getTime(),
        lastVisitDate: todayStr,
        dailyCount: 0,
        completedEqualizations: 0
      };
      localStorage.setItem('zeno_usage_stats', JSON.stringify(stats));
    }
    
    // Ensure completedEqualizations exists (for users with old data)
    if (stats.completedEqualizations === undefined) {
      stats.completedEqualizations = 0;
      localStorage.setItem('zeno_usage_stats', JSON.stringify(stats));
    }

    // 3. Check Trial (Days)
    const daysSinceFirstVisit = (now.getTime() - stats.firstVisit) / (1000 * 60 * 60 * 24);
    if (daysSinceFirstVisit > config.trialDays) {
      setBlockReason("trial");
      setIsBlocked(true);
      return;
    }

    // 4. Check Daily Limit
    if (stats.lastVisitDate !== todayStr) {
      // New day, reset count
      stats.lastVisitDate = todayStr;
      stats.dailyCount = 0;
      localStorage.setItem('zeno_usage_stats', JSON.stringify(stats));
    }

    if (stats.dailyCount >= config.dailyLimit) {
      setBlockReason("daily");
      setIsBlocked(true);
      return;
    }

    // 5. Check Session Limit
    const sessionCount = parseInt(sessionStorage.getItem('zeno_session_count') || '0');
    if (sessionCount >= config.sessionLimit) {
      setBlockReason("session");
      setIsBlocked(true);
      return;
    }
  };

  const incrementUsage = () => {
    // Increment Daily and Total Completed
    const stats: UsageStats = JSON.parse(localStorage.getItem('zeno_usage_stats') || '{}');
    stats.dailyCount = (stats.dailyCount || 0) + 1;
    stats.completedEqualizations = (stats.completedEqualizations || 0) + 1;
    localStorage.setItem('zeno_usage_stats', JSON.stringify(stats));

    // Increment Session
    const sessionCount = parseInt(sessionStorage.getItem('zeno_session_count') || '0');
    sessionStorage.setItem('zeno_session_count', (sessionCount + 1).toString());
  };

  const handleUploadComplete = async (files: File[]) => {
    if (isBlocked) return;
    
    setUploadedFiles(files);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/process-quotes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process quotes');
      }

      const data = await response.json();
      setFornecedores(data.fornecedores);
      setStep(2);
    } catch (error) {
      console.error('Error processing quotes:', error);
      // Fallback to mock data if API fails
      const mocks = files.map((f, i) => generateMockFornecedor(f.name, i));
      setFornecedores(mocks);
      setStep(2);
    }
  };

  const handleReviewConfirm = (updated: Fornecedor[]) => {
    setFornecedores(updated);
    
    // Check if this is the first equalization - if so, skip lead form
    const stats: UsageStats = JSON.parse(localStorage.getItem('zeno_usage_stats') || '{}');
    const completedCount = stats.completedEqualizations || 0;
    
    if (completedCount === 0) {
      // First equalization: show results directly without form
      incrementUsage();
      setStep(4);
    } else {
      // Second+ equalization: require lead form first
      setIsModalOpen(true);
    }
  };

  const handleLeadSubmit = async (data: any) => {
    try {
      // Calculate total savings
      const bestMixTotal = fornecedores[0].precos.reduce((sum, item) => {
        const lowestPrice = Math.min(...fornecedores.map(f => 
          f.precos.find(p => p.itemId === item.itemId)?.precoUnitario || Infinity
        ));
        const quantity = fornecedores[0].precos.find(p => p.itemId === item.itemId)?.precoTotal || 0;
        const unitPrice = item.precoUnitario || 1;
        return sum + (lowestPrice * (quantity / unitPrice));
      }, 0);
      
      const worstTotal = Math.max(...fornecedores.map(f => f.total));
      const totalSavings = Math.round(worstTotal - bestMixTotal);

      // Save to backend
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead: data,
          fornecedores,
          items: [], // Items are embedded in fornecedores
          totalSavings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save lead');
      }

      // Also save to localStorage for backward compatibility
      const newLead = {
        ...data,
        date: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      const existingLeads = JSON.parse(localStorage.getItem('zeno_demo_leads') || '[]');
      localStorage.setItem('zeno_demo_leads', JSON.stringify([newLead, ...existingLeads]));

      // Increment limits only on successful capture
      incrementUsage();

      setIsModalOpen(false);
      setStep(4); // Show results
    } catch (error) {
      console.error('Error saving lead:', error);
      // Continue to results even if save fails
      incrementUsage();
      setIsModalOpen(false);
      setStep(4);
    }
  };

  const scrollToEqualization = () => {
    const element = document.getElementById('equalization');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    // Clear all data and go back to upload step
    setFornecedores([]);
    setUploadedFiles([]);
    setStep(1);
    setTimeout(scrollToEqualization, 100);
  };

  const handleBack = () => {
    // Go back to upload step keeping uploaded files for editing
    setStep(1);
    setTimeout(scrollToEqualization, 100);
  };

  const handleBackToUpload = () => {
    // Go back to upload step keeping files for editing
    setStep(1);
    setTimeout(scrollToEqualization, 100);
  };

  const handleUnlockWithPhone = async () => {
    if (!unlockPhone || unlockPhone.length < 10) return;
    
    setIsUnlocking(true);
    
    try {
      // Save phone lead to backend
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: { 
            empresa: 'Desbloqueio por telefone', 
            email: 'unlock@session.local',
            telefone: unlockPhone 
          },
          fornecedores: [],
          items: [],
          totalSavings: 0,
        }),
      });

      // Reset session count to allow more uses
      sessionStorage.setItem('zeno_session_count', '0');
      setIsBlocked(false);
      setBlockReason(null);
      setUnlockPhone("");
    } catch (error) {
      console.error('Error unlocking:', error);
    } finally {
      setIsUnlocking(false);
    }
  };

  // Block Modal Content
  const getBlockContent = () => {
    switch (blockReason) {
      case "trial":
        return {
          title: "Período de Teste Expirado",
          desc: "Seu período de teste gratuito de 7 dias encerrou. Para continuar economizando, escolha um plano."
        };
      case "daily":
        return {
          title: "Limite Diário Atingido",
          desc: "Você atingiu o limite de simulações por hoje. Volte amanhã ou fale com um consultor para acesso ilimitado."
        };
      case "session":
        return {
          title: "Limite da Sessão",
          desc: "Você fez muitas simulações seguidas. Atualize a página ou entre em contato para liberar seu acesso."
        };
      default:
        return { title: "Acesso Bloqueado", desc: "Entre em contato com o suporte." };
    }
  };

  const blockContent = getBlockContent();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm ring-1 ring-border/50 relative">
        {/* Overlay for Blocked State */}
        {isBlocked && step === 1 && (
           <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
             <div className="bg-white p-8 rounded-xl shadow-2xl border max-w-md text-center">
               {blockReason === "session" ? (
                 <>
                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                     <Phone size={32} />
                   </div>
                   <h3 className="text-xl font-bold mb-2">Quer continuar equalizando?</h3>
                   <p className="text-muted-foreground mb-4">
                     Informe seu telefone para liberar mais simulações agora, ou volte amanhã.
                   </p>
                   <div className="space-y-4">
                     <Input
                       type="tel"
                       placeholder="(11) 99999-9999"
                       value={unlockPhone}
                       onChange={(e) => setUnlockPhone(e.target.value)}
                       className="h-12 text-center text-lg"
                       data-testid="input-unlock-phone"
                     />
                     <Button 
                       onClick={handleUnlockWithPhone}
                       disabled={unlockPhone.length < 10 || isUnlocking}
                       className="w-full h-12 font-bold"
                       data-testid="button-unlock"
                     >
                       {isUnlocking ? "Liberando..." : (
                         <>
                           <Unlock size={18} className="mr-2" />
                           Liberar Mais Simulações
                         </>
                       )}
                     </Button>
                     <p className="text-xs text-muted-foreground">
                       Ou volte amanhã para mais simulações gratuitas.
                     </p>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                     <Lock size={32} />
                   </div>
                   <h3 className="text-xl font-bold mb-2">{blockContent.title}</h3>
                   <p className="text-muted-foreground mb-6">{blockContent.desc}</p>
                   <button onClick={() => window.open("https://wa.me/5511999999999", "_blank")} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                     Falar com Consultor
                   </button>
                 </>
               )}
             </div>
           </div>
        )}

        <CardContent className="p-6 md:p-10">
          {step === 1 && <UploadStep onComplete={handleUploadComplete} initialFiles={uploadedFiles} />}
          {step === 2 && <ReviewStep fornecedores={fornecedores} onConfirm={handleReviewConfirm} onBack={handleBack} />}
          {step === 4 && <ResultStep fornecedores={fornecedores} onReset={handleReset} onBack={handleBackToUpload} />}
        </CardContent>
      </Card>

      <LeadModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleLeadSubmit} 
      />
    </div>
  );
}
