import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

//  Interceptor de REQUEST
// Se ejecuta antes de cada request — agrega el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  Interceptor de RESPONSE
// Se ejecuta después de cada respuesta — maneja tokens expirados
api.interceptors.response.use(
  (response) => response, // si todo va bien, devuelve la respuesta

  async (error) => {
    const original = error.config;

    // Si el error es 401 (token expirado) y no es un retry
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true; // marcamos para no entrar en loop infinito

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        //  Guardamos los nuevos tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        //  Reintentamos la request original con el nuevo token
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);

      } catch {
        // Si el refresh falla, cerramos sesión
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;