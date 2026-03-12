// Tarjeta reutilizable para mostrar una métrica
// La usamos para usuarios activos, workers, invitaciones, etc.
export const StatCard = ({ title, value, icon, color = "blue", loading }) => {

  const colors = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red:    "bg-red-50 text-red-600"
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
      
      {/* Ícono */}
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Datos */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>

    </div>
  );
};