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
import { Lock } from 'lucide-react';

export function EqualizacaoDemo() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Limit Control State
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<"trial" | "daily" | "session" | null>(null);

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
        dailyCount: 0
      };
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
    // Increment Daily
    const stats: UsageStats = JSON.parse(localStorage.getItem('zeno_usage_stats') || '{}');
    stats.dailyCount = (stats.dailyCount || 0) + 1;
    localStorage.setItem('zeno_usage_stats', JSON.stringify(stats));

    // Increment Session
    const sessionCount = parseInt(sessionStorage.getItem('zeno_session_count') || '0');
    sessionStorage.setItem('zeno_session_count', (sessionCount + 1).toString());
  };

  const handleUploadComplete = (files: File[]) => {
    if (isBlocked) return;
    
    // Generate mock data based on files
    const mocks = files.map((f, i) => generateMockFornecedor(f.name, i));
    setFornecedores(mocks);
    setStep(2);
  };

  const handleReviewConfirm = (updated: Fornecedor[]) => {
    setFornecedores(updated);
    setIsModalOpen(true);
    // Don't advance step yet, wait for lead capture
  };

  const handleLeadSubmit = (data: any) => {
    // Save to localStorage for demo purposes
    const newLead = {
      ...data,
      date: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const existingLeads = JSON.parse(localStorage.getItem('zeno_demo_leads') || '[]');
    localStorage.setItem('zeno_demo_leads', JSON.stringify([newLead, ...existingLeads]));

    // Increment limits only on successful capture
    incrementUsage();

    // Simulate API call
    setTimeout(() => {
      setIsModalOpen(false);
      setStep(4); // Show results
    }, 1000);
  };

  const handleReset = () => {
    // Re-check limits before allowing reset
    checkLimits();
    if (!isBlocked) {
      setFornecedores([]);
      setStep(1);
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
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                 <Lock size={32} />
               </div>
               <h3 className="text-xl font-bold mb-2">{blockContent.title}</h3>
               <p className="text-muted-foreground mb-6">{blockContent.desc}</p>
               <button onClick={() => window.open("https://wa.me/5511999999999", "_blank")} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                 Falar com Consultor
               </button>
             </div>
           </div>
        )}

        <CardContent className="p-6 md:p-10">
          {step === 1 && <UploadStep onComplete={handleUploadComplete} />}
          {step === 2 && <ReviewStep fornecedores={fornecedores} onConfirm={handleReviewConfirm} />}
          {step === 4 && <ResultStep fornecedores={fornecedores} onReset={handleReset} />}
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
