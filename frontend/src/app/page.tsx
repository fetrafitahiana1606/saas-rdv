"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Settings, Globe, CalendarDays, Link2, CalendarCheck, Sparkles,
  FormInput, Layers, Bell, BarChart3, Webhook, Heart, Scissors,
  Building2, Check, ArrowRight, Zap
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const demoAccounts = [
  { endpoint: "/auth/demo-login", name: "Dr. Marie Dupont", role: "M\u00e9decin", plan: "Free", color: "#8b5cf6", icon: Heart },
  { endpoint: "/auth/demo-login-pro", name: "Salon Belle & Zen", role: "Coiffure", plan: "Pro", color: "#ec4899", icon: Scissors },
  { endpoint: "/auth/demo-login-business", name: "Agence ImmoPlus", role: "Immobilier", plan: "Business", color: "#f97316", icon: Building2 },
];

const steps = [
  { num: 1, icon: Settings, title: "Configurez votre page", desc: "D\u00e9finissez vos horaires, services et personnalisez votre formulaire." },
  { num: 2, icon: Link2, title: "Partagez votre lien", desc: "Envoyez votre lien unique \u00e0 vos clients par email, SMS ou r\u00e9seaux sociaux." },
  { num: 3, icon: CalendarCheck, title: "Recevez des r\u00e9servations", desc: "Vos clients r\u00e9servent en autonomie 24h/24 depuis votre page." },
];

const features = [
  { icon: CalendarDays, title: "Calendrier intelligent", desc: "G\u00e9n\u00e9ration automatique des cr\u00e9neaux selon vos horaires et dur\u00e9es." },
  { icon: FormInput, title: "Formulaire personnalisable", desc: "Choisissez les champs \u00e0 afficher : email, t\u00e9l\u00e9phone, note." },
  { icon: Layers, title: "Multi-services", desc: "Proposez diff\u00e9rents types de consultations ou prestations." },
  { icon: Bell, title: "Notifications", desc: "Recevez une alerte \u00e0 chaque nouvelle r\u00e9servation." },
  { icon: BarChart3, title: "Statistiques", desc: "Suivez vos r\u00e9servations et analysez votre activit\u00e9." },
  { icon: Webhook, title: "API & Webhooks", desc: "Int\u00e9grez votre agenda \u00e0 vos outils existants." },
];

const segments = [
  { title: "Sant\u00e9", desc: "M\u00e9decins, cliniques, dentistes, kin\u00e9sith\u00e9rapeutes", color: "#8b5cf6" },
  { title: "Services B2C", desc: "Salons, coachs, conseillers, avocats", color: "#ec4899" },
  { title: "PME / Agences", desc: "Immobilier, formation, RH, e-commerce", color: "#f97316" },
];

const plans = [
  { id: "free", name: "Free", price: "0", features: ["1 page de r\u00e9servation", "50 RDV/mois", "Personnalisation basique", "Support communaut\u00e9"], popular: false },
  { id: "pro", name: "Pro", price: "19", features: ["Pages illimit\u00e9es", "RDV illimit\u00e9s", "Couleurs personnalis\u00e9es", "Support prioritaire", "Statistiques avanc\u00e9es"], popular: true },
  { id: "business", name: "Business", price: "49", features: ["Tout le plan Pro", "Multi-utilisateurs", "API & Webhooks", "Marque blanche", "Support d\u00e9di\u00e9"], popular: false },
];

export default function HomePage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) router.push("/dashboard/config");
  }, [user, isLoading, router]);

  const handleDemoLogin = async (endpoint: string) => {
    setLoadingDemo(endpoint);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method: "POST" });
      const data = await res.json();
      await login(data.token);
      router.push("/dashboard/config");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20">
          <nav className="flex items-center justify-between mb-16">
            <h2 className="text-2xl font-bold">SaaS <span className="text-indigo-400">RDV</span></h2>
            <a
              href={`${API_URL}/auth/google`}
              className="text-sm text-gray-300 hover:text-white transition-colors border border-gray-600 rounded-lg px-4 py-2 hover:border-gray-400"
            >
              Connexion Google
            </a>
          </nav>

          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Gratuit pour commencer &middot; Aucune carte requise</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transformez votre agenda en{" "}
              <span className="gradient-text">machine \u00e0 r\u00e9servations</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              L&apos;outil tout-en-un pour g\u00e9rer vos rendez-vous, automatiser vos
              r\u00e9servations et d\u00e9velopper votre activit\u00e9.
            </p>
          </div>

          {/* Demo accounts */}
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-sm text-gray-400 mb-4">Essayez avec un compte d\u00e9mo :</p>
            <div className="grid md:grid-cols-3 gap-4">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.endpoint}
                  onClick={() => handleDemoLogin(demo.endpoint)}
                  disabled={!!loadingDemo}
                  className="glass-card rounded-xl p-5 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: demo.color + "22" }}>
                      <demo.icon className="h-5 w-5" style={{ color: demo.color }} />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: demo.color + "33", color: demo.color }}>
                      {demo.plan}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{demo.name}</h3>
                  <p className="text-sm text-gray-400">{demo.role}</p>
                  {loadingDemo === demo.endpoint && (
                    <div className="mt-2 text-xs text-indigo-300">Connexion...</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment \u00e7a marche</h2>
            <p className="text-gray-600 max-w-xl mx-auto">En 3 \u00e9tapes simples, commencez \u00e0 recevoir des r\u00e9servations.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
                  <s.icon className="h-7 w-7 text-indigo-600" />
                </div>
                <div className="text-sm font-bold text-indigo-600 mb-2">\u00c9tape {s.num}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalit\u00e9s</h2>
            <p className="text-gray-600">Tout ce dont vous avez besoin pour g\u00e9rer vos rendez-vous.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEGMENTS */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
            <p className="text-gray-600">Des professionnels de tous secteurs utilisent SaaS RDV.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {segments.map((seg) => (
              <div key={seg.title} className="rounded-2xl p-6 border-2 border-gray-100 hover:border-opacity-50 transition-colors" style={{ borderColor: seg.color + "44" }}>
                <div className="w-3 h-3 rounded-full mb-4" style={{ backgroundColor: seg.color }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{seg.title}</h3>
                <p className="text-gray-600 text-sm">{seg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tarifs simples et transparents</h2>
            <p className="text-gray-600">Commencez gratuitement, \u00e9voluez selon vos besoins.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`bg-white rounded-2xl p-8 shadow-sm border-2 transition-all hover:shadow-lg relative ${plan.popular ? "border-indigo-500 scale-105" : "border-gray-100"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Populaire
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}\u20ac</span>
                  <span className="text-gray-500 text-sm">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleDemoLogin(demoAccounts[plans.indexOf(plan)]?.endpoint || "/auth/demo-login")}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                >
                  Essayer {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Pr\u00eat \u00e0 simplifier vos r\u00e9servations ?</h2>
          <p className="text-gray-300 mb-8">Rejoignez des milliers de professionnels qui gagnent du temps chaque jour.</p>
          <button
            onClick={() => handleDemoLogin("/auth/demo-login")}
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            Commencer gratuitement <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; 2026 SaaS RDV. Tous droits r\u00e9serv\u00e9s.</p>
      </footer>
    </div>
  );
}