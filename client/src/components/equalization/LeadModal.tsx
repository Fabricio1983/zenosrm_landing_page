import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  empresa: z.string().min(2, "Nome da empresa é obrigatório"),
  email: z.string().email("Email inválido"),
});

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export function LeadModal({ open, onOpenChange, onSubmit }: LeadModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa: "",
      email: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4 pt-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary mb-2">
            <ShieldCheck size={24} />
          </div>
          <DialogTitle className="text-2xl font-bold font-heading">Sua equalização está pronta!</DialogTitle>
          <DialogDescription className="text-base">
            Para liberar o relatório completo de economia e a melhor combinação de compras, informe seus dados profissionais.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Zeno Tecnologia" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Corporativo *</FormLabel>
                  <FormControl>
                    <Input placeholder="seunome@empresa.com" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">
              Ver Minha Economia
            </Button>
            
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Ao preencher, você concorda em receber dicas e novidades sobre o universo de compras. Pode cancelar a qualquer momento.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
