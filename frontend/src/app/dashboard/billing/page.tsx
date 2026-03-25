"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { billingApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "0",
    features: ["1 page de reservation", "50 rendez-vous/mois", "Personnalisation basique"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "19",
    features: [
      "Pages illimitees",
      "Rendez-vous illimites",
      "Couleurs personnalisees",
      "Support prioritaire",
    ],
  },
  {
    id: "business" as const,
    name: "Business",
    price: "49",
    features: [
      "Tout le plan Pro",
      "Multi-utilisateurs",
      "API access",
      "Webhooks",
      "Support dedie",
    ],
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoadingAction("checkout");
    try {
      const { url } = await billingApi.createCheckout();
      window.location.href = url;
    } catch {
      setLoadingAction(null);
    }
  };

  const handleManage = async () => {
    setLoadingAction("portal");
    try {
      const { url } = await billingApi.createPortal();
      window.location.href = url;
    } catch {
      setLoadingAction(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Facturation</h1>
      <p className="text-gray-600 mb-8">
        Plan actuel : <span className="font-semibold capitalize">{user?.plan || "free"}</span>
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "bg-white rounded-xl p-6 shadow-sm border-2 transition-colors",
                isCurrent ? "border-blue-500" : "border-gray-100"
              )}
            >
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}EUR</span>
                <span className="text-gray-500 text-sm">/mois</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="secondary" className="w-full" disabled>
                  Plan actuel
                </Button>
              ) : plan.id === "free" ? (
                <Button variant="secondary" className="w-full" disabled>
                  Gratuit
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleUpgrade}
                  loading={loadingAction === "checkout"}
                >
                  Passer au {plan.name}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {user?.plan !== "free" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gerer mon abonnement</h3>
          <p className="text-sm text-gray-600 mb-4">
            Modifier votre moyen de paiement, telecharger vos factures ou annuler votre abonnement.
          </p>
          <Button variant="secondary" onClick={handleManage} loading={loadingAction === "portal"}>
            Ouvrir le portail Stripe
          </Button>
        </div>
      )}
    </div>
  );
}
