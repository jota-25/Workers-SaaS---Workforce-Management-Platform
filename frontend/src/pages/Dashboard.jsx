import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { StatCard } from "../components/StatCard";
import { getDashboardStats } from "../services/dashboard.service";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    //  Cargamos los datos cuando el componente monta
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setError("No se pudieron cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // ← [] significa "solo al montar", no en cada render

  return (
    <Layout>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen general del sistema
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ✅ Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Usuarios activos"
          value={stats?.activeUsers ?? "–"}
          icon="👥"
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Workers activos"
          value={stats?.activeWorkers ?? "–"}
          icon="👷"
          color="green"
          loading={loading}
        />
        <StatCard
          title="Invitaciones pendientes"
          value={stats?.pendingInvites ?? "–"}
          icon="✉️"
          color="yellow"
          loading={loading}
        />
      </div>

      {/* ✅ Gráfico + Últimos logins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de actividad por día */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Actividad por día
          </h2>

          {loading ? (
            <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
          ) : stats?.activityByDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.activityByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  // ✅ Formateamos la fecha para que sea legible
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("es", {
                      month: "short",
                      day: "numeric"
                    })
                  }
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(d) =>
                    new Date(d).toLocaleDateString("es", {
                      weekday: "long",
                      day: "numeric",
                      month: "long"
                    })
                  }
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">
              Sin actividad reciente
            </p>
          )}
        </div>

        {/* Últimos logins */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Últimos accesos
          </h2>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : stats?.lastLogins?.length > 0 ? (
            <div className="flex flex-col divide-y divide-gray-100">
              {stats.lastLogins.map((log, i) => (
                <div key={i} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      {log.ip || "IP desconocida"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Usuario #{log.user_id}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleString("es", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">
              Sin accesos recientes
            </p>
          )}
        </div>

      </div>
    </Layout>
  );
}
