"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DayPicker } from "react-day-picker";
import { format, getDay, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { businessApi, appointmentsApi, type BusinessConfig, type CreateAppointmentData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, CalendarDays, Clock, CheckCircle2, User, Mail, Phone, MessageSquare } from "lucide-react";

const DAY_KEYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const stepLabels = ["Date", "Créneau", "Infos", "Confirmé"];

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    businessApi.getPublicBusiness(slug).then(setBusiness)
      .catch((err) => setError(err.message || "Page introuvable."))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (business?.primaryColor) document.documentElement.style.setProperty("--primary", business.primaryColor);
    return () => { document.documentElement.style.setProperty("--primary", "#6366f1"); };
  }, [business?.primaryColor]);

  const disabledDays = useMemo(() => {
    if (!business?.hours) return [];
    return (date: Date) => {
      if (isBefore(date, startOfDay(new Date()))) return true;
      const dayKey = DAY_KEYS[getDay(date)];
      return !business.hours[dayKey]?.enabled;
    };
  }, [business?.hours]);

  useEffect(() => {
    if (!selectedDate || !slug) return;
    setSlotsLoading(true); setSelectedSlot(null);
    appointmentsApi.getAvailability(slug, format(selectedDate, "yyyy-MM-dd"))
      .then((res) => setSlots(res.slots || [])).catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, slug]);

  const formSchema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = { clientName: z.string().min(2, "Nom requis (min 2 caractères).") };
    if (business?.formFields?.email) shape.clientEmail = z.string().email("Email invalide.");
    if (business?.formFields?.phone) shape.clientPhone = z.string().min(8, "Téléphone requis.");
    if (business?.formFields?.note) shape.note = z.string().optional();
    return z.object(shape);
  }, [business?.formFields]);

  type FormData = z.infer<typeof formSchema>;
  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormData) => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await appointmentsApi.createAppointment(slug, {
        clientName: data.clientName, clientEmail: (data as any).clientEmail, clientPhone: (data as any).clientPhone,
        note: (data as any).note, date: format(selectedDate, "yyyy-MM-dd"), startTime: selectedSlot,
      } as CreateAppointmentData);
      setStep(4);
    } catch {} finally { setSubmitting(false); }
  };

  const resetBooking = () => { setStep(1); setSelectedDate(undefined); setSelectedSlot(null); setSlots([]); resetForm(); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  if (error || !business) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
        <p className="text-gray-500">{error || "Ce lien de réservation n'existe pas."}</p>
      </div>
    </div>
  );

  const accent = business.primaryColor || "#6366f1";

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}15, ${accent}05)` }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl" style={{ backgroundColor: accent }}>
            {business.businessName[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{business.businessName}</h1>
          {business.serviceType && <span className="inline-block mt-2 text-sm px-3 py-1 rounded-full" style={{ backgroundColor: accent + "15", color: accent }}>{business.serviceType}</span>}
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted ? "bg-green-500 text-white" : isActive ? "text-white shadow-lg" : "bg-gray-200 text-gray-500"
                  }`} style={isActive ? { backgroundColor: accent } : {}}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                </div>
                {i < 3 && <div className={`w-8 h-0.5 mx-1 mb-4 ${step > stepNum ? "bg-green-500" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5" style={{ color: accent }} />
              <h2 className="text-lg font-semibold text-gray-900">Choisir une date</h2>
            </div>
            <div className="flex justify-center">
              <DayPicker mode="single" selected={selectedDate}
                onSelect={(date) => { setSelectedDate(date ?? undefined); if (date) setStep(2); }}
                disabled={disabledDays} locale={fr} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5" style={{ color: accent }} />
              <h2 className="text-lg font-semibold text-gray-900">Choisir un créneau</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
            {slotsLoading ? <div className="py-8 flex justify-center"><Spinner /></div> : slots.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun créneau disponible.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button key={slot} onClick={() => { setSelectedSlot(slot); setStep(3); }}
                    className="px-3 py-2.5 rounded-xl border text-sm font-medium transition-all hover:scale-105"
                    style={{ borderColor: accent + "33", color: accent }}>
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <div className="flex items-center gap-2 p-3 rounded-xl mb-6" style={{ backgroundColor: accent + "10" }}>
              <CalendarDays className="h-4 w-4" style={{ color: accent }} />
              <span className="text-sm font-medium" style={{ color: accent }}>
                {selectedDate && format(selectedDate, "EEEE d MMMM", { locale: fr })} à {selectedSlot}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos informations</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nom *" {...register("clientName")} error={(errors as any).clientName?.message} placeholder="Votre nom complet" />
              {business.formFields?.email && <Input label="Email *" type="email" {...register("clientEmail")} error={(errors as any).clientEmail?.message} placeholder="email@exemple.com" />}
              {business.formFields?.phone && <Input label="Téléphone *" type="tel" {...register("clientPhone")} error={(errors as any).clientPhone?.message} placeholder="+33 6 12 34 56 78" />}
              {business.formFields?.note && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea {...register("note")} rows={3} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Informations complémentaires..." /></div>
              )}
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: accent }}>
                {submitting ? "Confirmation..." : "Confirmer le rendez-vous"}
              </button>
            </form>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: accent + "15" }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: accent }} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
            <div className="text-sm text-gray-600 space-y-1 mb-8 bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-900">{business.businessName}</p>
              <p>{selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
              <p className="font-mono" style={{ color: accent }}>{selectedSlot}</p>
            </div>
            <Button variant="secondary" onClick={resetBooking} className="rounded-xl">Nouveau rendez-vous</Button>
            <p className="text-xs text-gray-400 mt-8">Powered by <span className="font-semibold">SaaS RDV</span></p>
          </div>
        )}
      </div>
    </div>
  );
}