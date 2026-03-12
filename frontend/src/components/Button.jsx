export const Button = ({ children, loading, variant = "primary", ...props }) => {
  const base = "w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <button
      className={`${base} ${variants[variant]}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {/*  Muestra spinner mientras carga */}
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Cargando...
        </span>
      ) : children}
    </button>
  );
};