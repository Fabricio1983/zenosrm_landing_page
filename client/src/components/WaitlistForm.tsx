import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

interface WaitlistFormProps {
  source: 'hero' | 'diagnostic' | 'equalization' | 'pricing' | 'sticky';
  variant?: 'card' | 'inline' | 'compact';
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onSuccess?: () => void;
}

interface WaitlistData {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  source: string;
}

export function WaitlistForm({ 
  source, 
  variant = 'card',
  title = 'Entre na Lista de Espera',
  subtitle = 'Seja avisado assim que liberarmos o acesso',
  buttonText = 'Garantir minha vaga',
  onSuccess
}: WaitlistFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: WaitlistData) => {
      const apiUrl = import.meta.env.VITE_WAITLIST_API_URL || '/api/waitlist';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao cadastrar');
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      onSuccess?.();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...formData, source });
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (submitted) {
    return (
      <div className={`text-center py-8 ${variant === 'card' ? 'bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8' : ''}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Você está na lista!</h3>
        <p className="text-muted-foreground">
          Entraremos em contato assim que liberarmos o acesso.
        </p>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Seu nome"
          value={formData.nome}
          onChange={handleChange('nome')}
          required
          data-testid={`input-waitlist-nome-${source}`}
        />
        <Input
          placeholder="Nome da empresa"
          value={formData.empresa}
          onChange={handleChange('empresa')}
          required
          data-testid={`input-waitlist-empresa-${source}`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange('email')}
          required
          data-testid={`input-waitlist-email-${source}`}
        />
        <Input
          type="tel"
          placeholder="WhatsApp"
          value={formData.telefone}
          onChange={handleChange('telefone')}
          required
          data-testid={`input-waitlist-telefone-${source}`}
        />
      </div>
      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-12 text-lg font-bold"
        disabled={mutation.isPending}
        data-testid={`button-waitlist-submit-${source}`}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Cadastrando...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
      {mutation.isError && (
        <p className="text-red-500 text-sm text-center">Erro ao cadastrar. Tente novamente.</p>
      )}
    </form>
  );

  if (variant === 'inline') {
    return (
      <div className="space-y-4">
        {title && <h3 className="text-xl font-bold text-center text-foreground">{title}</h3>}
        {subtitle && <p className="text-muted-foreground text-center">{subtitle}</p>}
        {formContent}
      </div>
    );
  }

  if (variant === 'compact') {
    return formContent;
  }

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-center text-white">
        <Sparkles className="w-8 h-8 mx-auto mb-2" />
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-blue-100 text-sm mt-1">{subtitle}</p>
      </div>
      <CardContent className="p-6">
        {formContent}
      </CardContent>
    </Card>
  );
}
