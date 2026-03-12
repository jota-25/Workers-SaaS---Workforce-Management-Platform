import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutRequest } from "../services/auth.service";

const navItems = [
  { to: "/dashboard", label: "Dashboard",  icon: "📊", minLevel: 0  },
  { to: "/workers",   label: "Workers",    icon: "👷", minLevel: 50 },
  { to: "/users",     label: "Usuarios",   icon: "👥", minLevel: 50 },
  { to: "/sessions",  label: "Sesiones",   icon: "🔐", minLevel: 0  },
  { to: "/logs",      label: "Logs",       icon: "📋", minLevel: 90 },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await logoutRequest(refreshToken);
    } catch {
      // Si falla el logout en el servidor, igual limpiamos localmente
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold">Workers SaaS</h1>
        <p className="text-xs text-gray-400 mt-1 truncate">{user?.email || "–"}</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems
          //  Solo mostramos las rutas que el usuario tiene permiso de ver
          .filter(item => (user?.level ?? 0) >= item.minLevel)
          .map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                transition-colors duration-150
                ${isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))
        }
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>

    </aside>
  );
};