"use client";

import { useEffect, useState } from "react";
import { teamApi, type ActivityLogEntry } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { CalendarPlus, Trash2, UserPlus, Settings, Calendar, Filter } from "lucide-react";

const actionConfig: Record<string, { icon: typeof CalendarPlus; color: string; bg: string; label: string }> = {
  BOOKING_RECEIVED: { icon: CalendarPlus, color: "text-green-600", bg: "bg-green-100", label: "Nouveau rendez-vous" },
  APPOINTMENT_CREATED: { icon: CalendarPlus, color: "text-green-600", bg: "bg-green-100", label: "RDV créé" },
  APPOINTMENT_DELETED: { icon: Trash2, color: "text-red-600", bg: "bg-red-100", label: "RDV supprimé" },
  APPOINTMENT_MODIFIED: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-100", label: "RDV modifié" },
  MEMBER_INVITED: { icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-100", label: "Membre invité" },
  MEMBER_REMOVED: { icon: Trash2, color: "text-orange-600", bg: "bg-orange-100", label: "Membre retiré" },
  CONFIG_UPDATED: { icon: Settings, color: "text-gray-600", bg: "bg-gray-100", label: "Configuration modifiée" },
};

const defaultAction = { icon: Calendar, color: "text-gray-600", bg: "bg-gray-100", label: "Action" };

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return "il y a " + Math.floor(diff / 60) + " min";
  if (diff < 86400) return "il y a " + Math.floor(diff / 3600) + "h";
  if (diff < 172800) return "hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

type FilterType = "all" | "appointment" | "member" | "config";

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    teamApi.getActivity(limit).then(setEntries).catch(() => {}).finally(() => setLoading(false));
  }, [limit]);

  const filtered = entries.filter((e) => {
    if (filter === "all") return true;
    if (filter === "appointment") return e.action.includes("APPOINTMENT") || e.action.includes("BOOKING");
    if (filter === "member") return e.action.includes("MEMBER");
    if (filter === "config") return e.action.includes("CONFIG");
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "appointment", label: "RDV" },
    { key: "member", label: "Équipe" },
    { key: "config", label: "Config" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={"px-4 py-2 rounded-xl text-sm font-medium transition-all " + (
              filter === f.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-200 text-center">
          <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune activité</h3>
          <p className="text-gray-500 text-sm">Les actions de votre équipe apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((entry) => {
              const config = actionConfig[entry.action] || defaultAction;
              const Icon = config.icon;
              return (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className={"w-10 h-10 rounded-xl " + config.bg + " flex items-center justify-center shrink-0 mt-0.5"}>
                    <Icon className={"h-5 w-5 " + config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{entry.user?.name || "Système"}</span>
                      {" — "}
                      <span className="text-gray-600">{config.label}</span>
                    </p>
                    {entry.metadata && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {(entry.metadata as any).clientName && ("Client : " + (entry.metadata as any).clientName)}
                        {(entry.metadata as any).memberName && ("Membre : " + (entry.metadata as any).memberName)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{timeAgo(entry.createdAt)}</span>
                </div>
              );
            })}
          </div>
          {entries.length >= limit && (
            <div className="px-5 py-3 border-t border-gray-100 text-center">
              <button onClick={() => setLimit((l) => l + 50)} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                Charger plus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
