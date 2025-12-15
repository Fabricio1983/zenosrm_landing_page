import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fornecedor, MOCK_ITENS, formatCurrency } from './types';
import { ArrowLeft, Check, Trophy, TrendingDown, RefreshCw, BarChart3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ResultStepProps {
  fornecedores: Fornecedor[];
  onReset: () => void;
  onBack: () => void;
}

export function ResultStep({ fornecedores, onReset, onBack }: ResultStepProps) {
  // Logic to calculate best combination
  const getBestCombination = () => {
    let total = 0;
    const items = MOCK_ITENS.map(item => {
      let lowest = Infinity;
      let fornecedorId = "";
      let fornecedorName = "";
      
      fornecedores.forEach(f => {
        const price = f.precos.find(p => p.itemId === item.id);
        if (price && price.precoUnitario !== null && price.precoUnitario < lowest) {
          lowest = price.precoUnitario;
          fornecedorId = f.id;
          fornecedorName = f.nome;
        }
      });
      
      const finalPrice = lowest === Infinity ? 0 : lowest;
      const itemTotal = finalPrice * item.quantidade;
      total += itemTotal;
      
      return {
        ...item,
        bestPrice: finalPrice,
        bestTotal: itemTotal,
        fornecedorId,
        fornecedorName
      };
    });
    
    return { total, items };
  };

  const getBestSinglePackage = () => {
    return fornecedores.reduce((prev, curr) => prev.total < curr.total ? prev : curr);
  };

  const bestCombo = getBestCombination();
  const bestSingle = getBestSinglePackage();
  
  // Calculate savings compared to the most expensive single supplier (worst case)
  // Or compared to best single package (opportunity cost of splitting)
  // Let's compare best combo vs best single package to show "Equalization Power"
  const savings = bestSingle.total - bestCombo.total;
  const savingsPercent = (savings / bestSingle.total) * 100;
  
  // ROI Calculation (Zeno cost R$ 497)
  const zenoMonths = savings / 497;
  const isHighSavings = savings > 400;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* 1. Main Savings Hero */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl text-muted-foreground font-medium">Economia Potencial Encontrada</h2>
        <div className="text-5xl md:text-6xl font-heading font-bold text-green-600 tracking-tight">
          {formatCurrency(savings)}
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
          <TrendingDown size={16} />
          <span>{savingsPercent.toFixed(1)}% de redução de custo</span>
        </div>
        
        <div className={`max-w-2xl mx-auto mt-6 p-6 border rounded-xl text-sm shadow-sm transition-all ${
          isHighSavings ? "bg-green-50 border-green-200 text-green-900" : "bg-yellow-50 border-yellow-200 text-yellow-900"
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className={`p-3 rounded-full shrink-0 ${isHighSavings ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
               {isHighSavings ? <Trophy size={24} /> : <TrendingDown size={24} />}
            </div>
            <div>
              <strong className="block text-lg mb-1">Impacto Imediato:</strong>
              {isHighSavings ? (
                <span>
                   Uau! Com a economia de apenas <strong>UMA equalização</strong>, você paga praticamente <strong>o mês inteiro</strong> do Zeno e ainda sobra dinheiro. Imagine esse impacto multiplicado por todas as suas compras do ano.
                </span>
              ) : (
                <span>
                   Esta equalização sozinha já cobre <strong>{(zenoMonths * 100).toFixed(0)}% da mensalidade</strong> do Zeno. Com apenas mais uma ou duas compras como essa, o sistema sai de graça para sua empresa.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Strategies Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Single Source */}
        <Card className="border-border shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100"><Trophy size={16} className="text-slate-500" /></div>
              Melhor Pacote (Fornecedor Único)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{formatCurrency(bestSingle.total)}</div>
            <div className="text-sm font-medium text-primary">{bestSingle.nome}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Ideal se você quiser emitir apenas um pedido e economizar no frete/logística.
            </p>
          </CardContent>
        </Card>

        {/* Multi Source */}
        <Card className="border-primary shadow-lg relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 p-3">
            <div className="text-xs font-bold text-white bg-accent px-2 py-1 rounded-full shadow-sm">RECOMENDADO</div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingDown size={16} className="text-primary" /></div>
              Melhor Combinação (Equalização)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1 text-green-600">{formatCurrency(bestCombo.total)}</div>
            <div className="text-sm font-medium text-muted-foreground">Mix de fornecedores</div>
            <p className="text-xs text-muted-foreground mt-2">
              Comprando cada item de quem tem o melhor preço.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2.5 Supplier Comparison List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" />
          Comparativo por Fornecedor
        </h3>
        <div className="grid gap-4">
          {fornecedores.map(f => {
            const savingsValue = f.total - bestCombo.total;
            const savingsPct = (savingsValue / f.total) * 100;
            const isBestSingle = f.id === bestSingle.id;

            return (
              <Card key={f.id} className={`border border-border shadow-sm ${isBestSingle ? "bg-slate-50" : "bg-white"}`}>
                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="min-w-[150px]">
                    <div className="font-bold text-foreground">{f.nome}</div>
                    <div className="text-sm text-muted-foreground">Total da Proposta: {formatCurrency(f.total)}</div>
                  </div>
                  
                  <div className="flex items-center gap-6 flex-1 justify-end">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Economia com Equalização</div>
                      <div className="font-bold text-green-600 text-lg">
                        {formatCurrency(savingsValue)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                      <TrendingDown size={14} />
                      {savingsPct.toFixed(1)}% OFF
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Breakdown */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Lista de Itens (Menor Preço Encontrado)</h3>
          <span className="text-xs font-medium px-2 py-1 bg-white border border-border rounded text-muted-foreground">
            {bestCombo.items.length} itens equalizados
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Melhor Fornecedor</TableHead>
                <TableHead className="text-right">Unitário</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestCombo.items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm">{item.descricao}</TableCell>
                  <TableCell className="text-sm text-primary">{item.fornecedorName}</TableCell>
                  <TableCell className="text-right text-sm">{formatCurrency(item.bestPrice)}</TableCell>
                  <TableCell className="text-right font-bold text-sm">{formatCurrency(item.bestTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 4. Final CTA */}
      <Card className="bg-primary text-white border-none shadow-xl">
        <CardContent className="p-8 md:p-10 text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-heading font-bold">Quer automatizar suas equalizações?</h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="flex items-center gap-3"><div className="bg-white/20 p-1 rounded-full"><Check size={14} /></div> Envie RFQs por email automaticamente</div>
            <div className="flex items-center gap-3"><div className="bg-white/20 p-1 rounded-full"><Check size={14} /></div> Equalize em segundos, não em horas</div>
            <div className="flex items-center gap-3"><div className="bg-white/20 p-1 rounded-full"><Check size={14} /></div> Receba propostas padronizadas</div>
            <div className="flex items-center gap-3"><div className="bg-white/20 p-1 rounded-full"><Check size={14} /></div> Gere pedidos com 1 clique</div>
          </div>
          
          <div className="pt-4">
            <Button size="lg" className="bg-white text-primary hover:bg-blue-50 text-lg h-14 px-8 font-bold shadow-lg">
              Começar Agora - 7 dias Grátis
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pb-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={onBack}
          variant="outline"
          size="lg"
          className="gap-2 font-semibold"
        >
          <ArrowLeft size={16} />
          Voltar e Editar Orçamentos
        </Button>
        <Button 
          onClick={onReset}
          variant="ghost"
          size="lg"
          className="gap-2 font-semibold text-muted-foreground"
        >
          <RefreshCw size={16} />
          Reiniciar do Zero
        </Button>
      </div>
    </div>
  );
}
