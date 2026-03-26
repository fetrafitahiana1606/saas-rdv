"use client";

import { useEffect, useState } from "react";
import { teamApi, type TeamMember } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus, Users, Shield, Eye, Trash2 } from "lucide-react";

const roleBadge: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-indigo-100 text-indigo-700" },
  secretary: { label: "Secr\u00e9taire", color: "bg-purple-100 text-purple-700" },
  readonly: { label: "Lecture seule", color: "bg-gray-100 text-gray-700" },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "secretary" });
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try { const data = await teamApi.getMembers(); setMembers(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.name) return;
    setInviting(true); setError(null);
    try {
      await teamApi.inviteMember(inviteForm);
      setShowInvite(false);
      setInviteForm({ email: "", name: "", role: "secretary" });
      fetchMembers();
    } catch (err: any) { setError(err.message || "Erreur lors de l'invitation."); }
    finally { setInviting(false); }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try { await teamApi.updateRole(memberId, role); fetchMembers(); } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await teamApi.removeMember(deleteTarget.id); setMembers((p) => p.filter((m) => m.id !== deleteTarget.id)); setDeleteTarget(null); }
    catch {} finally { setDeleting(false); }
  };

  const adminCount = members.filter((m) => m.role === "admin").length;
  const secretaryCount = members.filter((m) => m.role === "secretary").length;

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Users className="h-5 w-5 text-indigo-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{members.length}</p><p className="text-xs text-gray-500">Membres</p></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Shield className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{adminCount}</p><p className="text-xs text-gray-500">Administrateurs</p></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Eye className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{secretaryCount}</p><p className="text-xs text-gray-500">Secr\u00e9taires</p></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={() => setShowInvite(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-sm">
          <UserPlus className="h-4 w-4" /> Inviter un membre
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-200 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun membre</h3>
          <p className="text-gray-500 text-sm">Invitez votre premi\u00e8re secr\u00e9taire ou collaborateur.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Membre</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">R\u00f4le</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Ajout\u00e9 le</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {member.user?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-gray-900">{member.user?.name || "\u2014"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{member.user?.email || "\u2014"}</td>
                  <td className="px-5 py-4">
                    <select value={member.role} onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 cursor-pointer focus:ring-2 focus:ring-indigo-500/20">
                      <option value="admin">Admin</option>
                      <option value="secretary">Secr\u00e9taire</option>
                      <option value="readonly">Lecture seule</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{new Date(member.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setDeleteTarget(member)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showInvite} onClose={() => { setShowInvite(false); setError(null); }} title="Inviter un membre">
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
          <Input label="Email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="email@exemple.com" />
          <Input label="Nom" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="Nom complet" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">R\u00f4le</label>
            <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="admin">Administrateur</option>
              <option value="secretary">Secr\u00e9taire</option>
              <option value="readonly">Lecture seule</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Annuler</Button>
            <button onClick={handleInvite} disabled={inviting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm">
              {inviting ? "Invitation..." : "Inviter"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Retirer ce membre ?">
        <p className="text-sm text-gray-600 mb-6"><strong>{deleteTarget?.user?.name}</strong> n&apos;aura plus acc\u00e8s \u00e0 votre espace.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Retirer</Button>
        </div>
      </Modal>
    </div>
  );
}
