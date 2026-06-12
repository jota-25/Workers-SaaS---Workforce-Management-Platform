import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import {
  getInvitations,
  resendInvitation,
  cancelInvitation
} from "../services/invitations.service";

//  Muestra si la invitación está expirada, pendiente o usada
const getStatus = (invite) => {
  if (invite.used) return { label: "Usada", color: "bg-green-100 text-green-700" };
  if (new Date(invite.expires_at) < new Date())
    return { label: "Expirada", color: "bg-red-100 text-red-700" };
  return { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" };
};

export default function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [successMsg, setSuccessMsg]   = useState("");
  const [acting, setActing]           = useState(null); // id de invitación en acción

  // ================================
  // Cargar invitaciones
  // ================================
  const fetchInvitations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch {
      setError("No se pudieron cargar las invitaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // ================================
  // Helpers
  // ================================
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ================================
  // Reenviar
  // ================================
  const handleResend = async (invite) => {
    const ok = window.confirm(
      `¿Reenviar invitación a ${invite.email}? Se generará un nuevo link.`
    );
    if (!ok) return;

    setActing(invite.id);
    try {
      await resendInvitation(invite.id);
      showSuccess(`Invitación reenviada a ${invite.email} — revisa los logs`);
      fetchInvitations();
    } catch (error) {
      setError(error.response?.data?.message || "Error al reenviar");
    } finally {
      setActing(null);
    }
  };

  // ================================
  // Cancelar
  // ================================
  const handleCancel = async (invite) => {
    const ok = window.confirm(
      `¿Cancelar la invitación de ${invite.email}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setActing(invite.id);
    try {
      await cancelInvitation(invite.id);
      showSuccess(`Invitación de ${invite.email} cancelada`);
      fetchInvitations();
    } catch (error) {
      setError(error.response?.data?.message || "Error al cancelar");
    } finally {
      setActing(null);
    }
  };

  // ================================
  // Stats rápidas
  // ================================
  const pending  = invitations.filter(i => !i.used && new Date(i.expires_at) > new Date()).length;
  const used     = invitations.filter(i => i.used).length;
  const expired  = invitations.filter(i => !i.used && new Date(i.expires_at) < new Date()).length;

  // ================================
  // Render
  // ================================
  return (
    <Layout>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invitaciones</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona las invitaciones enviadas a workers
        </p>
      </div>

      {/* Stats rápidas */}
      {!loading && invitations.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            <p className="text-xs text-gray-500 mt-1">Pendientes</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{used}</p>
            <p className="text-xs text-gray-500 mt-1">Aceptadas</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{expired}</p>
            <p className="text-xs text-gray-500 mt-1">Expiradas</p>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-green-700"> {successMsg}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Worker</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Rol</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Estado</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Expira</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">

            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : invitations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No hay invitaciones todavía — crea un worker para generar una
                </td>
              </tr>
            ) : (
              invitations.map(invite => {
                const status = getStatus(invite);
                const isActing = acting === invite.id;
                const canAct = !invite.used;

                return (
                  <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {invite.worker_name || "–"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {invite.role || "–"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${status.color}
                      `}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(invite.expires_at).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {canAct ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResend(invite)}
                            disabled={isActing}
                            className="text-blue-600 hover:underline text-sm disabled:opacity-40"
                          >
                            {isActing ? "..." : "Reenviar"}
                          </button>
                          <button
                            onClick={() => handleCancel(invite)}
                            disabled={isActing}
                            className="text-red-500 hover:underline text-sm disabled:opacity-40"
                          >
                            {isActing ? "..." : "Cancelar"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">–</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}

          </tbody>
        </table>
      </div>

    </Layout>
  );
}
