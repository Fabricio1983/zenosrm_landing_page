import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Trash2, ArrowLeft, Lock } from "lucide-react";
import { Link } from "wouter";

interface Lead {
  id: string;
  empresa: string;
  email: string;
  date: string;
}

export default function LeadsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    // Check if previously authenticated in this session
    const auth = sessionStorage.getItem("leads_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadLeads();
    }
  }, []);

  const loadLeads = () => {
    const savedLeads = JSON.parse(localStorage.getItem('zeno_demo_leads') || '[]');
    setLeads(savedLeads);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "fabricio.7f@gmail.com" && password === "@Aug325791") {
      setIsAuthenticated(true);
      sessionStorage.setItem("leads_admin_auth", "true");
      loadLeads();
      setError("");
    } else {
      setError("Credenciais inválidas");
    }
  };

  const clearLeads = () => {
    if (confirm("Tem certeza que deseja limpar todos os leads?")) {
      localStorage.removeItem('zeno_demo_leads');
      setLeads([]);
    }
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-slate-900">Leads Capturados</h1>
              <p className="text-slate-500">Lista de empresas que realizaram a equalização na Landing Page.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearLeads} disabled={leads.length === 0} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={16} className="mr-2" />
              Limpar Lista
            </Button>
            <Button onClick={exportCSV} disabled={leads.length === 0} className="bg-primary">
              <Download size={16} className="mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Total: {leads.length} leads</CardTitle>
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
      </div>
    </div>
  );
}
