"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { businessApi, type BusinessConfig, type BusinessHours } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#8b5cf6", "#f97316", "#ec4899"];
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
const DAYS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

interface FormValues {
  businessName: string;
  serviceType: string;
  primaryColor: string;
  slug: string;
  slotDuration: number;
  hours: BusinessHours;
  formFields: { email: boolean; phone: boolean; note: boolean };
}

function defaultHours(): BusinessHours {
  const h: BusinessHours = {};
  DAYS.forEach((d) => {
    h[d.key] = { start: "09:00", end: "18:00", enabled: d.key !== "samedi" && d.key !== "dimanche" };
  });
  return h;
}

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { register, handleSubmit, control, reset, watch } = useForm<FormValues>({
    defaultValues: {
      businessName: "",
      serviceType: "",
      primaryColor: "#3b82f6",
      slug: "",
      slotDuration: 30,
      hours: defaultHours(),
      formFields: { email: true, phone: false, note: false },
    },
  });

  const slugValue = watch("slug");

  useEffect(() => {
    businessApi
      .getMyBusiness()
      .then((biz) => {
        reset({
          businessName: biz.businessName || "",
          serviceType: biz.serviceType || "",
          primaryColor: biz.primaryColor || "#3b82f6",
          slug: biz.slug || "",
          slotDuration: biz.slotDuration || 30,
          hours: biz.hours || defaultHours(),
          formFields: biz.formFields || { email: true, phone: false, note: false },
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setMessage(null);
    try {
      await businessApi.updateMyBusiness(data);
      setMessage({ type: "success", text: "Configuration enregistree avec succes !" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuration</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Business info */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nom du business" {...register("businessName")} placeholder="Mon entreprise" />
            <Input label="Type de service" {...register("serviceType")} placeholder="Consultation, coiffure..." />
          </div>
        </section>

        {/* Color */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Couleur principale</h2>
          <Controller
            name="primaryColor"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => field.onChange(c)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      field.value === c ? "border-gray-900 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          />
        </section>

        {/* Slug */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Lien de reservation</h2>
          <Input label="Slug" {...register("slug")} placeholder="mon-entreprise" />
          <p className="text-sm text-gray-500">
            Lien de reservation :{" "}
            <span className="font-mono text-blue-600">
              {typeof window !== "undefined" ? window.location.origin : ""}/book/{slugValue || "..."}
            </span>
          </p>
        </section>

        {/* Slot duration */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Duree des creneaux</h2>
          <select
            {...register("slotDuration", { valueAsNumber: true })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </select>
        </section>

        {/* Hours */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Horaires</h2>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <Controller
                key={day.key}
                name={`hours.${day.key}`}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 w-32">
                      <input
                        type="checkbox"
                        checked={field.value?.enabled ?? false}
                        onChange={(e) => field.onChange({ ...field.value, enabled: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{day.label}</span>
                    </label>
                    <input
                      type="time"
                      value={field.value?.start ?? "09:00"}
                      onChange={(e) => field.onChange({ ...field.value, start: e.target.value })}
                      disabled={!field.value?.enabled}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="time"
                      value={field.value?.end ?? "18:00"}
                      onChange={(e) => field.onChange({ ...field.value, end: e.target.value })}
                      disabled={!field.value?.enabled}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
                    />
                  </div>
                )}
              />
            ))}
          </div>
        </section>

        {/* Form fields */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Champs du formulaire client</h2>
          <p className="text-sm text-gray-500">Le nom est toujours requis.</p>
          <div className="flex gap-6">
            {(["email", "phone", "note"] as const).map((f) => (
              <label key={f} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register(`formFields.${f}`)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">{f === "phone" ? "Telephone" : f === "note" ? "Note" : "Email"}</span>
              </label>
            ))}
          </div>
        </section>

        <Button type="submit" loading={saving} size="lg">
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
