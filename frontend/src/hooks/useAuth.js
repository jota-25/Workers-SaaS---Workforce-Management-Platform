import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Un hook personalizado para no tener que importar
// useContext + AuthContext en cada componente
// Solo importas useAuth y ya tienes todo
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};