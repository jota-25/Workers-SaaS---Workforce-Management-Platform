//Un input estilizado con Tailwind que acepta cualquier prop estándar de HTML
// Lo usamos en Login, en formularios de Workers, Users, etc.
export const Input = ({ label, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-white"
          }
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};
