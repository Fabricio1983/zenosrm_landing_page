import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface Lead {
  id: string;
  empresa: string;
  email: string;
  date: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const savedLeads = JSON.parse(localStorage.getItem('zeno_demo_leads') || '[]');
    setLeads(savedLeads);
  }, []);

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
