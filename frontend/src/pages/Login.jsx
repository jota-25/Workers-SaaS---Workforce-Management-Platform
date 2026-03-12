import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../services/auth.service";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  //  Estado del formulario
  const [form, setForm] = useState({
    login: "",    // puede ser email o nickname (tu API acepta ambos)
    password: ""
  });

  //  Estado de errores por campo
  const [errors, setErrors] = useState({});

  //  Estado general de la request
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ================================
  // Manejo del formulario
  // ================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limpiamos el error del campo cuando el usuario empieza a escribir
    setErrors(prev => ({ ...prev, [name]: "" }));
    setServerError("");

    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ================================
  // Validación del lado del cliente
  // ================================
  //  Validamos antes de llamar a la API
  // para no gastar requests innecesarias

  const validate = () => {
    const newErrors = {};

    if (!form.login.trim()) {
      newErrors.login = "El email o nickname es requerido";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }

    setErrors(newErrors);

    // Si no hay errores, el objeto está vacío
    return Object.keys(newErrors).length === 0;
  };

  // ================================
  // Submit
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault(); //  Evita que la página se recargue

    if (!validate()) return;

    setLoading(true);

    try {
      const data = await loginRequest(form.login, form.password);

      //  Guardamos los tokens en el contexto (que los mete en localStorage)
      login(data.accessToken, data.refreshToken);

      //  Redirigimos al dashboard
      navigate("/dashboard");

    } catch (error) {
      // Manejamos los errores específicos que puede devolver tu API
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        setServerError("Email o contraseña incorrectos");
      } else if (status === 403 && message === "Verifica tu email primero") {
        setServerError("Debes verificar tu email antes de iniciar sesión");
      } else if (status === 403 && message === "Account disabled") {
        setServerError("Tu cuenta está desactivada. Contacta al administrador");
      } else if (status === 403 && error.response?.data?.forcePasswordChange) {
        //  Tu API devuelve forcePasswordChange: true
        setServerError("Debes cambiar tu contraseña. Revisa tu email");
      } else if (status === 429) {
        setServerError("Demasiados intentos. Espera unos minutos");
      } else {
        setServerError("Error del servidor. Intenta de nuevo");
      }
    } finally {
      //  finally siempre se ejecuta — para o no el loading
      setLoading(false);
    }
  };

  // ================================
  // Render
  // ================================

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Workers SaaS</h1>
          <p className="text-gray-500 text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <Input
              label="Email o nickname"
              name="login"
              type="text"
              placeholder="juan@empresa.com"
              value={form.login}
              onChange={handleChange}
              error={errors.login}
              autoComplete="username"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            {/*  Error del servidor — se muestra debajo del formulario */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}

            <Button type="submit" loading={loading}>
              Iniciar sesión
            </Button>

          </form>

          {/* Link de olvidé contraseña */}
          <div className="text-center mt-4">
            
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
           <a>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Workers SaaS © {new Date().getFullYear()}
        </p>

       </div>
    </div>
  );
}