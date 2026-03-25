"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { businessApi, type BusinessConfig, type BusinessHours } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";

const COLORS = [
  { value: "#6366f1", name: "Indigo" },
  { value: "#ef4444", name: "Rouge" },
  { value: "#22c55e", name: "Vert" },
  { value: "#8b5cf6", name: "Violet" },
  { value: "#f97316", name: "Orange" },
  { value: "#ec4899", name: "Rose" },
];
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
const DAYS = [
  { key: "lundi", label: "Lundi" }, { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" }, { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" }, { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

interface FormValues {
  businessName: string; serviceType: string; primaryColor: string; slug: string;
  slotDuration: number; hours: BusinessHours;
  formFields: { email: boolean; phone: boolean; note: boolean };
}

function defaultHours(): BusinessHours {
  const h: BusinessHours = {};
  DAYS.forEach((d) => { h[d.key] = { start: "09:00", end: "18:00", enabled: d.key !== "samedi" && d.key !== "dimanche" }; });
  return h;
}

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, control, reset, watch } = useForm<FormValues>({
    defaultValues: { businessName: "", serviceType: "", primaryColor: "#6366f1", slug: "", slotDuration: 30, hours: defaultHours(), formFields: { email: true, phone: false, note: false } },
  });
  const slugValue = watch("slug");

  useEffect(() => {
    businessApi.getMyBusiness().then((biz) => {
      reset({ businessName: biz.businessName || "", serviceType: biz.serviceType || "", primaryColor: biz.primaryColor || "#6366f1", slug: biz.slug || "", slotDuration: biz.slotDuration || 30, hours: biz.hours || defaultHours(), formFields: biz.formFields || { email: true, phone: false, note: false } });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true); setMessage(null);
    try { await businessApi.updateMyBusiness(data); setMessage({ type: "success", text: "Configuration enregistrée !" }); }
    catch (err: any) { setMessage({ type: "error", text: err.message || "Erreur." }); }
    finally { setSaving(false); }
  };

  const copyLink = () => {
    const link = (typeof window !== "undefined" ? window.location.origin : "") + "/book/" + slugValue;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nom du business" {...register("businessName")} placeholder="Mon entreprise" />
            <Input label="Type de service" {...register("serviceType")} placeholder="Consultation, coiffure..." />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Couleur principale</h2>
          <Controller name="primaryColor" control={control} render={({ field }) => (
            <div className="flex gap-3">{COLORS.map((c) => (
              <button key={c.value} type="button" onClick={() => field.onChange(c.value)} title={c.name}
                className={`w-12 h-12 rounded-xl transition-all ${field.value === c.value ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "hover:scale-105"}`}
                style={{ backgroundColor: c.value }} />
            ))}</div>
          )} />
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lien de réservation</h2>
          <Input label="Slug" {...register("slug")} placeholder="mon-entreprise" />
          <div className="mt-3 flex items-center gap-2">
            <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-indigo-600 flex-1 truncate">
              {typeof window !== "undefined" ? window.location.origin : ""}/book/{slugValue || "..."}
            </code>
            <button type="button" onClick={copyLink} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors" title="Copier">
              <Copy className="h-4 w-4" />
            </button>
            {slugValue && (
              <a href={`/book/${slugValue}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-indigo-600 transition-colors" title="Ouvrir">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          {copied && <p className="text-xs text-green-600 mt-1">Lien copié !</p>}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Durée des créneaux</h2>
          <select {...register("slotDuration", { valueAsNumber: true })}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            {DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
          </select>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Horaires</h2>
          <div className="space-y-3">{DAYS.map((day) => (
            <Controller key={day.key} name={`hours.${day.key}`} control={control} render={({ field }) => (
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => field.onChange({ ...field.value, enabled: !field.value?.enabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${field.value?.enabled ? "bg-indigo-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${field.value?.enabled ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-medium text-gray-700 w-24">{day.label}</span>
                <input type="time" value={field.value?.start ?? "09:00"} onChange={(e) => field.onChange({ ...field.value, start: e.target.value })}
                  disabled={!field.value?.enabled} className="rounded-xl border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-30" />
                <span className="text-gray-400">—</span>
                <input type="time" value={field.value?.end ?? "18:00"} onChange={(e) => field.onChange({ ...field.value, end: e.target.value })}
                  disabled={!field.value?.enabled} className="rounded-xl border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-30" />
              </div>
            )} />
          ))}</div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Champs du formulaire client</h2>
          <p className="text-sm text-gray-500 mb-4">Le nom est toujours requis.</p>
          <div className="flex gap-6">{(["email", "phone", "note"] as const).map((f) => (
            <Controller key={f} name={`formFields.${f}`} control={control} render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <button type="button" onClick={() => field.onChange(!field.value)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${field.value ? "bg-indigo-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${field.value ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm text-gray-700">{f === "phone" ? "Téléphone" : f === "note" ? "Note" : "Email"}</span>
              </label>
            )} />
          ))}</div>
        </section>

        <button type="submit" disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2">
          {saving ? <><Spinner size="sm" /> Enregistrement...</> : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}