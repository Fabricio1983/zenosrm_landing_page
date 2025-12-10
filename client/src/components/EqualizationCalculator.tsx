import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingDown,
  Award,
  Plus,
  Trash2,
  Calculator,
  CheckCircle,
  Building2,
  Mail,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from "lucide-react";

// --- Types ---
type Item = {
  id: string;
  name: string;
  quantity: number;
};

type Proposal = {
  itemId: string;
  supplierName: string;
  price: number;
};

type Supplier = {
  id: string;
  name: string;
};

// --- Constants ---
const MENSALIDADE_ZENO = 497;
const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export function EqualizationCalculator() {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<Item[]>([{ id: "1", name: "", quantity: 1 }]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "A", name: "Fornecedor A" },
    { id: "B", name: "Fornecedor B" }
  ]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadData, setLeadData] = useState({ email: "", company: "" });
  const [results, setResults] = useState<{
    bestCombinationTotal: number;
    bestPackageTotal: number;
    bestPackageSupplier: string;
    savings: number;
    roi: string;
    monthsPaid: number;
  } | null>(null);

  // --- Step 1 Handlers ---
  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), name: "", quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const validateStep1 = () => {
    return items.every(i => i.name.trim() !== "" && i.quantity > 0);
  };

  // --- Step 2 Handlers ---
  const addSupplier = () => {
    const newId = String.fromCharCode(65 + suppliers.length); // A, B, C...
    setSuppliers([...suppliers, { id: newId, name: `Fornecedor ${newId}` }]);
  };

  const updateProposal = (itemId: string, supplierName: string, price: number) => {
    const existing = proposals.find(p => p.itemId === itemId && p.supplierName === supplierName);
    if (existing) {
      setProposals(proposals.map(p => p === existing ? { ...p, price } : p));
    } else {
      setProposals([...proposals, { itemId, supplierName, price }]);
    }
  };

  const getPrice = (itemId: string, supplierName: string) => {
    return proposals.find(p => p.itemId === itemId && p.supplierName === supplierName)?.price || 0;
  };

  // --- Calculation Logic ---
  const calculateEqualization = () => {
    // Basic validation: ensure we have prices
    const hasPrices = items.every(item => 
      suppliers.every(supplier => getPrice(item.id, supplier.name) > 0)
    );
    
    if (!hasPrices) {
      alert("Por favor, preencha todos os preços para prosseguir."); // Simple alert for prototype
      return;
    }

    setLeadModalOpen(true);
  };

  const runCalculation = () => {
    // 1. Best Combination (Mix & Match)
    let bestCombinationTotal = 0;
    items.forEach(item => {
      let minPrice = Infinity;
      suppliers.forEach(supplier => {
        const price = getPrice(item.id, supplier.name);
        if (price > 0 && price < minPrice) minPrice = price;
      });
      bestCombinationTotal += minPrice * item.quantity;
    });

    // 2. Best Package (Single Source)
    let bestPackageTotal = Infinity;
    let bestPackageSupplier = "";

    suppliers.forEach(supplier => {
      let packageTotal = 0;
      let complete = true;
      items.forEach(item => {
        const price = getPrice(item.id, supplier.name);
        if (price <= 0) complete = false;
        packageTotal += price * item.quantity;
      });

      if (complete && packageTotal < bestPackageTotal) {
        bestPackageTotal = packageTotal;
        bestPackageSupplier = supplier.name;
      }
    });

    const savings = bestPackageTotal - bestCombinationTotal;
    const monthsPaid = Math.floor(savings / MENSALIDADE_ZENO);
    const roi = ((savings / MENSALIDADE_ZENO) * 100).toFixed(0);

    setResults({
      bestCombinationTotal,
      bestPackageTotal,
      bestPackageSupplier,
      savings,
      roi,
      monthsPaid
    });
    setStep(4);
  };

  const submitLead = () => {
    if (!leadData.email.includes("@") || !leadData.company) return;
    console.log("Lead Capturado:", leadData);
    setLeadModalOpen(false);
    runCalculation();
  };

  // --- Render Steps ---
  return (
    <div className="w-full max-w-5xl mx-auto font-sans" id="calculadora">
      <div className="text-center mb-10">
        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Ferramenta Gratuita</span>
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Calcule sua Economia</h2>
        <p className="text-muted-foreground">Simule uma equalização real e veja o ROI do Zeno SRM.</p>
      </div>

      <Card className="border-none shadow-2xl ring-1 ring-border/50 bg-white overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 w-full">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <CardContent className="p-6 sm:p-10">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Adicione os Itens
                </h3>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
                  <Plus size={16} /> Adicionar Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Descrição do Item</Label>
                      <Input 
                        placeholder="Ex: Cadeira de Escritório" 
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Qtd</Label>
                      <Input 
                        type="number" 
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                        className="bg-slate-50 text-center"
                      />
                    </div>
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => validateStep1() ? setStep(2) : alert("Preencha todos os campos")} 
                  className="bg-primary hover:bg-blue-600 gap-2"
                >
                  Próximo <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Preencha os Preços Unitários
                </h3>
                <Button variant="outline" size="sm" onClick={addSupplier} className="gap-2">
                  <Plus size={16} /> Novo Fornecedor
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-xl shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[200px]">Item</TableHead>
                      <TableHead className="w-[80px] text-center">Qtd</TableHead>
                      {suppliers.map(supplier => (
                        <TableHead key={supplier.id} className="min-w-[140px]">
                          <Input 
                            value={supplier.name} 
                            onChange={(e) => {
                              setSuppliers(suppliers.map(s => s.id === supplier.id ? { ...s, name: e.target.value } : s));
                            }}
                            className="h-8 text-sm font-semibold bg-transparent border-transparent hover:border-border focus:bg-white text-center"
                          />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{item.quantity}</TableCell>
                        {suppliers.map(supplier => (
                          <TableCell key={supplier.id}>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                              <Input 
                                type="number" 
                                min={0}
                                className="pl-7 h-9" 
                                placeholder="0,00"
                                value={getPrice(item.id, supplier.name) || ""}
                                onChange={(e) => updateProposal(item.id, supplier.name, parseFloat(e.target.value))}
                              />
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                  <ChevronLeft size={16} /> Voltar
                </Button>
                <Button 
                  onClick={calculateEqualization} 
                  className="bg-accent hover:bg-orange-600 text-white font-bold gap-2 shadow-lg shadow-orange-500/20"
                >
                  <Calculator size={16} /> Calcular Equalização
                </Button>
              </div>
            </div>
          )}

          {step === 4 && results && (
            <div className="space-y-8 animate-in fade-in zoom-in-95">
              <div className="text-center">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-4 px-3 py-1 text-sm font-bold border-green-200">
                  <CheckCircle size={14} className="mr-1" /> Análise Concluída
                </Badge>
                <h3 className="text-3xl font-heading font-bold mb-2">Resultado da Equalização</h3>
                <p className="text-muted-foreground">Veja quanto você economizaria usando a inteligência do Zeno.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1: Economia Potencial */}
                <Card className="bg-green-50 border-green-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingDown size={100} className="text-green-600" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-800 text-lg">Economia Potencial</CardTitle>
                    <CardDescription className="text-green-600">Diferença entre o melhor pacote e a melhor combinação.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-700 mb-2">{formatCurrency(results.savings)}</div>
                    <div className="text-sm font-medium text-green-800 bg-green-200/50 inline-block px-2 py-1 rounded-md">
                      Paga {results.monthsPaid} meses do Zeno Start
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Melhor Pacote (Single Source) */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Melhor Pacote</CardTitle>
                      <Badge variant="outline" className="text-xs">Single Source</Badge>
                    </div>
                    <CardDescription>Comprando tudo de um único fornecedor.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">{results.bestPackageSupplier}</div>
                    <div className="text-xl text-muted-foreground">{formatCurrency(results.bestPackageTotal)}</div>
                  </CardContent>
                </Card>

                {/* Card 3: Melhor Combinação (Multi Source) */}
                <Card className="border-border shadow-sm bg-blue-50/30">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-primary">Melhor Combinação</CardTitle>
                      <Badge className="bg-primary hover:bg-primary text-xs">Recomendado</Badge>
                    </div>
                    <CardDescription>Comprando item a item pelo menor preço.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-1">Múltiplos Fornecedores</div>
                    <div className="text-xl font-bold text-foreground">{formatCurrency(results.bestCombinationTotal)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Final */}
              <div className="bg-primary rounded-2xl p-8 text-center text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-4">Quer automatizar suas equalizações?</h4>
                  <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                    No Zeno, isso é feito automaticamente em segundos. Pare de perder tempo e dinheiro com planilhas manuais.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-bold border-none">
                      Começar Agora Grátis
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-white hover:text-white/80 underline-offset-4"
                      onClick={() => {
                        setStep(1);
                        setItems([{ id: "1", name: "", quantity: 1 }]);
                        setProposals([]);
                      }}
                    >
                      Fazer nova simulação
                    </Button>
                  </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                   <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                   <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Capture Modal */}
      <Dialog open={leadModalOpen} onOpenChange={setLeadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Quase lá!</DialogTitle>
            <DialogDescription className="text-center">
              Insira seu e-mail corporativo para liberar o relatório completo de economia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company">Nome da Empresa</Label>
              <Input 
                id="company" 
                placeholder="Sua Empresa Ltda" 
                value={leadData.company}
                onChange={(e) => setLeadData({...leadData, company: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu.nome@empresa.com.br" 
                value={leadData.email}
                onChange={(e) => setLeadData({...leadData, email: e.target.value})}
              />
            </div>
            <Button className="w-full bg-primary hover:bg-blue-600 font-bold" onClick={submitLead}>
              Ver Minha Economia
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Prometemos não enviar spam. Seus dados estão seguros.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
