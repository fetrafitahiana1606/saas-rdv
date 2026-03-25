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
import {
  businessApi,
  appointmentsApi,
  type BusinessConfig,
  type CreateAppointmentData,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, CalendarDays, Clock, CheckCircle2 } from "lucide-react";

const DAY_KEYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

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

  // Fetch business info
  useEffect(() => {
    businessApi
      .getPublicBusiness(slug)
      .then(setBusiness)
      .catch((err) => setError(err.message || "Page introuvable."))
      .finally(() => setLoading(false));
  }, [slug]);

  // Apply primary color
  useEffect(() => {
    if (business?.primaryColor) {
      document.documentElement.style.setProperty("--primary", business.primaryColor);
    }
    return () => {
      document.documentElement.style.setProperty("--primary", "#3b82f6");
    };
  }, [business?.primaryColor]);

  // Disabled days logic
  const disabledDays = useMemo(() => {
    if (!business?.hours) return [];
    return (date: Date) => {
      if (isBefore(date, startOfDay(new Date()))) return true;
      const dayKey = DAY_KEYS[getDay(date)];
      const dayConf = business.hours[dayKey];
      return !dayConf?.enabled;
    };
  }, [business?.hours]);

  // Fetch slots when date selected
  useEffect(() => {
    if (!selectedDate || !slug) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    appointmentsApi
      .getAvailability(slug, dateStr)
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, slug]);

  // Build zod schema dynamically based on business.formFields
  const formSchema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {
      clientName: z.string().min(2, "Le nom est requis (min 2 caracteres)."),
    };
    if (business?.formFields?.email) {
      shape.clientEmail = z.string().email("Email invalide.");
    }
    if (business?.formFields?.phone) {
      shape.clientPhone = z.string().min(8, "Telephone requis (min 8 caracteres).");
    }
    if (business?.formFields?.note) {
      shape.note = z.string().optional();
    }
    return z.object(shape);
  }, [business?.formFields]);

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      const payload: CreateAppointmentData = {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        note: data.note,
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: selectedSlot,
      };
      await appointmentsApi.createAppointment(slug, payload);
      setStep(4);
    } catch {
      // keep on same step
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSlots([]);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops !</h1>
          <p className="text-gray-600">{error || "Page introuvable."}</p>
        </div>
      </div>
    );
  }

  const accentColor = business.primaryColor || "#3b82f6";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{business.businessName}</h1>
          {business.serviceType && (
            <p className="text-gray-600 mt-1">{business.serviceType}</p>
          )}
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-2 rounded-full transition-all"
              style={{
                width: s === step ? "2rem" : "0.5rem",
                backgroundColor: s <= step ? accentColor : "#d1d5db",
              }}
            />
          ))}
        </div>

        {/* Step 1: Calendar */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-semibold text-gray-900">Choisir une date</h2>
            </div>
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date ?? undefined);
                  if (date) setStep(2);
                }}
                disabled={disabledDays}
                locale={fr}
              />
            </div>
          </div>
        )}

        {/* Step 2: Slots */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5" style={{ color: accentColor }} />
              <h2 className="text-lg font-semibold text-gray-900">Choisir un creneau</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            {slotsLoading ? (
              <Spinner className="py-8" />
            ) : slots.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun creneau disponible pour cette date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep(3);
                    }}
                    className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                    style={{
                      borderColor: selectedSlot === slot ? accentColor : "#e5e7eb",
                      backgroundColor: selectedSlot === slot ? accentColor : "white",
                      color: selectedSlot === slot ? "white" : "#374151",
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Client form */}
        {step === 3 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos informations</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nom *"
                {...register("clientName")}
                error={errors.clientName?.message as string}
                placeholder="Votre nom complet"
              />
              {business.formFields?.email && (
                <Input
                  label="Email *"
                  type="email"
                  {...register("clientEmail")}
                  error={errors.clientEmail?.message as string}
                  placeholder="email@exemple.com"
                />
              )}
              {business.formFields?.phone && (
                <Input
                  label="Telephone *"
                  type="tel"
                  {...register("clientPhone")}
                  error={errors.clientPhone?.message as string}
                  placeholder="+33 6 12 34 56 78"
                />
              )}
              {business.formFields?.note && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    {...register("note")}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Informations complementaires..."
                  />
                </div>
              )}
              <Button
                type="submit"
                loading={submitting}
                className="w-full"
                style={{ backgroundColor: accentColor }}
              >
                Confirmer le rendez-vous
              </Button>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4" style={{ color: accentColor }} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Rendez-vous confirme !</h2>
            <div className="text-sm text-gray-600 space-y-1 mb-6">
              <p><strong>{business.businessName}</strong></p>
              <p>{selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
              <p>{selectedSlot}</p>
            </div>
            <Button variant="secondary" onClick={resetBooking}>
              Nouveau rendez-vous
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
