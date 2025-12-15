import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Edit2, Pencil, ArrowLeft } from 'lucide-react';
import { Fornecedor, MOCK_ITENS, formatCurrency } from './types';
import { Badge } from '@/components/ui/badge';

interface ReviewStepProps {
  fornecedores: Fornecedor[];
  onConfirm: (updatedFornecedores: Fornecedor[]) => void;
  onBack: () => void;
}

export function ReviewStep({ fornecedores: initialFornecedores, onConfirm, onBack }: ReviewStepProps) {
  const [fornecedores, setFornecedores] = useState(initialFornecedores);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleNameChange = (id: string, newName: string) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, nome: newName } : f));
  };

  // Logic to find lowest price for each item row
  const getLowestPriceId = (itemId: string) => {
    let lowest = Infinity;
    let fornecedorId = "";
    
    fornecedores.forEach(f => {
      const item = f.precos.find(p => p.itemId === itemId);
      if (item && item.precoUnitario < lowest) {
        lowest = item.precoUnitario;
        fornecedorId = f.id;
      }
    });
    return fornecedorId;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold text-foreground">Revisão dos Dados Extraídos</h2>
        <p className="text-muted-foreground">Nossa IA identificou os seguintes itens. Edite os nomes se necessário.</p>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[300px]">Item</TableHead>
                <TableHead className="w-[80px] text-center">Qtd</TableHead>
                {fornecedores.map(f => (
                  <TableHead key={f.id} className="min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <Input 
                        value={f.nome} 
                        onChange={(e) => handleNameChange(f.id, e.target.value)}
                        className="h-8 bg-transparent border-transparent hover:border-border focus:bg-white transition-all font-semibold text-foreground min-w-[140px]"
                      />
                      <Pencil size={14} className="text-muted-foreground opacity-50" />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ITENS.map(item => {
                const bestPriceFornId = getLowestPriceId(item.id);
                
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-sm">
                      {item.descricao}
                      <span className="text-xs text-muted-foreground ml-1">({item.unidade})</span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{item.quantidade}</TableCell>
                    {fornecedores.map(f => {
                      const price = f.precos.find(p => p.itemId === item.id);
                      const isBest = f.id === bestPriceFornId;
                      
                      return (
                        <TableCell key={f.id} className={isBest ? "bg-green-50/50" : ""}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isBest ? "text-green-700" : "text-slate-600"}`}>
                              {price ? formatCurrency(price.precoUnitario) : "-"}
                            </span>
                            {isBest && <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 h-5 px-1.5 ml-2"><Check size={10} /></Badge>}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              
              {/* Totais Row */}
              <TableRow className="bg-slate-50 font-bold border-t-2 border-border">
                <TableCell colSpan={2} className="text-right uppercase text-xs tracking-wider text-muted-foreground">Total da Proposta</TableCell>
                {fornecedores.map(f => (
                  <TableCell key={f.id} className="text-base text-foreground">
                    {formatCurrency(f.total)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Button 
          size="lg" 
          variant="outline"
          className="gap-2"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Voltar e Trocar Arquivos
        </Button>
        <Button 
          size="lg" 
          className="min-w-[200px] h-12 text-lg font-bold shadow-lg shadow-primary/20"
          onClick={() => onConfirm(fornecedores)}
        >
          Ver Minha Economia
        </Button>
      </div>
    </div>
  );
}
