"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Settings, CalendarDays, Globe } from "lucide-react";

const features = [
  {
    icon: Settings,
    title: "Configuration",
    desc: "Personnalisez vos horaires, duree des creneaux et champs du formulaire.",
  },
  {
    icon: Globe,
    title: "Reservation en ligne",
    desc: "Partagez votre lien unique et recevez des reservations 24h/24.",
  },
  {
    icon: CalendarDays,
    title: "Agenda",
    desc: "Visualisez et gerez tous vos rendez-vous depuis un seul tableau.",
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard/config");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <header className="max-w-4xl mx-auto pt-20 pb-16 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          SaaS <span className="text-blue-600">RDV</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Gerez vos rendez-vous en ligne facilement. Configurez votre page de reservation,
          partagez le lien et laissez vos clients reserver en autonomie.
        </p>
        <Button
          size="lg"
          onClick={() => {
            window.location.href = authApi.getGoogleLoginUrl();
          }}
          className="text-base"
        >
          Connexion avec Google
        </Button>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
