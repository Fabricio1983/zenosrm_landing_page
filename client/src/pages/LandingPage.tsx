import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Check, Menu, X, FileText, Calculator, TrendingDown, Clock,
  BarChart3, Mail, Shield, Box, Users, LayoutDashboard, Factory,
  Star, Smartphone, BookOpen, MessageSquare, DollarSign, Brain,
  HelpCircle, Clipboard, RefreshCw, PackageX, Timer, Sparkles, ArrowRight, Zap
} from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const, delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.65, ease: "easeOut" as const },
  },
};

// ─── Btn primitive ────────────────────────────────────────────────────────────

function Btn({
  children, onClick, variant = "primary", size = "md", className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "accent" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none";
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-8 py-4 text-base" };
  const variants = {
    primary: "bg-[hsl(242,52%,47%)] hover:bg-[hsl(242,52%,42%)] text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5",
    accent: "bg-[hsl(14,100%,57%)] hover:bg-[hsl(14,100%,50%)] text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5",
    outline: "border-2 border-[hsl(242,52%,47%)] text-[hsl(242,52%,47%)] hover:bg-[hsl(242,52%,47%)] hover:text-white",
    ghost: "text-[hsl(242,52%,47%)] hover:bg-indigo-50",
    white: "bg-white text-[hsl(242,52%,47%)] hover:bg-slate-50 shadow-lg hover:-translate-y-0.5",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 60], ["rgba(248,250,252,0)", "rgba(255,255,255,0.96)"]);
  const headerShadow = useTransform(scrollY, [0, 60], ["0 0 0 0 rgba(0,0,0,0)", "0 1px 24px 0 rgba(0,0,0,0.08)"]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* HEADER */}
      <motion.header
        style={{ backgroundColor: headerBg, boxShadow: headerShadow }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-slate-200/60 h-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/assets/logo.png" alt="Zeno SRM" className="h-8 w-auto" />
            <span className="font-bold text-xl text-[hsl(242,52%,47%)] hidden sm:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zeno</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {[["Diagnóstico","diagnostic"],["Soluções","features"],["FAQ","faq"]].map(([label,id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-slate-500 hover:text-[hsl(242,52%,47%)] transition-colors">{label}</button>
            ))}
            <Btn variant="ghost" size="sm" onClick={() => window.open("https://app.zenosrm.com","_blank")}>Entrar</Btn>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Btn variant="accent" size="md" onClick={() => scrollTo("waitlist")}>Entrar na lista de espera</Btn>
          </div>
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-5 flex flex-col gap-4 shadow-xl"
            >
              {["Diagnóstico","Soluções","FAQ"].map((label,i) => (
                <button key={i} onClick={() => scrollTo(["diagnostic","features","faq"][i])} className="text-left py-1.5 font-medium text-slate-600">{label}</button>
              ))}
              <Btn variant="accent" size="md" className="w-full mt-2" onClick={() => scrollTo("waitlist")}>Entrar na lista de espera</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-1 pt-16">

        {/* HERO */}
        <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-orange-50/20 pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-20 -right-32 w-[440px] h-[440px] bg-orange-200/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "linear-gradient(hsl(242,52%,47%) 1px,transparent 1px),linear-gradient(90deg,hsl(242,52%,47%) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              <div className="text-center lg:text-left">
                <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[hsl(242,52%,47%)] text-sm font-semibold mb-7"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(242,52%,47%)] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(242,52%,47%)]" />
                  </span>
                  +1.200 empresas já testaram
                </motion.div>

                <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.08}
                  className="text-4xl md:text-5xl xl:text-[3.4rem] font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Pare de perder dinheiro em compras.{" "}
                  <span className="text-[hsl(242,52%,47%)]">Comece a controlar sua margem.</span>
                </motion.h1>

                <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.16} className="text-lg text-slate-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Você já faz gestão de fornecedores — no Excel, no email, no WhatsApp. O custo oculto disso é lucro evaporando. O Zeno profissionaliza suas compras e devolve dinheiro para sua empresa.
                </motion.p>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                  <Btn variant="accent" size="lg" onClick={() => scrollTo("waitlist")}><Sparkles size={18} />Entrar na Lista de Espera</Btn>
                  <Btn variant="outline" size="lg" onClick={() => scrollTo("diagnostic")}>Fazer Diagnóstico Grátis<ArrowRight size={16} /></Btn>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.32} className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mt-10 text-sm text-slate-400">
                  {["Sem cartão de crédito","Setup em minutos","Suporte em português"].map((t,i) => (
                    <span key={i} className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" />{t}</span>
                  ))}
                </motion.div>
              </div>

              <motion.div variants={scaleIn} initial="hidden" animate="visible" className="relative">
                <div className="absolute inset-0 bg-indigo-400/15 blur-3xl scale-90 rounded-full -z-10" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/15 border border-indigo-100/60 bg-white">
                  <div className="bg-[hsl(242,52%,47%)] px-5 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400/70" /><span className="w-3 h-3 rounded-full bg-yellow-400/70" /><span className="w-3 h-3 rounded-full bg-green-400/70" />
                    </div>
                    <span className="text-indigo-200 text-xs font-medium ml-2">Zeno SRM — Equalização de Orçamentos</span>
                  </div>
                  <div className="p-6 bg-slate-50">
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: "Economia total", value: "R$ 23.400", color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Cotações ativas", value: "12", color: "text-[hsl(242,52%,47%)]", bg: "bg-indigo-50" },
                        { label: "Fornecedores", value: "38", color: "text-orange-600", bg: "bg-orange-50" },
                      ].map((s,i) => (
                        <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                          <div className={`text-xl font-bold ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">Comparativo de Fornecedores</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">3 cotações</span>
                      </div>
                      {[
                        { name: "MetalSul Ltda", value: "R$ 4.200", diff: "-12%", best: true },
                        { name: "FornMax Ind.", value: "R$ 4.800", diff: "ref", best: false },
                        { name: "AçosPrime", value: "R$ 5.100", diff: "+6%", best: false },
                      ].map((row,i) => (
                        <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${row.best ? "bg-emerald-50/60" : ""}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${row.best ? "bg-emerald-500" : "bg-slate-200"}`} />
                            <span className={row.best ? "font-semibold text-slate-800" : "text-slate-500"}>{row.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={row.best ? "font-bold text-slate-800" : "text-slate-500"}>{row.value}</span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${row.best ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{row.diff}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Equalizado automaticamente pelo Zeno</span>
                      <button className="text-xs font-semibold text-[hsl(242,52%,47%)] flex items-center gap-1">Aprovar melhor oferta <ArrowRight size={12} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUTH */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Você já faz SRM. <span className="text-[hsl(242,52%,47%)]">Só faz mal feito.</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">SRM não é luxo de multinacional. Toda empresa que compra já faz gestão de fornecedores — a questão é <em>como</em>.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[{icon:FileText,label:"No Excel"},{icon:BookOpen,label:"No caderno"},{icon:Smartphone,label:"No WhatsApp"},{icon:Mail,label:"No email"}].map(({icon:Icon,label},i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.07}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center group hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
                >
                  <Icon className="w-8 h-8 text-slate-400 group-hover:text-[hsl(242,52%,47%)] transition-colors" />
                  <span className="font-semibold text-slate-700">{label}</span>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-red-50 border border-red-200/70 rounded-2xl p-8 md:p-10">
              <h3 className="font-bold text-xl mb-8 text-red-800 text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>O custo oculto disso:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                {[{icon:Clock,text:"Tempo perdido"},{icon:PackageX,text:"Compras atrasadas"},{icon:Users,text:"Fornecedor desorganizado"},{icon:Brain,text:"Decisão por memória"},{icon:DollarSign,text:"Lucro evaporando"}].map(({icon:Icon,text},i) => (
                  <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.07} className="flex flex-col items-center gap-2 text-center">
                    <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                    <span className="text-sm font-semibold text-red-800">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* DIAGNOSTIC */}
        <section id="diagnostic" className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="inline-block text-xs font-bold tracking-widest text-[hsl(242,52%,47%)] uppercase mb-4">Diagnóstico gratuito</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quanto sua empresa está perdendo em compras?</h2>
              <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">Responda 5 perguntas rápidas e descubra os pontos de fuga de margem.</p>
            </motion.div>
            <DiagnosticQuiz onCTAClick={() => scrollTo("waitlist")} />
          </div>
        </section>

        {/* ROI */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Matemática simples: o Zeno se paga no primeiro mês.</h2>
              <p className="text-lg text-slate-500">Não é só software. É uma ferramenta de geração de caixa.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-7 mb-10">
              {[
                { bg:"bg-indigo-50", iconBg:"bg-indigo-100", iconColor:"text-[hsl(242,52%,47%)]", Icon:TrendingDown, stat:"8–15%", title:"Economia Real", desc:"Em cada compra realizada. Compare fornecedores inteligentemente e pague menos. Geralmente uma única compra paga a mensalidade." },
                { bg:"bg-orange-50", iconBg:"bg-orange-100", iconColor:"text-orange-600", Icon:Clock, stat:"−60%", title:"Tempo Operacional", desc:"Sua equipe custa caro. Libere horas de digitação para que foquem em negociação e estratégia." },
                { bg:"bg-emerald-50", iconBg:"bg-emerald-100", iconColor:"text-emerald-600", Icon:BarChart3, stat:"Cumulativo", title:"Ganhos Mensais", desc:"A mensalidade é fixa, mas a economia cresce. Quanto mais você compra pelo Zeno, maior o retorno financeiro." },
              ].map((card,i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.1} whileHover={{ y:-5, transition:{ duration:0.2 } }}
                  className={`${card.bg} rounded-2xl p-8 text-center flex flex-col items-center border border-white shadow-sm`}
                >
                  <div className={`w-16 h-16 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-5`}><card.Icon size={30} strokeWidth={2} /></div>
                  <div className={`text-4xl font-extrabold ${card.iconColor} mb-2`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{card.stat}</div>
                  <h3 className="font-bold text-lg text-slate-800 mb-3">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { iconBg:"bg-red-100", iconColor:"text-red-600", Icon:Shield, title:"Fim das Compras Erradas", desc:"Elimine erros de digitação e compras de emergência que geram prejuízos dezenas de vezes maiores que o custo do sistema." },
                { iconBg:"bg-purple-100", iconColor:"text-purple-600", Icon:Calculator, title:"Decisões Baseadas em Dados", desc:'Chega de "achismo". Tenha histórico de preços, análise tributária e comparativos estruturados para nunca mais pagar caro.' },
              ].map((item,i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.1}
                  className="flex gap-5 p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <div className={`shrink-0 w-12 h-12 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center`}><item.Icon size={22} /></div>
                  <div><h3 className="font-bold text-slate-800 mb-2">{item.title}</h3><p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section id="cases" className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>O Zeno já ajudou empresas a economizar em compras reais.</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-7">
              {[
                { quote:"Economizamos R$ 7.000 em uma única compra de insumos.", author:"Ricardo M.", role:"Gerente de Compras", savings:"R$ 7k" },
                { quote:"O processo que levava 3 dias agora fazemos em 20 minutos.", author:"Ana P.", role:"Diretora Financeira", savings:"20h" },
                { quote:"Visualizar a melhor combinação de fornecedores mudou nosso jogo.", author:"Carlos E.", role:"CEO", savings:"15%" },
              ].map((item,i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.1} whileHover={{ y:-4, transition:{duration:0.2} }}
                  className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 mb-5 text-yellow-400">{[0,1,2,3,4].map(s=><Star key={s} fill="currentColor" size={15} />)}</div>
                  <p className="text-slate-700 font-medium mb-6 italic leading-relaxed flex-1">"{item.quote}"</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div><div className="font-bold text-slate-800 text-sm">{item.author}</div><div className="text-xs text-slate-400">{item.role}</div></div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">{item.savings}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <span className="text-xs font-bold tracking-widest text-[hsl(242,52%,47%)] uppercase mb-3 block">Funcionalidades</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tudo o que você precisa em um só lugar</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">O Zeno foi feito para quem não tem equipe grande de compras. O fluxo já vem pronto — você só segue as etapas.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {icon:LayoutDashboard,title:"Gestão de Solicitações",desc:"Nunca mais perca um pedido. Veja quem faz o quê e quando."},
                {icon:Box,title:"Controle de Estoque",desc:"Inteligência para saber o que comprar e quando repor."},
                {icon:Users,title:"Gestão de Fornecedores",desc:"Histórico, avaliação e cadastro centralizado de parceiros."},
                {icon:Calculator,title:"Produtos e BOM",desc:"Estrutura de produtos finais e lista de materiais completa."},
                {icon:Factory,title:"Produção e MRP",desc:"Simule necessidades de material baseado na sua produção."},
                {icon:Mail,title:"Cotações por Email",desc:"Envie RFQs direto da plataforma e receba respostas organizadas."},
                {icon:Shield,title:"Controle de Acesso",desc:"Multi-tenant com permissões granulares por usuário."},
                {icon:BarChart3,title:"Dashboards",desc:"Visão estratégica de gastos e economia em tempo real."},
              ].map((feat,i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.06} whileHover={{ y:-4, transition:{duration:0.2} }}
                  className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all cursor-default"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[hsl(242,52%,47%)] flex items-center justify-center mb-5 group-hover:bg-[hsl(242,52%,47%)] group-hover:text-white transition-colors"><feat.icon className="w-5 h-5" /></div>
                  <h3 className="font-bold text-slate-800 mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* BEFORE/AFTER */}
        <section className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A transformação é real.</h2>
              <p className="text-slate-500 text-lg">Veja como o Zeno muda cada etapa do seu processo de compras.</p>
            </motion.div>
            <div className="space-y-3">
              {[
                { before:"Equalizar 5 fornecedores com 10 itens leva uma manhã inteira", after:"Leva minutos. Com o Zeno." },
                { before:"15 emails manuais para pedir cotação", after:"1 clique. Todos recebem ao mesmo tempo." },
                { before:"Relatório manual no fim do mês", after:"Dashboard em tempo real, atualizado automaticamente." },
                { before:"Compras reativas. Correria. Apagar incêndio.", after:"Compras estratégicas. Fluxo previsível. Produção segura." },
                { before:"Decisão baseada na memória do comprador", after:"Decisão baseada em dados, histórico e comparativos." },
                { before:"Diretoria sem visibilidade sobre gastos", after:"Diretoria confiante com relatórios claros de economia." },
              ].map((item,i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.07} className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-slate-200">
                  <div className="p-5 bg-slate-100 flex items-start gap-3"><X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" /><span className="text-slate-500 text-sm">{item.before}</span></div>
                  <div className="p-5 bg-white flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="font-semibold text-slate-800 text-sm">{item.after}</span></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* BUYER HERO */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <span className="text-xs font-bold tracking-widest text-[hsl(242,52%,47%)] uppercase mb-4 block">Para o comprador</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>O Zeno devolve horas do seu dia.</h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">O que você faz manualmente no Excel e no email, o Zeno faz sozinho. Você merece focar em negociação e estratégia — não em copiar e colar dados.</p>
                <Btn variant="accent" size="md" onClick={() => scrollTo("waitlist")}><Zap size={16} />Quero economizar tempo agora</Btn>
              </motion.div>
              <div className="space-y-3">
                {[
                  {icon:Mail,text:"Abre 40+ emails por dia buscando cotações"},
                  {icon:Clipboard,text:"Copia e cola dados entre planilhas"},
                  {icon:FileText,text:"Digita item por item manualmente"},
                  {icon:MessageSquare,text:'Responde "e aí, já chegou?" o dia inteiro'},
                  {icon:RefreshCw,text:"Vira tradutor de pedido mal feito"},
                  {icon:BarChart3,text:"Faz relatório manual no fim do mês"},
                ].map(({icon:Icon,text},i) => (
                  <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.07}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-orange-200 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
                    <span className="text-slate-700 font-medium text-sm">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CEO SECTION */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize:"40px 40px" }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase mb-4 block">Para o empresário</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-10 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Se seu processo de compras depende da memória do comprador, sua empresa está vulnerável.
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {["Você sabe quanto compra por mês?","Sabe quanto economizou?","Sabe qual fornecedor é mais eficiente?","Sabe onde está vazando dinheiro?"].map((question,i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.08} whileHover={{ y:-4, transition:{duration:0.2} }}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur"
                >
                  <HelpCircle className="w-6 h-6 text-orange-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-200 font-medium">{question}</p>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/8 backdrop-blur rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
              <p className="text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Com o Zeno, o controle deixa de estar na cabeça das pessoas e passa a estar no sistema.</p>
              <p className="text-slate-400 text-sm mt-3">Previsibilidade para o dono. Produtividade para o comprador. Margem para a empresa.</p>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl font-bold text-slate-900 mb-14 text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Perguntas Frequentes
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { q:"Isso não é só para empresa grande?", a:"Não. Mais de 70% dos nossos clientes são PMEs. O Zeno foi feito justamente para quem não tem equipe grande de compras." },
                { q:"Já uso Excel, por que mudar?", a:"O custo oculto é alto: tempo perdido, erros de digitação, falta de histórico e decisões baseadas em achismo. O Zeno elimina tudo isso." },
                { q:"Quanto tempo leva para implantar?", a:"O fluxo já vem estruturado. Não precisa inventar processo ou contratar consultoria. Você cadastra a empresa e já começa a usar." },
                { q:"E se meu comprador não se adaptar?", a:"Se ele sabe usar WhatsApp, sabe usar o Zeno. A interface é visual e intuitiva — sem treinamentos longos." },
                { q:"O Zeno é só um sistema de compras?", a:"Não. O Zeno é um método embutido. Ele estrutura e profissionaliza o setor que mais impacta o lucro da sua empresa." },
                { q:"Tem suporte?", a:"Sim, suporte via chat e email em todos os planos, com acompanhamento dedicado para operações maiores." },
              ].map((item,i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i*0.07} whileHover={{ y:-3, transition:{duration:0.2} }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <h3 className="font-bold text-slate-800 mb-3">{item.q}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROMISE CTA */}
        <section className="py-16 bg-[hsl(242,52%,47%)] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-transparent pointer-events-none" />
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
            <Sparkles className="w-10 h-10 mx-auto mb-6 opacity-75" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Transforme compras operacionais em compras estratégicas.</h2>
            <p className="text-lg opacity-80 mb-10">Pare de apagar incêndio. Comece a controlar margem. Organize. Automatize. Lucre mais.</p>
            <Btn variant="white" size="lg" onClick={() => scrollTo("waitlist")}><Sparkles size={18} />Quero transformar meu setor de compras</Btn>
          </motion.div>
        </section>

        {/* WAITLIST */}
        <section id="waitlist" className="py-24 bg-gradient-to-b from-indigo-50/60 to-white border-t border-slate-100">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-xl mx-auto px-4 sm:px-6">
            <WaitlistForm source="hero" title="Entre na Lista de Espera" subtitle="Seja um dos primeiros a testar o Zeno SRM" buttonText="Garantir minha vaga" />
          </motion.div>
        </section>
      </main>

      {/* STICKY MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4">
        <Btn variant="accent" size="lg" className="w-full" onClick={() => scrollTo("waitlist")}>Entrar na Lista de Espera</Btn>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-14 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/assets/logo.png" alt="Zeno" className="h-7 w-auto brightness-0 invert" />
              <span className="font-bold text-lg text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zeno</span>
            </div>
            <p className="text-sm leading-relaxed">O sistema que estrutura e profissionaliza o setor que mais impacta o lucro da sua empresa.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5">Produto</h4>
            <ul className="space-y-2.5 text-sm">
              {[["Funcionalidades","features"],["Cases","cases"],["FAQ","faq"]].map(([label,id]) => (
                <li key={id}><button onClick={() => scrollTo(id)} className="hover:text-indigo-400 transition-colors">{label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5">Contato</h4>
            <ul className="space-y-2.5 text-sm">
              <li>suporte@zenosrm.com</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Zeno SRM. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

// ─── DiagnosticQuiz ────────────────────────────────────────────────────────────

function DiagnosticQuiz({ onCTAClick }: { onCTAClick: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const questions = [
    { q:"Como você organiza suas cotações hoje?", options:["Planilha Excel","Email/WhatsApp","Sistema dedicado","Papel/caderno"] },
    { q:"Quanto tempo leva para equalizar 3 fornecedores?", options:["Menos de 30 min","Meio dia","1 dia inteiro","Mais de 1 dia"] },
    { q:"Você consegue ver o histórico de preços de um item rapidamente?", options:["Sim, em segundos","Leva algum tempo","É difícil achar","Não tenho histórico"] },
    { q:"A diretoria tem visibilidade dos gastos em compras?", options:["Relatório em tempo real","Relatório mensal manual","Apenas estimativas","Sem visibilidade"] },
    { q:"Com que frequência ocorrem compras de emergência?", options:["Raramente","Às vezes","Frequente","Quase sempre"] },
  ];

  const score = answers.reduce((acc,a) => acc+a, 0);
  const pct = Math.round((score / (questions.length * 3)) * 100);
  const getRisk = () => {
    if (pct < 30) return { label:"Baixo risco", color:"text-emerald-600", bg:"bg-emerald-50", bar:"bg-emerald-500" };
    if (pct < 60) return { label:"Risco moderado", color:"text-yellow-600", bg:"bg-yellow-50", bar:"bg-yellow-500" };
    return { label:"Alto risco de perda", color:"text-red-600", bg:"bg-red-50", bar:"bg-red-500" };
  };

  const answer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (step + 1 >= questions.length) setDone(true);
    else setStep(step + 1);
  };

  if (done) {
    const risk = getRisk();
    return (
      <motion.div variants={scaleIn} initial="hidden" animate="visible" className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-left">
        <div className="text-center mb-6">
          <div className={`inline-block px-4 py-1.5 rounded-full ${risk.bg} ${risk.color} font-bold text-sm mb-3`}>{risk.label}</div>
          <div className="text-5xl font-extrabold text-slate-900 mb-1" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{pct}%</div>
          <p className="text-slate-500 text-sm">nível de exposição a perdas em compras</p>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-8">
          <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1, ease:"easeOut", delay:0.3 }} className={`h-full rounded-full ${risk.bar}`} />
        </div>
        <p className="text-slate-600 text-sm mb-6 text-center leading-relaxed">
          {pct >= 60 ? "Seu processo de compras está exposto a perdas significativas. Cada compra sem estrutura é margem que some."
            : pct >= 30 ? "Há oportunidades claras de melhoria. Pequenas mudanças no processo podem representar economia real."
            : "Você está no caminho certo! O Zeno pode ajudar a escalar e automatizar o que você já faz bem."}
        </p>
        <Btn variant="accent" size="lg" className="w-full" onClick={onCTAClick}><Sparkles size={18} />Quero resolver isso agora</Btn>
      </motion.div>
    );
  }

  const q = questions[step];
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex gap-1.5 mb-8 justify-center">
        {questions.map((_,i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? "bg-[hsl(242,52%,47%)] w-8" : "bg-slate-200 w-6"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
        >
          <div className="text-xs font-bold text-[hsl(242,52%,47%)] uppercase tracking-widest mb-3">Pergunta {step+1} de {questions.length}</div>
          <h3 className="font-bold text-slate-900 text-xl mb-6 leading-tight" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{q.q}</h3>
          <div className="space-y-3">
            {q.options.map((opt,i) => (
              <button key={i} onClick={() => answer(i)}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 text-slate-700 font-medium text-sm hover:border-[hsl(242,52%,47%)] hover:bg-indigo-50 hover:text-[hsl(242,52%,47%)] transition-all"
              >{opt}</button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
