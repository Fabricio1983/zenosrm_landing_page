import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadStep } from './UploadStep';
import { ReviewStep } from './ReviewStep';
import { LeadModal } from './LeadModal';
import { ResultStep } from './ResultStep';
import { Fornecedor, generateMockFornecedor } from './types';

export function EqualizacaoDemo() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadComplete = (files: File[]) => {
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
    console.log("Lead captured:", data);
    // Simulate API call
    setTimeout(() => {
      setIsModalOpen(false);
      setStep(4); // Show results
    }, 1000);
  };

  const handleReset = () => {
    setFornecedores([]);
    setStep(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm ring-1 ring-border/50">
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
