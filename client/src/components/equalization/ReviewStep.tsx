import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Pencil, ArrowLeft, Plus, X } from 'lucide-react';
import { Fornecedor, MOCK_ITENS, formatCurrency, PrecoItem } from './types';
import { Badge } from '@/components/ui/badge';

interface ReviewStepProps {
  fornecedores: Fornecedor[];
  onConfirm: (updatedFornecedores: Fornecedor[]) => void;
  onBack: () => void;
}

export function ReviewStep({ fornecedores: initialFornecedores, onConfirm, onBack }: ReviewStepProps) {
  const [fornecedores, setFornecedores] = useState(initialFornecedores);

  const handleNameChange = (id: string, newName: string) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, nome: newName } : f));
  };

  const handlePriceChange = (fornecedorId: string, itemId: string, value: string) => {
    const numValue = parseFloat(value.replace(',', '.')) || 0;
    const item = MOCK_ITENS.find(i => i.id === itemId);
    const quantidade = item?.quantidade || 1;
    
    setFornecedores(prev => prev.map(f => {
      if (f.id !== fornecedorId) return f;
      
      const updatedPrecos = f.precos.map(p => {
        if (p.itemId !== itemId) return p;
        return {
          ...p,
          precoUnitario: numValue,
          precoTotal: numValue * quantidade
        };
      });
      
      const subtotal = updatedPrecos.reduce((acc, p) => acc + (p.precoTotal || 0), 0);
      const impostos = subtotal * 0.1;
      
      return {
        ...f,
        precos: updatedPrecos,
        subtotal,
        impostos,
        total: subtotal + impostos
      };
    }));
  };

  const addManualSupplier = () => {
    if (fornecedores.length >= 3) return;
    
    const newId = `manual-${Date.now()}`;
    const emptyPrecos: PrecoItem[] = MOCK_ITENS.map(item => ({
      itemId: item.id,
      precoUnitario: null,
      precoTotal: null
    }));
    
    const newFornecedor: Fornecedor = {
      id: newId,
      nome: '',
      precos: emptyPrecos,
      total: 0,
      subtotal: 0,
      impostos: 0,
      fileName: 'Manual',
      isManual: true
    };
    
    setFornecedores(prev => [...prev, newFornecedor]);
  };

  const removeManualSupplier = (id: string) => {
    setFornecedores(prev => prev.filter(f => f.id !== id));
  };

  const getLowestPriceId = (itemId: string) => {
    let lowest = Infinity;
    let fornecedorId = "";
    
    fornecedores.forEach(f => {
      const item = f.precos.find(p => p.itemId === itemId);
      if (item && item.precoUnitario !== null && item.precoUnitario < lowest) {
        lowest = item.precoUnitario;
        fornecedorId = f.id;
      }
    });
    return lowest === Infinity ? "" : fornecedorId;
  };

  const isManualComplete = (f: Fornecedor) => {
    if (!f.isManual) return true;
    if (!f.nome.trim()) return false;
    return f.precos.every(p => p.precoUnitario !== null && p.precoUnitario > 0);
  };

  const canConfirm = fornecedores.length >= 2 && fornecedores.every(isManualComplete);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold text-foreground">Revisão dos Dados Extraídos</h2>
        <p className="text-muted-foreground">Nossa IA identificou os seguintes itens. Edite os nomes se necessário.</p>
      </div>

      {fornecedores.length < 3 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={addManualSupplier}
            className="gap-2"
            data-testid="button-add-manual-supplier"
          >
            <Plus size={16} />
            Adicionar Orçamento Manual
          </Button>
        </div>
      )}

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
                      {f.isManual ? (
                        <>
                          <Input 
                            value={f.nome} 
                            onChange={(e) => handleNameChange(f.id, e.target.value)}
                            placeholder="Nome do fornecedor"
                            className="h-8 bg-white border-primary/30 font-semibold text-foreground min-w-[140px]"
                            data-testid={`input-supplier-name-${f.id}`}
                          />
                          <button 
                            onClick={() => removeManualSupplier(f.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            data-testid={`button-remove-supplier-${f.id}`}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Input 
                            value={f.nome} 
                            onChange={(e) => handleNameChange(f.id, e.target.value)}
                            className="h-8 bg-transparent border-transparent hover:border-border focus:bg-white transition-all font-semibold text-foreground min-w-[140px]"
                          />
                          <Pencil size={14} className="text-muted-foreground opacity-50" />
                        </>
                      )}
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
                      const isBest = f.id === bestPriceFornId && bestPriceFornId !== "";
                      
                      return (
                        <TableCell key={f.id} className={isBest ? "bg-green-50/50" : ""}>
                          {f.isManual ? (
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="0,00"
                              value={price?.precoUnitario !== null ? price?.precoUnitario?.toString().replace('.', ',') : ''}
                              onChange={(e) => handlePriceChange(f.id, item.id, e.target.value)}
                              className="h-8 w-24 text-right"
                              data-testid={`input-price-${f.id}-${item.id}`}
                            />
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${isBest ? "text-green-700" : "text-slate-600"}`}>
                                {price && price.precoUnitario !== null ? formatCurrency(price.precoUnitario) : "-"}
                              </span>
                              {isBest && <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 h-5 px-1.5 ml-2"><Check size={10} /></Badge>}
                            </div>
                          )}
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
                    {f.total > 0 ? formatCurrency(f.total) : '-'}
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
          disabled={!canConfirm}
        >
          Ver Minha Economia
        </Button>
      </div>
      
      {!canConfirm && fornecedores.some(f => f.isManual) && (
        <p className="text-center text-sm text-amber-600">
          Preencha o nome e todos os preços do fornecedor manual para continuar.
        </p>
      )}
    </div>
  );
}
