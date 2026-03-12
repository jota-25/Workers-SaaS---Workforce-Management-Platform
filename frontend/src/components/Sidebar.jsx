import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutRequest } from "../services/auth.service";

const navItems = [
  { to: "/dashboard", label: "Dashboard",  icon: "📊", minLevel: 0  },
  { to: "/workers",   label: "Workers",    icon: "👷", minLevel: 50 },
  { to: "/users",     label: "Usuarios",   icon: "👥", minLevel: 50 },
  { to: "/sessions",  label: "Sesiones",   icon: "🔐", minLevel: 0  },
  { to: "/logs",      label: "Logs",       icon: "📋", minLevel: 90 },
  { to: "/invitations", label: "Invitaciones", icon: "✉️", minLevel: 70 },
];

export const Sidebar = ({ onClose }) => {
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
      
      {/* Header del sidebar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
        <span className="font-bold text-lg">Workers SaaS</span>

        {/* ✅ Botón cerrar — solo visible en mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded hover:bg-gray-700 transition-colors"
        >
          <span className="text-gray-400 text-xl leading-none">✕</span>
        </button>
      </div>

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
               onClick={onClose}  // Cerramos el sidebar al hacer click (en mobile)
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

      {/* Footer con logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
                     text-gray-400 hover:bg-gray-800 hover:text-white
                     transition-colors text-sm font-medium"
        >
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>

    </aside>
  );
};