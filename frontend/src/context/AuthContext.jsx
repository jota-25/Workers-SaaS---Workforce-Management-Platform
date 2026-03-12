import { createContext, useState, useEffect } from "react";

//  Creamos el contexto — es el "canal" por donde fluye el estado global
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // datos del usuario
  const [loading, setLoading] = useState(true); // mientras verificamos si hay sesión

  useEffect(() => {
    // Al arrancar la app, verificamos si ya hay tokens guardados
    const token = localStorage.getItem("accessToken");

    if (token) {
      // Decodificamos el JWT para obtener los datos del usuario
      // sin llamar a la API — el payload del JWT ya tiene id, level, roleId
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      } catch {
        // Si el token está corrupto, lo eliminamos
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }

    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};