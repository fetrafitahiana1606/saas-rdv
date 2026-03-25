"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { Settings, Calendar, CreditCard, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { businessApi } from "@/lib/api";

const navItems = [
  { href: "/dashboard/config", label: "Configuration", icon: Settings },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/billing", label: "Facturation", icon: CreditCard },
];

const planBadge: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-gray-600" },
  pro: { label: "Pro", color: "bg-indigo-600" },
  business: { label: "Business", color: "bg-orange-500" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/");
  }, [user, isLoading, router]);

  useEffect(() => {
    businessApi.getMyBusiness().then(b => setSlug(b.slug)).catch(() => {});
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Spinner size="lg" /></div>;
  }
  if (!user) return null;

  const badge = planBadge[user.plan] || planBadge.free;
  const pageTitles: Record<string, string> = {
    "/dashboard/config": "Configuration",
    "/dashboard/agenda": "Agenda",
    "/dashboard/billing": "Facturation",
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static z-40 w-64 h-screen bg-slate-900 flex flex-col transition-transform md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">SaaS <span className="text-indigo-400">RDV</span></h1>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}

          {slug && (
            <a
              href={`/book/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all mt-4"
            >
              <ExternalLink className="h-5 w-5" />
              Page publique
            </a>
          )}
        </nav>

        <div className="p-4 mx-3 mb-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded text-white", badge.color)}>
                {badge.label}
              </span>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors w-full">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{pageTitles[pathname] || "Dashboard"}</h2>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}