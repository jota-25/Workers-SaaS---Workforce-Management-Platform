import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { getLogs, getLogsStats, exportLogs } from "../services/logs.service";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

//  Colores para el PieChart de acciones
const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#06b6d4"
];

//  Etiquetas legibles para cada acción
const ACTION_LABELS = {
  LOGIN:          "Login",
  PASSWORD_RESET: "Reset password",
  WORKER_CREATED: "Worker creado",
  WORKER_UPDATED: "Worker actualizado",
  WORKER_DELETED: "Worker eliminado",
};

export default function Logs() {
  const [tab, setTab]       = useState("activity"); // "activity" | "stats"

  // Activity logs
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [page, setPage]     = useState(1);
  const limit = 10;

  // Filtros
  const [filters, setFilters] = useState({
    action: "", from: "", to: ""
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  // Stats
  const [stats, setStats]       = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Export
  const [exportFormat, setExportFormat] = useState("excel");
  const [exportType, setExportType]     = useState("activity");

  // ================================
  // Cargar logs
  // ================================
  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLogs({
        ...appliedFilters,
        page,
        limit
      });
      setLogs(data.data || []);
    } catch {
      setError("No se pudieron cargar los logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "activity") fetchLogs();
  }, [tab, appliedFilters, page]);

  // ================================
  // Cargar estadísticas
  // ================================
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await getLogsStats();
      setStats(data);
    } catch {
      setError("No se pudieron cargar las estadísticas");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "stats") fetchStats();
  }, [tab]);

  // ================================
  // Aplicar filtros
  // ================================
  const handleApplyFilters = () => {
    //  Solo enviamos los filtros que tienen valor
    const active = {};
    if (filters.action) active.action = filters.action;
    if (filters.from)   active.from   = filters.from;
    if (filters.to)     active.to     = filters.to;
    setAppliedFilters(active);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ action: "", from: "", to: "" });
    setAppliedFilters({});
    setPage(1);
  };

  const hasActiveFilters = Object.keys(appliedFilters).length > 0;

  // ================================
  // Render
  // ================================
  return (
    <Layout>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs</h1>
          <p className="text-gray-500 text-sm mt-1">
            Auditoría y actividad del sistema
          </p>
        </div>

        {/* Export */}
        <div className="flex items-center gap-2">
          <select
            value={exportType}
            onChange={e => setExportType(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="activity">Activity logs</option>
            <option value="audit">Audit trail</option>
            <option value="users">Usuarios</option>
            <option value="workers">Workers</option>
          </select>
          <select
            value={exportFormat}
            onChange={e => setExportFormat(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
          <button
            onClick={() => exportLogs(
              exportType,
              exportFormat,
              appliedFilters.from,
              appliedFilters.to
            )}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ⬇ Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {[
          { id: "activity", label: "📋 Activity Logs" },
          { id: "stats",    label: "📊 Estadísticas"  }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ================================ */}
      {/* TAB — Activity Logs              */}
      {/* ================================ */}
      {tab === "activity" && (
        <>
          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-36">
                <label className="text-xs text-gray-500 mb-1 block">Acción</label>
                <select
                  value={filters.action}
                  onChange={e => setFilters(p => ({ ...p, action: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {Object.entries(ACTION_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-36">
                <Input
                  label="Desde"
                  type="date"
                  value={filters.from}
                  onChange={e => setFilters(p => ({ ...p, from: e.target.value }))}
                />
              </div>

              <div className="flex-1 min-w-36">
                <Input
                  label="Hasta"
                  type="date"
                  value={filters.to}
                  onChange={e => setFilters(p => ({ ...p, to: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApplyFilters}
                  className="!w-auto px-4"
                >
                  Filtrar
                </Button>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="secondary"
                    className="!w-auto px-4"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Indicador de filtros activos */}
            {hasActiveFilters && (
              <p className="text-xs text-blue-600 mt-2">
                🔍 Filtros activos: {Object.entries(appliedFilters)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")
                }
              </p>
            )}
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Usuario</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Acción</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Recurso</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">IP</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">

                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Sin logs para mostrar
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {log.user_email || `#${log.user_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {log.worker_name
                        ? `${log.resource} — ${log.worker_name}`
                        : log.resource || "–"
                      }
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {log.ip || "–"}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(log.created_at).toLocaleString("es", {
                        day:    "numeric",
                        month:  "short",
                        hour:   "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>

            {/* Paginación */}
            {!loading && logs.length > 0 && (
              <div className="flex justify-between items-center px-6 py-3 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-400">Página {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={logs.length < limit}
                  className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================================ */}
      {/* TAB — Estadísticas               */}
      {/* ================================ */}
      {tab === "stats" && (
        <div className="flex flex-col gap-6">

          {statsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats && (
            <>
              {/* Gráfico por día */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Actividad por día
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.byDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={d => new Date(d).toLocaleDateString("es", {
                        day: "numeric", month: "short"
                      })}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      labelFormatter={d => new Date(d).toLocaleDateString("es", {
                        weekday: "long", day: "numeric", month: "long"
                      })}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Acciones + Usuarios más activos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pie chart de acciones */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Acciones más frecuentes
                  </h2>
                  {stats.actions?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={stats.actions}
                          dataKey="total"
                          nameKey="action"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ action, percent }) =>
                            `${ACTION_LABELS[action] || action} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {stats.actions.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val, name) => [
                            val,
                            ACTION_LABELS[name] || name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-12">
                      Sin datos
                    </p>
                  )}
                </div>

                {/* Usuarios más activos */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Usuarios más activos
                  </h2>
                  {stats.users?.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-100">
                      {stats.users.slice(0, 8).map((u, i) => (
                        <div key={i} className="py-2.5 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {/*  Ranking visual */}
                            <span className={`
                              text-xs font-bold w-5 text-center
                              ${i === 0 ? "text-yellow-500" :
                                i === 1 ? "text-gray-400"  :
                                i === 2 ? "text-orange-400": "text-gray-300"}
                            `}>
                              #{i + 1}
                            </span>
                            <span className="text-sm text-gray-700">
                              {u.email || "Desconocido"}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {u.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-12">
                      Sin datos
                    </p>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      )}

    </Layout>
  );
}
