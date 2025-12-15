import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Download, Trash2, ArrowLeft, Lock, Settings, Users, Save } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  empresa: string;
  email: string;
  date: string;
}

interface AppConfig {
  dailyLimit: number;
  sessionLimit: number;
  trialDays: number;
  enableLimits: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  dailyLimit: 5,
  sessionLimit: 3,
  trialDays: 7,
  enableLimits: true
};

export default function LeadsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const { toast } = useToast();

  useEffect(() => {
    // Check if previously authenticated in this session
    const auth = sessionStorage.getItem("leads_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = () => {
    // Load Leads
    const savedLeads = JSON.parse(localStorage.getItem('zeno_demo_leads') || '[]');
    setLeads(savedLeads);

    // Load Config
    const savedConfig = localStorage.getItem('zeno_app_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "fabricio.7f@gmail.com" && password === "@Aug325791") {
      setIsAuthenticated(true);
      sessionStorage.setItem("leads_admin_auth", "true");
      loadData();
      setError("");
    } else {
      setError("Credenciais inválidas");
    }
  };

  const clearLeads = () => {
    if (confirm("Tem certeza que deseja limpar todos os leads?")) {
      localStorage.removeItem('zeno_demo_leads');
      setLeads([]);
      toast({
        title: "Lista limpa",
        description: "Todos os leads foram removidos com sucesso.",
      });
    }
  };

  const saveConfig = () => {
    localStorage.setItem('zeno_app_config', JSON.stringify(config));
    toast({
      title: "Configurações Salvas",
      description: "As regras de limite foram atualizadas na Landing Page.",
      className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  const exportCSV = () => {
    const headers = ["ID", "Empresa", "Email", "Data"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => [l.id, l.empresa, l.email, new Date(l.date).toLocaleString()].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "leads_zeno.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-2">
              <Lock size={24} />
            </div>
            <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
            <CardDescription>Área administrativa de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@zeno.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
              <Button type="submit" className="w-full h-11 font-bold">Entrar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">Painel Administrativo</h1>
              <p className="text-slate-500">Gestão de leads e configurações da Landing Page.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="leads" className="gap-2"><Users size={16} /> Leads Capturados</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings size={16} /> Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6 space-y-6">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clearLeads} disabled={leads.length === 0} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={16} className="mr-2" />
                Limpar Lista
              </Button>
              <Button onClick={exportCSV} disabled={leads.length === 0} className="bg-primary">
                <Download size={16} className="mr-2" />
                Exportar CSV
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Total: {leads.length} leads</CardTitle>
                <CardDescription>Lista de empresas que realizaram a equalização.</CardDescription>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    Nenhum lead capturado ainda.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="text-slate-500">
                            {new Date(lead.date).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{lead.empresa}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell className="text-right text-xs text-slate-400 font-mono">
                            {lead.id}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Limites de Uso Gratuito</CardTitle>
                <CardDescription>
                  Configure as restrições para usuários que acessam a Landing Page sem logar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Ativar Limites</Label>
                    <div className="text-sm text-muted-foreground">
                      Se desativado, o usuário pode equalizar ilimitadamente.
                    </div>
                  </div>
                  <Switch 
                    checked={config.enableLimits}
                    onCheckedChange={(checked) => setConfig({...config, enableLimits: checked})}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="dailyLimit">Limite Diário (por usuário)</Label>
                    <Input 
                      id="dailyLimit" 
                      type="number" 
                      min="1"
                      value={config.dailyLimit}
                      onChange={(e) => setConfig({...config, dailyLimit: parseInt(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground">Quantas equalizações um IP pode fazer por dia.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="sessionLimit">Limite por Sessão</Label>
                    <Input 
                      id="sessionLimit" 
                      type="number" 
                      min="1"
                      value={config.sessionLimit}
                      onChange={(e) => setConfig({...config, sessionLimit: parseInt(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground">Quantas vezes pode simular antes de pedir cadastro.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="trialDays">Dias de Teste Grátis</Label>
                    <Input 
                      id="trialDays" 
                      type="number" 
                      min="1"
                      value={config.trialDays}
                      onChange={(e) => setConfig({...config, trialDays: parseInt(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground">Dias após o primeiro acesso que o uso é permitido.</p>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button onClick={saveConfig} className="w-full md:w-auto font-bold bg-green-600 hover:bg-green-700">
                    <Save size={16} className="mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
