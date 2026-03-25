"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { appointmentsApi, type Appointment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Modal } from "@/components/ui/modal";
import { Trash2 } from "lucide-react";

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsApi.getAppointments();
      setAppointments(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await appointmentsApi.deleteAppointment(deleteTarget.id);
      setAppointments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Agenda</h1>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">Aucun rendez-vous pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Heure</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Telephone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Note</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {format(new Date(appt.date), "dd/MM/yyyy", { locale: fr })}
                    </td>
                    <td className="px-4 py-3">{appt.startTime}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{appt.clientName}</td>
                    <td className="px-4 py-3 text-gray-600">{appt.clientEmail || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{appt.clientPhone || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{appt.note || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteTarget(appt)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression"
      >
        <p className="text-sm text-gray-600 mb-6">
          Supprimer le rendez-vous de <strong>{deleteTarget?.clientName}</strong> ?
          Cette action est irreversible.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
