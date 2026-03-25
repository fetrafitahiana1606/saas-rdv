"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Link2,
  CalendarCheck,
  Calendar,
  FileText,
  Layers,
  Bell,
  BarChart3,
  Code2,
  Heart,
  Scissors,
  Building2,
  ArrowRight,
  Check,
  Star,
  Sparkles,
} from "lucide-react";

const API_URL = "/api";

const demoAccounts = [
  {
    name: "Dr. Marie Dupont",
    role: "Médecin",
    plan: "Free",
    endpoint: "/auth/demo-login",
    accent: "from-indigo-500 to-purple-600",
    accentBg: "bg-indigo-500/10",
    accentText: "text-indigo-400",
    accentBorder: "border-indigo-500/30",
    badgeBg: "bg-indigo-500/20",
  },
  {
    name: "Salon Belle & Zen",
    role: "Coiffure",
    plan: "Pro",
    endpoint: "/auth/demo-login-pro",
    accent: "from-pink-500 to-rose-600",
    accentBg: "bg-pink-500/10",
    accentText: "text-pink-400",
    accentBorder: "border-pink-500/30",
    badgeBg: "bg-pink-500/20",
  },
  {
    name: "Agence ImmoPlus",
    role: "Immobilier",
    plan: "Business",
    endpoint: "/auth/demo-login-business",
    accent: "from-amber-500 to-orange-600",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/30",
    badgeBg: "bg-amber-500/20",
  },
];

const steps = [
  {
    icon: Settings,
    title: "Configurez votre page",
    desc: "Personnalisez vos horaires, services et formulaire en quelques clics.",
  },
  {
    icon: Link2,
    title: "Partagez votre lien",
    desc: "Envoyez votre lien unique à vos clients par email, SMS ou réseaux sociaux.",
  },
  {
    icon: CalendarCheck,
    title: "Recevez des réservations",
    desc: "Vos clients réservent en autonomie 24h/24. Vous recevez les confirmations.",
  },
];

const features = [
  {
    icon: Calendar,
    title: "Calendrier intelligent",
    desc: "Vue agenda intuitive avec gestion des disponibilités en temps réel.",
  },
  {
    icon: FileText,
    title: "Formulaire personnalisable",
    desc: "Adaptez les champs du formulaire de réservation à votre activité.",
  },
  {
    icon: Layers,
    title: "Multi-services",
    desc: "Gérez plusieurs types de prestations avec des durées différentes.",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Alertes email automatiques pour vous et vos clients à chaque réservation.",
  },
  {
    icon: BarChart3,
    title: "Statistiques",
    desc: "Suivez vos réservations, taux de remplissage et revenus en un coup d'œil.",
  },
  {
    icon: Code2,
    title: "API & Webhooks",
    desc: "Intégrez vos réservations à vos outils existants via notre API REST.",
  },
];

const segments = [
  {
    icon: Heart,
    title: "Santé",
    desc: "Médecins, cliniques, dentistes, kinésithérapeutes, psychologues...",
    accent: "border-indigo-500/30",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: Scissors,
    title: "Services B2C",
    desc: "Salons de coiffure, coachs sportifs, conseillers, esthéticiennes...",
    accent: "border-pink-500/30",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
  {
    icon: Building2,
    title: "PME / Agences",
    desc: "Immobilier, formation professionnelle, RH, cabinets de conseil...",
    accent: "border-amber-500/30",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    desc: "Pour démarrer gratuitement",
    features: ["1 page de réservation", "50 RDV / mois", "Personnalisation basique", "Notifications email"],
    accent: "border-gray-200",
    buttonStyle: "bg-gray-900 hover:bg-gray-800 text-white",
    popular: false,
  },
  {
    name: "Pro",
    price: "19",
    desc: "Pour les professionnels actifs",
    features: [
      "Pages illimitées",
      "RDV illimités",
      "Couleurs personnalisées",
      "Support prioritaire",
      "Statistiques avancées",
    ],
    accent: "border-indigo-500",
    buttonStyle: "bg-indigo-600 hover:bg-indigo-700 text-white",
    popular: true,
  },
  {
    name: "Business",
    price: "49",
    desc: "Pour les équipes et agences",
    features: [
      "Tout le plan Pro",
      "Multi-utilisateurs",
      "API & Webhooks",
      "Marque blanche",
      "Support dédié",
    ],
    accent: "border-amber-500",
    buttonStyle: "bg-gray-900 hover:bg-gray-800 text-white",
    popular: false,
  },
];

export default function HomePage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard/config");
    }
  }, [user, isLoading, router]);

  const handleDemoLogin = async (endpoint: string) => {
    try {
      setLoadingDemo(endpoint);
      const res = await fetch(API_URL + endpoint, { method: "POST" });
      const { token } = await res.json();
      await login(token);
      router.push("/dashboard/config");
    } catch (err) {
      console.error("Demo login failed:", err);
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ==================== HERO ==================== */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="glass-card rounded-full px-4 py-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-gray-300">Nouveau : Plans Pro et Business disponibles</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-6 animate-fade-in-up">
            Transformez votre agenda en
            <br />
            <span className="gradient-text">machine à réservations</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 text-center max-w-3xl mx-auto mb-12 animate-fade-in-up">
            L&apos;outil tout-en-un pour gérer vos rendez-vous, automatiser vos réservations et
            développer votre activité. Gratuit pour commencer.
          </p>

          {/* Demo accounts */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10 animate-fade-in-up">
            {demoAccounts.map((demo) => (
              <button
                key={demo.endpoint}
                onClick={() => handleDemoLogin(demo.endpoint)}
                disabled={loadingDemo !== null}
                className={`glass-card rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.03] hover:border-white/20 group cursor-pointer ${loadingDemo === demo.endpoint ? "opacity-70" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${demo.badgeBg} ${demo.accentText}`}>
                    {demo.plan}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{demo.name}</h3>
                <p className="text-gray-400 text-sm">{demo.role}</p>
                {loadingDemo === demo.endpoint && (
                  <div className="mt-3 h-1 bg-white/10 rounded overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${demo.accent} animate-pulse w-full`} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Google login */}
          <div className="text-center animate-fade-in-up">
            <p className="text-gray-500 text-sm mb-3">ou connectez-vous avec votre compte</p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                window.location.href = authApi.getGoogleLoginUrl();
              }}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Connexion avec Google
            </Button>
          </div>
        </div>
      </section>

      {/* ================= COMMENT CA MARCHE ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Comment ça marche
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-2xl mx-auto">
            Trois étapes simples pour digitaliser votre prise de rendez-vous.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                  <step.icon className="h-7 w-7 text-indigo-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FONCTIONNALITES ================= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Fonctionnalités
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer vos rendez-vous comme un pro.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ILS NOUS FONT CONFIANCE ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-2xl mx-auto">
            Des professionnels de tous secteurs utilisent SaaS RDV au quotidien.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {segments.map((seg) => (
              <div
                key={seg.title}
                className={`rounded-xl p-6 border-2 ${seg.accent} bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 ${seg.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <seg.icon className={`h-6 w-6 ${seg.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{seg.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{seg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-2xl mx-auto">
            Commencez gratuitement, évoluez selon vos besoins. Sans engagement.
          </p>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-8 border-2 ${plan.accent} transition-all duration-300 hover:shadow-lg ${plan.popular ? "md:-mt-4 md:mb-4 shadow-lg" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" /> Populaire
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}&euro;</span>
                  <span className="text-gray-500 text-sm"> / mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${plan.buttonStyle}`}>
                  {plan.price === "0" ? "Commencer gratuitement" : "Essayer gratuitement"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTAEND ================= */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute top-10 right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à simplifier vos réservations ?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Rejoignez des centaines de professionnels qui gagnent du temps chaque jour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {demoAccounts.map((demo) => (
              <button
                key={demo.endpoint}
                onClick={() => handleDemoLogin(demo.endpoint)}
                disabled={loadingDemo !== null}
                className="glass-card rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300 hover:scale-105 hover:border-white/20"
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SaaS RDV. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
