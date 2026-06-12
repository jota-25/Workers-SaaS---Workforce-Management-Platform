import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import {
  getMySessions,
  deleteSession,
  deleteOtherSessions,
  deleteAllSessions
} from "../services/sessions.service";
import {
  parseBrowser,
  parseOS,
  getDeviceIcon,
  timeAgo
} from "../utils/userAgent";

export default function Sessions() {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [closing, setClosing]     = useState(null); // id de sesión cerrándose

  // ================================
  // Cargar sesiones
  // ================================
  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMySessions();
      setSessions(data);
    } catch {
      setError("No se pudieron cargar las sesiones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // ================================
  // Helpers
  // ================================
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  //  Identificamos la sesión actual comparando el refreshToken
  const currentRefreshToken = localStorage.getItem("refreshToken");

  // ================================
  // Cerrar una sesión específica
  // ================================
  const handleCloseOne = async (session) => {
    const ok = window.confirm(
      `¿Cerrar sesión en ${parseBrowser(session.user_agent)} — ${parseOS(session.user_agent)}?`
    );
    if (!ok) return;

    setClosing(session.id);
    try {
      await deleteSession(session.id);
      showSuccess("Sesión cerrada correctamente");
      fetchSessions();
    } catch {
      setError("Error al cerrar la sesión");
    } finally {
      setClosing(null);
    }
  };

  // ================================
  // Cerrar todas las otras sesiones
  // ================================
  const handleCloseOthers = async () => {
    const others = sessions.filter(s => !isCurrentSession(s));
    if (others.length === 0) return;

    const ok = window.confirm(
      `¿Cerrar las otras ${others.length} sesión(es) activa(s)?`
    );
    if (!ok) return;

    try {
      await deleteOtherSessions(currentRefreshToken);
      showSuccess(`${others.length} sesión(es) cerrada(s)`);
      fetchSessions();
    } catch {
      setError("Error al cerrar las sesiones");
    }
  };

  // ================================
  // Cerrar absolutamente todas
  // ================================
  const handleCloseAll = async () => {
    const ok = window.confirm(
      "¿Cerrar TODAS las sesiones? Tendrás que iniciar sesión de nuevo."
    );
    if (!ok) return;

    try {
      await deleteAllSessions();
      //  Limpiamos tokens locales y redirigimos al login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    } catch {
      setError("Error al cerrar todas las sesiones");
    }
  };

  // ================================
  // ¿Es la sesión actual?
  // No podemos comparar el token directamente porque en DB está hasheado.
  // Identificamos la sesión actual por ser la más reciente (last_used_at).
  // ================================
  const isCurrentSession = (session) => {
    if (!sessions.length) return false;
    const latest = sessions.reduce((a, b) =>
      new Date(a.last_used_at) > new Date(b.last_used_at) ? a : b
    );
    return session.id === latest.id;
  };

  const otherSessionsCount = sessions.filter(s => !isCurrentSession(s)).length;

  // ================================
  // Render
  // ================================
  return (
    <Layout>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sesiones activas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Dispositivos donde tienes sesión iniciada
          </p>
        </div>

        {/* Acciones globales */}
        {!loading && sessions.length > 0 && (
          <div className="flex gap-2">
            {otherSessionsCount > 0 && (
              <button
                onClick={handleCloseOthers}
                className="text-sm text-yellow-600 hover:text-yellow-700 border border-yellow-200 bg-yellow-50 px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar otras ({otherSessionsCount})
              </button>
            )}
            <button
              onClick={handleCloseAll}
              className="text-sm text-red-600 hover:text-red-700 border border-red-200 bg-red-50 px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar todas
            </button>
          </div>
        )}
      </div>

      {/* Mensajes */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-green-700">✅ {successMsg}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ================================ */}
      {/* Lista de sesiones                */}
      {/* ================================ */}
      <div className="flex flex-col gap-3">

        {loading ? (
          // Skeleton
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </div>
            </div>
          ))
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No hay sesiones activas</p>
          </div>
        ) : (
          sessions.map(session => {
            const isCurrent = isCurrentSession(session);
            const browser   = parseBrowser(session.user_agent);
            const os        = parseOS(session.user_agent);
            const icon      = getDeviceIcon(session.user_agent);

            return (
              <div
                key={session.id}
                className={`
                  bg-white rounded-2xl border p-5
                  flex items-center gap-4
                  transition-all
                  ${isCurrent
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-gray-200"
                  }
                `}
              >
                {/* Ícono dispositivo */}
                <div className={`
                  w-11 h-11 rounded-xl flex items-center justify-center text-xl
                  ${isCurrent ? "bg-blue-100" : "bg-gray-100"}
                `}>
                  {icon}
                </div>

                {/* Info de la sesión */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">
                      {browser} — {os}
                    </p>
                    {/*  Badge sesión actual */}
                    {isCurrent && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Sesión actual
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-1">
                    <p className="text-xs text-gray-400">
                      🌐 {session.ip || "IP desconocida"}
                    </p>
                    <p className="text-xs text-gray-400">
                      🕐 Último uso: {timeAgo(session.last_used_at)}
                    </p>
                    <p className="text-xs text-gray-400">
                      📅 Inicio: {new Date(session.created_at).toLocaleDateString("es", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      ⏳ Expira: {new Date(session.expires_at).toLocaleDateString("es", {
                        day: "numeric", month: "short"
                      })}
                    </p>
                  </div>
                </div>

                {/* Botón cerrar — no se puede cerrar la sesión actual desde aquí */}
                {!isCurrent && (
                  <button
                    onClick={() => handleCloseOne(session)}
                    disabled={closing === session.id}
                    className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-40 whitespace-nowrap"
                  >
                    {closing === session.id ? "Cerrando..." : "Cerrar"}
                  </button>
                )}
              </div>
            );
          })
        )}

      </div>

      {/* Info de seguridad */}
      {!loading && sessions.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500">
            🔐 Si ves una sesión que no reconoces, ciérrala inmediatamente y cambia tu contraseña.
            Las sesiones expiran automáticamente después de 7 días de inactividad.
          </p>
        </div>
      )}

    </Layout>
  );
}
