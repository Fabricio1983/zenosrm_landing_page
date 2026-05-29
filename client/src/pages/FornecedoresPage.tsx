import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Menu, X, TrendingUp, Star, MapPin, Users,
  Package, Mail, Building2, ChevronRight, Sparkles,
  ArrowRight, Shield, BarChart3, Brain
} from "lucide-react";

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
  children, onClick, variant = "primary", size = "md", className = "", type = "button"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "accent" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
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
    <button type={type} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ─── Formulário de interesse ──────────────────────────────────────────────────

function FormFornecedor({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ razaoSocial: "", email: "", telefone: "", segmento: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.razaoSocial || !form.email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.zenosrm.com/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          nome: form.razaoSocial,
          telefone: form.telefone || undefined,
          segmento: form.segmento || undefined,
          origem: "landing_fornecedor",
        }),
      });
      if (!res.ok) throw new Error("Erro ao enviar");
      onSuccess();
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social *</label>
        <input
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(242,52%,47%)]/30 focus:border-[hsl(242,52%,47%)]"
          placeholder="Nome da sua empresa"
          value={form.razaoSocial}
          onChange={e => setForm({ ...form, razaoSocial: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail comercial *</label>
        <input
          type="email"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(242,52%,47%)]/30 focus:border-[hsl(242,52%,47%)]"
          placeholder="contato@suaempresa.com.br"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(242,52%,47%)]/30 focus:border-[hsl(242,52%,47%)]"
            placeholder="(11) 9 0000-0000"
            value={form.telefone}
            onChange={e => setForm({ ...form, telefone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Segmento</label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(242,52%,47%)]/30 focus:border-[hsl(242,52%,47%)]"
            placeholder="Ex: Elétrico, TI"
            value={form.segmento}
            onChange={e => setForm({ ...form, segmento: e.target.value })}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-[hsl(14,100%,57%)] hover:bg-[hsl(14,100%,50%)] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Sparkles size={18} />
        {loading ? "Enviando..." : "Quero aparecer para mais compradores"}
      </button>
      <p className="text-xs text-slate-400 text-center">Gratuito para começar. Sem cartão de crédito.</p>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FornecedoresPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/60 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/assets/logo.png" alt="Zeno SRM" className="h-8 w-auto" />
            <span className="font-bold text-xl text-[hsl(242,52%,47%)] hidden sm:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zeno</span>
            <span className="hidden sm:block text-xs text-slate-400 font-medium border border-slate-200 rounded-full px-2.5 py-0.5 ml-1">Para Fornecedores</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {[["Como funciona", "como-funciona"], ["Benefícios", "beneficios"], ["Planos", "planos"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-slate-500 hover:text-[hsl(242,52%,47%)] transition-colors">{label}</button>
            ))}
            <Btn variant="ghost" size="sm" onClick={() => window.open("https://app.zenosrm.com", "_blank")}>Sou comprador</Btn>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Btn variant="accent" size="md" onClick={() => scrollTo("cadastro")}>Cadastrar empresa</Btn>
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
              {["Como funciona", "Benefícios", "Planos"].map((label, i) => (
                <button key={i} onClick={() => scrollTo(["como-funciona", "beneficios", "planos"][i])} className="text-left py-1.5 font-medium text-slate-600">{label}</button>
              ))}
              <Btn variant="accent" size="md" className="w-full mt-2" onClick={() => scrollTo("cadastro")}>Cadastrar empresa</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-16">

        {/* HERO */}
        <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-orange-50/20 pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-20 -right-32 w-[440px] h-[440px] bg-orange-200/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "linear-gradient(hsl(242,52%,47%) 1px,transparent 1px),linear-gradient(90deg,hsl(242,52%,47%) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

              {/* Esquerda */}
              <div className="text-center lg:text-left">
                <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[hsl(242,52%,47%)] text-sm font-semibold mb-7"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(242,52%,47%)] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(242,52%,47%)]" />
                  </span>
                  Para fornecedores B2B em todo o Brasil
                </motion.div>

                <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.08}
                  className="text-4xl md:text-5xl xl:text-[3.4rem] font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Seu próximo cliente está procurando{" "}
                  <span className="text-[hsl(242,52%,47%)]">o que você vende.</span>
                </motion.h1>

                <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.16}
                  className="text-lg text-slate-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0"
                >
                  Empresas brasileiras usam o Zeno para cotar com fornecedores qualificados. Cadastre sua empresa e receba solicitações de cotação diretamente no seu email — sem intermediários.
                </motion.p>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24}
                  className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
                >
                  <Btn variant="accent" size="lg" onClick={() => scrollTo("cadastro")}>
                    <Sparkles size={18} />
                    Cadastrar minha empresa
                  </Btn>
                  <Btn variant="outline" size="lg" onClick={() => scrollTo("como-funciona")}>
                    Como funciona
                  </Btn>
                </motion.div>

                {/* Stats */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.32}
                  className="mt-12 flex items-center gap-8 justify-center lg:justify-start"
                >
                  {[
                    { value: "100%", label: "Gratuito para começar" },
                    { value: "+50", label: "Categorias de compra" },
                    { value: "Brasil", label: "Todo o território" },
                  ].map((stat, i) => (
                    <div key={i} className={`text-center ${i > 0 ? "border-l border-slate-200 pl-8" : ""}`}>
                      <div className="text-2xl font-extrabold text-[hsl(242,52%,47%)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Direita — formulário */}
              <motion.div variants={scaleIn} initial="hidden" animate="visible" id="cadastro">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
                  {formSent ? (
                    <motion.div variants={scaleIn} initial="hidden" animate="visible" className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-[hsl(242,52%,47%)]" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Cadastro recebido!
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Nossa equipe entrará em contato em até 24 horas para ativar seu perfil no diretório.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Cadastre sua empresa gratuitamente
                        </h2>
                        <p className="text-sm text-slate-500">Nossa equipe ativa seu perfil em até 24 horas</p>
                      </div>
                      <FormFornecedor onSuccess={() => setFormSent(true)} />
                    </>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Como funciona
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Em 3 passos simples, sua empresa começa a receber cotações de compradores qualificados
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01", icon: Building2,
                  title: "Cadastre sua empresa",
                  desc: "Preencha os dados da sua empresa, categorias de produtos e regiões de atendimento. Gratuito e rápido.",
                },
                {
                  step: "02", icon: Mail,
                  title: "Receba solicitações",
                  desc: "Compradores enviam RFQs pelo Zeno. Você recebe um email com link para responder com seus preços — sem criar conta.",
                },
                {
                  step: "03", icon: TrendingUp,
                  title: "Construa reputação",
                  desc: "Cada entrega bem avaliada melhora seu score. Quanto melhor o histórico, mais cotações você recebe.",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.step} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1}>
                    <div className="relative bg-white rounded-2xl border border-slate-200 p-8 shadow-sm h-full">
                      <div className="absolute -top-4 left-8">
                        <span className="text-5xl font-extrabold text-indigo-100 select-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.step}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 mt-4">
                        <Icon className="w-6 h-6 text-[hsl(242,52%,47%)]" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                    {i < 2 && (
                      <div className="hidden md:flex absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10">
                        <ChevronRight className="w-6 h-6 text-indigo-200" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section id="beneficios" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Por que estar no Zeno?
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Diferente de marketplaces genéricos, o Zeno conecta você a compradores corporativos B2B com processos estruturados
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, title: "Compradores qualificados", desc: "Empresas que já usam o Zeno para gerir compras — compradores profissionais com budget real e processos estruturados." },
                { icon: MapPin, title: "Filtro por região", desc: "Compradores filtram por região. Seu perfil aparece apenas para empresas que realmente podem comprar de você." },
                { icon: Star, title: "Score de reputação", desc: "Avaliações reais de compradores em 4 dimensões: prazo, qualidade, atendimento e preço. Melhor score = mais cotações." },
                { icon: Package, title: "Sem intermediários", desc: "O comprador vê sua proposta diretamente. Você responde com seus preços reais pelo link da RFQ — sem comissão." },
                { icon: Brain, title: "Inteligência de mercado", desc: "Veja em quais regiões e categorias há mais demanda. Tome decisões comerciais baseadas em dados reais de mercado." },
                { icon: Building2, title: "Você também compra?", desc: "Muitas metalúrgicas compram de outras metalúrgicas. O Zeno SRM serve para os dois lados da operação." },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.06}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full hover:shadow-md hover:border-indigo-200 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-[hsl(242,52%,47%)]" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="py-20 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Planos para fornecedores
              </h2>
              <p className="text-slate-500 text-lg">Comece grátis. Evolua conforme seu negócio cresce.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Gratuito", price: "R$ 0", period: "/sempre",
                  desc: "Para começar a receber cotações",
                  features: ["Perfil básico no diretório", "Recebe RFQs por email", "Score de avaliações", "Aparece nas buscas"],
                  cta: "Começar grátis", highlight: false,
                },
                {
                  name: "Verificado", price: "R$ 99", period: "/mês",
                  desc: "Para fornecedores que querem mais credibilidade",
                  features: ["Tudo do Gratuito", "Badge Verificado Zeno", "CNPJ validado", "Destaque no perfil", "Prioridade nas buscas"],
                  cta: "Assinar Verificado", highlight: true,
                },
                {
                  name: "Completo", price: "R$ 199", period: "/mês",
                  desc: "Para fornecedores que querem crescer",
                  features: ["Tudo do Verificado", "Catálogo de produtos", "Certificações e fotos", "Analytics completo", "Relatório mensal IA"],
                  cta: "Assinar Completo", highlight: false,
                },
              ].map((plan, i) => (
                <motion.div key={plan.name} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1}>
                  <div className={`relative bg-white rounded-2xl border ${plan.highlight ? "border-[hsl(242,52%,47%)] border-2 shadow-xl" : "border-slate-200 shadow-sm"} p-8 h-full flex flex-col`}>
                    {plan.highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-[hsl(242,52%,47%)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">Mais Popular</span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-3">
                        <span className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{plan.price}</span>
                        <span className="text-slate-400 text-sm">{plan.period}</span>
                      </div>
                      <p className="text-slate-500 text-sm mt-2">{plan.desc}</p>
                    </div>
                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-[hsl(242,52%,47%)]" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => scrollTo("cadastro")}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                        plan.highlight
                          ? "bg-[hsl(242,52%,47%)] hover:bg-[hsl(242,52%,42%)] text-white shadow-lg shadow-indigo-500/20"
                          : "border-2 border-[hsl(242,52%,47%)] text-[hsl(242,52%,47%)] hover:bg-[hsl(242,52%,47%)] hover:text-white"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA DUPLO */}
        <section className="py-20 px-4 bg-[hsl(242,52%,47%)]">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
              <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Sua empresa também compra?
              </h2>
              <p className="text-xl text-indigo-200 max-w-2xl mx-auto leading-relaxed">
                Muitas empresas são fornecedoras e compradoras ao mesmo tempo.
                O Zeno SRM automatiza todo o processo — cotações, aprovações, OCs e recebimento.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Btn variant="white" size="lg" onClick={() => window.open("https://www.zenosrm.com", "_blank")}>
                  Conhecer o Zeno SRM
                  <ArrowRight size={18} />
                </Btn>
                <Btn variant="outline" size="lg" className="!border-white !text-white hover:!bg-white/10" onClick={() => scrollTo("cadastro")}>
                  Só quero como fornecedor
                </Btn>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/assets/logo.png" alt="Zeno" className="h-8 w-auto brightness-0 invert" />
                <span className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zeno</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Conectando compradores e fornecedores B2B em todo o Brasil.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-300">Para Fornecedores</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => scrollTo("como-funciona")} className="hover:text-white transition-colors">Como funciona</button></li>
                <li><button onClick={() => scrollTo("planos")} className="hover:text-white transition-colors">Planos</button></li>
                <li><button onClick={() => scrollTo("cadastro")} className="hover:text-white transition-colors">Cadastrar empresa</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-300">Para Compradores</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://www.zenosrm.com" className="hover:text-white transition-colors">Conheça o Zeno SRM</a></li>
                <li><a href="https://app.zenosrm.com" className="hover:text-white transition-colors">Entrar na plataforma</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2025 ZENO SRM. Clareza nas compras industriais.</p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-white">Privacidade</a>
              <a href="#" className="hover:text-white">Termos</a>
              <a href="#" className="hover:text-white">Contato</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
