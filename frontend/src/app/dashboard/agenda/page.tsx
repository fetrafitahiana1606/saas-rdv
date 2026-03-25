"use client";

import { useEffect, useState } from "react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { appointmentsApi, type Appointment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Modal } from "@/components/ui/modal";
import { Trash2, CalendarDays, Clock, Users } from "lucide-react";

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAppointments = async () => {
    try { const data = await appointmentsApi.getAppointments(); setAppointments(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await appointmentsApi.deleteAppointment(deleteTarget.id); setAppointments((p) => p.filter((a) => a.id !== deleteTarget.id)); setDeleteTarget(null); }
    catch {} finally { setDeleting(false); }
  };

  const todayCount = appointments.filter(a => { try { return isToday(new Date(a.date)); } catch { return false; } }).length;
  const now = startOfDay(new Date());
  const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekCount = appointments.filter(a => { try { const d = new Date(a.date); return d >= now && d <= weekEnd; } catch { return false; } }).length;

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Users className="h-5 w-5 text-indigo-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{appointments.length}</p><p className="text-xs text-gray-500">Total RDV</p></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><CalendarDays className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{todayCount}</p><p className="text-xs text-gray-500">Aujourd&apos;hui</p></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Clock className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{weekCount}</p><p className="text-xs text-gray-500">Cette semaine</p></div>
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rendez-vous</h3>
          <p className="text-gray-500 text-sm">Partagez votre lien de r\u00e9servation pour recevoir vos premiers rendez-vous.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Heure</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">T\u00e9l\u00e9phone</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Note</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>{appointments.map((appt) => {
              let status = "upcoming";
              try { const d = new Date(appt.date); if (isToday(d)) status = "today"; else if (isBefore(d, now)) status = "past"; } catch {}
              return (
                <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status === "today" ? "bg-green-500" : status === "past" ? "bg-gray-300" : "bg-indigo-500"}`} />
                      {(() => { try { return format(new Date(appt.date), "dd/MM/yyyy", { locale: fr }); } catch { return appt.date; } })()}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono">{appt.startTime}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{appt.clientName}</td>
                  <td className="px-5 py-4 text-gray-500">{appt.clientEmail || "-"}</td>
                  <td className="px-5 py-4 text-gray-500">{appt.clientPhone || "-"}</td>
                  <td className="px-5 py-4 text-gray-500 max-w-[200px] truncate">{appt.note || "-"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setDeleteTarget(appt)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer ce rendez-vous ?">
        <p className="text-sm text-gray-600 mb-6">Le rendez-vous de <strong>{deleteTarget?.clientName}</strong> sera d\u00e9finitivement supprim\u00e9.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}