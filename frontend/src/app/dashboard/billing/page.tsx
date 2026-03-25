"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { billingApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

const plans = [
  { id: "free" as const, name: "Free", price: "0", features: ["1 page de r\u00e9servation", "50 RDV/mois", "Personnalisation basique"], popular: false },
  { id: "pro" as const, name: "Pro", price: "19", features: ["Pages illimit\u00e9es", "RDV illimit\u00e9s", "Couleurs personnalis\u00e9es", "Support prioritaire", "Statistiques avanc\u00e9es"], popular: true },
  { id: "business" as const, name: "Business", price: "49", features: ["Tout le plan Pro", "Multi-utilisateurs", "API & Webhooks", "Marque blanche", "Support d\u00e9di\u00e9"], popular: false },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoadingAction("checkout");
    try { const { url } = await billingApi.createCheckout(); window.location.href = url; }
    catch { setLoadingAction(null); }
  };

  const handleManage = async () => {
    setLoadingAction("portal");
    try { const { url } = await billingApi.createPortal(); window.location.href = url; }
    catch { setLoadingAction(null); }
  };

  return (
    <div>
      <p className="text-gray-600 mb-8">Plan actuel : <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg text-sm capitalize">{user?.plan || "free"}</span></p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <div key={plan.id} className={cn(
              "bg-white rounded-2xl p-8 shadow-sm border-2 transition-all hover:shadow-lg relative",
              plan.popular ? "border-indigo-500 md:scale-105" : "border-gray-100",
              isCurrent && "ring-2 ring-green-500 ring-offset-2"
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Populaire
                </div>
              )}
              {isCurrent && <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Actuel</div>}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}\u20ac</span>
                <span className="text-gray-500 text-sm">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button disabled className="w-full py-3 rounded-xl font-semibold text-sm bg-green-50 text-green-700 cursor-default">Plan actuel</button>
              ) : plan.id === "free" ? (
                <button disabled className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-500 cursor-default">Gratuit</button>
              ) : (
                <button onClick={handleUpgrade} disabled={!!loadingAction}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loadingAction === "checkout" ? "Redirection..." : `Passer au ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {user?.plan !== "free" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">G\u00e9rer mon abonnement</h3>
          <p className="text-sm text-gray-600 mb-4">Modifier votre moyen de paiement, t\u00e9l\u00e9charger vos factures ou annuler.</p>
          <button onClick={handleManage} disabled={!!loadingAction}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50">
            {loadingAction === "portal" ? "Redirection..." : "Ouvrir le portail Stripe"}
          </button>
        </div>
      )}
    </div>
  );
}