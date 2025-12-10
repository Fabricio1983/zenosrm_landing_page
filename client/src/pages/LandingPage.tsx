import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EqualizacaoDemo } from "@/components/equalization/EqualizacaoDemo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  Menu,
  X,
  ArrowRight,
  Upload,
  FileText,
  Calculator,
  Building2,
  TrendingDown,
  Clock,
  AlertTriangle,
  BarChart3,
  Mail,
  Shield,
  Box,
  ShoppingCart,
  Users,
  LayoutDashboard,
  Factory,
  ChevronRight,
  Star
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 1. Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border h-16 sm:h-20">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <img src="/assets/logo.png" alt="Zeno SRM" className="h-8 sm:h-10 w-auto" />
            <span className="font-heading font-bold text-xl sm:text-2xl text-primary hidden sm:block">Zeno</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("solutions")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Soluções</button>
            <button onClick={() => scrollToSection("pricing")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Preços</button>
            <button onClick={() => scrollToSection("faq")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Para quem é</button>
            <Button variant="ghost" className="text-primary font-semibold hover:bg-blue-50">Entrar</Button>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" className="hidden lg:flex border-primary text-primary hover:bg-blue-50">
              Testar Sistema
            </Button>
            <Button 
              className="bg-accent hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20"
              onClick={() => scrollToSection("equalization")}
            >
              Fazer Equalização Grátis
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-foreground" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
            <button onClick={() => scrollToSection("solutions")} className="text-left py-2 font-medium text-muted-foreground">Soluções</button>
            <button onClick={() => scrollToSection("pricing")} className="text-left py-2 font-medium text-muted-foreground">Preços</button>
            <button onClick={() => scrollToSection("faq")} className="text-left py-2 font-medium text-muted-foreground">Para quem é</button>
            <div className="flex flex-col gap-3 mt-2">
              <Button variant="ghost" className="justify-start text-primary">Entrar</Button>
              <Button 
                className="w-full bg-accent hover:bg-orange-600 text-white"
                onClick={() => scrollToSection("equalization")}
              >
                Fazer Equalização Grátis
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-16 sm:pt-20">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="container mx-auto px-4 text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-semibold mb-6 border border-blue-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              +1.200 empresas já testaram
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
              Organize suas compras e <span className="text-primary">economize dinheiro</span>
              <br className="hidden md:block" /> sem planilhas complicadas.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Envie cotações, equalize em segundos e veja a economia real.
              Otimize seu processo de compras do início ao fim com o Zeno.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg h-14 px-8 bg-accent hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                onClick={() => scrollToSection("equalization")}
              >
                Equalizar Agora
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-lg h-14 px-8 border-2 hover:bg-gray-50 text-foreground"
              >
                Ver Demo Interativa
              </Button>
            </div>

            {/* Hero Visual / Video Placeholder */}
            <div className="relative mx-auto max-w-5xl rounded-xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden bg-slate-900 group">
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors cursor-pointer z-10">
              </div>
              <img 
                src="/assets/dashboard.png" 
                alt="Zeno Dashboard" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* 3. Equalization Widget Section */}
        <section id="equalization" className="py-20 bg-slate-50 relative border-y border-border">
          <div className="container mx-auto px-4">
            <EqualizacaoDemo />
          </div>
        </section>

        {/* 4. Social Proof */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold mb-4">
                O ZENO já ajudou empresas a economizar em compras reais.
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { quote: "Economizamos R$ 7.000 em uma única compra de insumos.", author: "Ricardo M.", role: "Gerente de Compras", savings: "R$ 7k" },
                { quote: "O processo que levava 3 dias agora fazemos em 20 minutos.", author: "Ana P.", role: "Diretora Financeira", savings: "20h" },
                { quote: "Visualizar a melhor combinação de fornecedores mudou nosso jogo.", author: "Carlos E.", role: "CEO", savings: "15%" },
              ].map((item, i) => (
                <Card key={i} className="bg-slate-50 border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex gap-1 mb-6 text-yellow-400">
                      {[1,2,3,4,5].map(s => <Star key={s} fill="currentColor" size={16} />)}
                    </div>
                    <p className="text-lg text-foreground font-medium mb-6 italic">"{item.quote}"</p>
                    <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
                      <div>
                        <div className="font-bold text-foreground">{item.author}</div>
                        <div className="text-sm text-muted-foreground">{item.role}</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                        {item.savings}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Pain Points */}
        <section className="py-20 bg-slate-50 border-y border-border/50">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16 max-w-3xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">
                 Se você usa planilha, você já viveu isso:
               </h2>
               <p className="text-muted-foreground text-lg">
                 Deixe o caos manual para trás e assuma o controle estratégico.
               </p>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
               {[
                 { icon: FileText, label: "Perder orçamentos" },
                 { icon: Clock, label: "Demora no processo" },
                 { icon: TrendingDown, label: "Falta de histórico" },
                 { icon: AlertTriangle, label: "Erro de compra" },
                 { icon: Factory, label: "Produção parada" },
                 { icon: Users, label: "Negociação ruim" },
               ].map((pain, i) => (
                 <div key={i} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white hover:shadow-md transition-all border border-border group">
                   <pain.icon className="w-8 h-8 text-red-500/80 group-hover:text-red-500 transition-colors" />
                   <span className="font-medium text-slate-700 group-hover:text-slate-900">{pain.label}</span>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* 6. Solutions / Features */}
        <section id="solutions" className="py-20 bg-white">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
               <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Funcionalidades</span>
               <h2 className="text-4xl font-heading font-bold mb-4 text-foreground">
                 Tudo o que você precisa em um só lugar
               </h2>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { icon: LayoutDashboard, title: "Gestão de Solicitações", desc: "Nunca mais perca um pedido. Veja quem faz o quê e quando." },
                 { icon: Box, title: "Controle de Estoque", desc: "Inteligência para saber o que comprar e quando repor." },
                 { icon: Users, title: "Gestão de Fornecedores", desc: "Histórico, avaliação e cadastro centralizado de parceiros." },
                 { icon: Calculator, title: "Produtos e BOM", desc: "Estrutura de produtos finais e lista de materiais completa." },
                 { icon: Factory, title: "Produção e MRP", desc: "Simule necessidades de material baseado na sua produção." },
                 { icon: Mail, title: "Cotações por Email", desc: "Envie RFQs direto da plataforma e receba respostas organizadas." },
                 { icon: Shield, title: "Controle de Acesso", desc: "Multi-tenant com permissões granulares por usuário." },
                 { icon: BarChart3, title: "Dashboards", desc: "Visão estratégica de gastos e economia em tempo real." },
               ].map((feat, i) => (
                 <div key={i} className="group p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all bg-white">
                   <div className="w-12 h-12 rounded-lg bg-blue-50 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                     <feat.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold mb-2 text-foreground">{feat.title}</h3>
                   <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* 7. Demo / Video */}
        <section className="py-20 bg-slate-50 border-y border-border">
          <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-heading font-bold mb-8">
               Se você sabe usar WhatsApp, sabe usar o Zeno.
             </h2>
             <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black aspect-video flex items-center justify-center text-white/50">
               <div className="text-center">
                 <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 border border-white/20">
                   <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                 </div>
                 <p>Vídeo Demonstração (30s)</p>
               </div>
             </div>
             <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12 text-left">
               {[
                 "1. Crie uma solicitação em segundos",
                 "2. Dispare cotações para fornecedores",
                 "3. Escolha a melhor oferta com 1 clique"
               ].map((step, i) => (
                 <div key={i} className="flex items-center gap-3 font-medium text-foreground">
                   <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                     {i + 1}
                   </div>
                   {step.slice(3)}
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* 8. Pricing */}
        <section id="pricing" className="py-20 bg-white">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                 Planos simples. Comece pequeno.
               </h2>
               <p className="text-muted-foreground">Escolha o plano ideal para o tamanho da sua operação.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
               {/* Basic */}
               <Card className="border border-border shadow-sm hover:shadow-md transition-all relative">
                 <CardContent className="p-8">
                   <h3 className="text-xl font-bold mb-2">Start</h3>
                   <div className="text-3xl font-bold mb-6">R$ 497<span className="text-base font-normal text-muted-foreground">/mês</span></div>
                   <p className="text-sm text-muted-foreground mb-6">Ideal para pequenas empresas começando a organizar compras.</p>
                   <Button className="w-full mb-8" variant="outline">Começar Teste</Button>
                   <ul className="space-y-3 text-sm">
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Até 3 usuários</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 50 Solicitações/mês</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Equalização Básica</li>
                   </ul>
                 </CardContent>
               </Card>

               {/* Pro */}
               <Card className="border-2 border-primary shadow-xl scale-105 relative z-10 bg-white">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                   Mais Popular
                 </div>
                 <CardContent className="p-8">
                   <h3 className="text-xl font-bold mb-2 text-primary">Pro</h3>
                   <div className="text-3xl font-bold mb-6">R$ 997<span className="text-base font-normal text-muted-foreground">/mês</span></div>
                   <p className="text-sm text-muted-foreground mb-6">Para empresas em crescimento que precisam de controle total.</p>
                   <Button className="w-full mb-8 bg-primary hover:bg-blue-600">Começar Teste Grátis</Button>
                   <ul className="space-y-3 text-sm font-medium">
                     <li className="flex gap-2"><Check className="w-4 h-4 text-primary" /> Até 10 usuários</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-primary" /> Solicitações Ilimitadas</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-primary" /> Equalização Avançada (IA)</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-primary" /> Controle de Estoque</li>
                   </ul>
                 </CardContent>
               </Card>

               {/* Enterprise */}
               <Card className="border border-border shadow-sm hover:shadow-md transition-all relative">
                 <CardContent className="p-8">
                   <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                   <div className="text-3xl font-bold mb-6">Sob Consulta</div>
                   <p className="text-sm text-muted-foreground mb-6">Para grandes operações com necessidades customizadas.</p>
                   <Button className="w-full mb-8" variant="outline">Falar com Consultor</Button>
                   <ul className="space-y-3 text-sm">
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Usuários Ilimitados</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Multi-CNPJ</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> API Dedicada</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Onboarding Assistido</li>
                   </ul>
                 </CardContent>
               </Card>
             </div>
          </div>
        </section>

        {/* 9. Comparison */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8 items-center rounded-3xl overflow-hidden shadow-sm border border-border bg-white">
              <div className="p-10 bg-slate-100 text-slate-500">
                <h3 className="text-2xl font-bold mb-6 text-slate-700">Antes do Zeno</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> Planilhas desconectadas</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> E-mails perdidos</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> Compras emergenciais caras</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> Sem histórico de preços</li>
                </ul>
              </div>
              <div className="p-10 text-foreground">
                <h3 className="text-2xl font-bold mb-6 text-primary">Com Zeno</h3>
                <ul className="space-y-4 font-medium">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500" /> Processo 100% digital</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500" /> Centralização total</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500" /> Economia média de 15%</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500" /> Auditoria completa</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section id="faq" className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-heading font-bold mb-8 text-center">Perguntas Frequentes</h2>
            
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Preciso saber usar Excel?", a: "Não! O Zeno substitui as planilhas complexas por uma interface visual e intuitiva." },
                { q: "Posso usar sozinho?", a: "Sim, o plano Start é perfeito para compradores individuais ou equipes pequenas." },
                { q: "O teste salva meus dados?", a: "Sim. Se você criar uma conta após o teste, todos os dados da equalização são salvos no seu histórico." },
                { q: "Tem suporte?", a: "Sim, oferecemos suporte via chat e email em todos os planos, com gerente de conta no Enterprise." }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-semibold text-lg">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 11. CTA Footer */}
        <section className="py-24 bg-gradient-to-b from-blue-50/50 to-white text-center border-t border-border">
          <div className="container mx-auto px-4">
             <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-foreground">
               Teste a Equalização Grátis e veja a economia.
             </h2>
             <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
               Não requer cartão de crédito. Comece a economizar hoje mesmo.
             </p>
             <Button 
               size="lg" 
               className="bg-primary hover:bg-blue-600 text-white text-lg px-8 h-14 font-bold shadow-xl shadow-blue-500/20"
               onClick={() => scrollToSection("equalization")}
             >
               Testar Equalização Grátis
             </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <span className="font-heading font-bold text-xl">Zeno</span>
            </div>
            <p className="text-sm leading-relaxed">
              Sistema completo de gestão de fornecedores e compras.
              Simplifique, economize e cresça.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-primary">Preços</a></li>
              <li><a href="#" className="hover:text-primary">Cases</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary">Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>suporte@zenosrm.com</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © {new Date().getFullYear()} Zeno SRM. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
