"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";

function CallbackContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token).then(() => {
        router.push("/dashboard/config");
      });
    } else {
      router.push("/");
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Connexion en cours...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
