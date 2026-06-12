import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import {
  getUsers,
  updateMyProfile,
  changePassword,
  adminResetPassword,
  deactivateUser
} from "../services/users.service";

// Colores por rol
const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700",
  owner:       "bg-blue-100 text-blue-700",
  hr:          "bg-green-100 text-green-700",
  security:    "bg-yellow-100 text-yellow-700",
  manager:     "bg-orange-100 text-orange-700",
  worker:      "bg-gray-100 text-gray-600"
};

export default function Users() {
  const { user: me } = useAuth(); // usuario logueado

  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  // Modales
  const [modal, setModal]   = useState(null); // "profile" | "password" | "reset" | null
  const [selected, setSelected] = useState(null);

  // Formularios
  const [profileForm, setProfileForm] = useState({ nickname: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  });
  const [resetForm, setResetForm] = useState({ newPassword: "" });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]         = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg]   = useState("");

  // ================================
  // Cargar usuarios
  // ================================
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);

      //  Pre-llenamos el form de perfil con los datos actuales
      const myData = data.find(u => u.id === me?.id);
      if (myData) {
        setProfileForm({
          nickname: myData.nickname || "",
          email:    myData.email    || ""
        });
      }
    } catch {
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================================
  // Helpers
  // ================================
  const clearModal = () => {
    setModal(null);
    setSelected(null);
    setFormErrors({});
    setServerError("");
    setSuccessMsg("");
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ================================
  // Actualizar mi perfil
  // ================================
  const validateProfile = () => {
    const errors = {};
    if (!profileForm.nickname.trim())
      errors.nickname = "El nickname es requerido";
    if (!profileForm.email.trim())
      errors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email))
      errors.email = "Email inválido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setSaving(true);
    try {
      await updateMyProfile(profileForm);
      clearModal();
      showSuccess("Perfil actualizado correctamente");
      fetchUsers();
    } catch (error) {
      setServerError(error.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // Cambiar mi contraseña
  // ================================
  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword)
      errors.currentPassword = "Ingresa tu contraseña actual";
    if (!passwordForm.newPassword)
      errors.newPassword = "Ingresa la nueva contraseña";
    else if (passwordForm.newPassword.length < 6)
      errors.newPassword = "Mínimo 6 caracteres";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = "Las contraseñas no coinciden";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSaving(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword
      });
      clearModal();
      showSuccess("Contraseña actualizada correctamente");
    } catch (error) {
      const msg = error.response?.data?.message;
      if (msg === "Incorrect password") {
        setFormErrors({ currentPassword: "Contraseña actual incorrecta" });
      } else {
        setServerError(msg || "Error al cambiar contraseña");
      }
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // Admin — resetear contraseña
  // ================================
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetForm.newPassword || resetForm.newPassword.length < 6) {
      setFormErrors({ newPassword: "Mínimo 6 caracteres" });
      return;
    }

    setSaving(true);
    try {
      await adminResetPassword(selected.id, resetForm.newPassword);
      clearModal();
      showSuccess(`Contraseña de ${selected.email} reseteada`);
    } catch (error) {
      setServerError(error.response?.data?.message || "Error al resetear");
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // Admin — desactivar usuario
  // ================================
  const handleDeactivate = async (user) => {
    const ok = window.confirm(
      `¿Desactivar a ${user.email}? No podrá iniciar sesión.`
    );
    if (!ok) return;

    try {
      await deactivateUser(user.id);
      showSuccess(`Usuario ${user.email} desactivado`);
      fetchUsers();
    } catch {
      alert("Error al desactivar usuario");
    }
  };

  // ================================
  // Render
  // ================================
  return (
    <Layout>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona tu perfil y los usuarios del sistema
        </p>
      </div>

      {/* Mensaje de éxito global */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-green-700">✅ {successMsg}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ================================ */}
      {/* Mi perfil                        */}
      {/* ================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Mi perfil</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Info actual */}
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">
              {profileForm.email || "–"}
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Nickname</p>
            <p className="text-sm font-medium text-gray-900">
              {profileForm.nickname || "–"}
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm text-gray-500">Rol</p>
            <p className="text-sm font-medium text-gray-900">
              {users.find(u => u.id === me?.id)?.role || "–"}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setModal("profile")}
            className="text-sm text-blue-600 hover:underline"
          >
            Editar perfil
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setModal("password")}
            className="text-sm text-blue-600 hover:underline"
          >
            Cambiar contraseña
          </button>
        </div>
      </div>

      {/* ================================ */}
      {/* Tabla de usuarios (solo admin)   */}
      {/* ================================ */}
      {me?.level >= 50 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Todos los usuarios
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Nickname</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Rol</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Estado</th>
                {me?.level >= 70 && (
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">

              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map(user => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 transition-colors
                    ${user.id === me?.id ? "bg-blue-50/40" : ""}
                  `}
                >
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {user.email}
                    {/* Indicador visual de "tú mismo" */}
                    {user.id === me?.id && (
                      <span className="ml-2 text-xs text-blue-500">(tú)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.nickname || "–"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-600"}
                    `}>
                      {user.role || "–"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }
                    `}>
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Acciones — solo para admins y no sobre sí mismo */}
                  {me?.level >= 70 && (
                    <td className="px-6 py-4">
                      {user.id !== me?.id && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelected(user);
                              setResetForm({ newPassword: "" });
                              setFormErrors({});
                              setServerError("");
                              setModal("reset");
                            }}
                            className="text-yellow-600 hover:underline text-sm"
                          >
                            Reset pass
                          </button>
                          {user.is_active && me?.level >= 90 && (
                            <button
                              onClick={() => handleDeactivate(user)}
                              className="text-red-500 hover:underline text-sm"
                            >
                              Desactivar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}

      {/* ================================ */}
      {/* Modal — Editar perfil            */}
      {/* ================================ */}
      {modal === "profile" && (
        <Modal title="Editar mi perfil" onClose={clearModal}>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <Input
              label="Nickname"
              name="nickname"
              placeholder="juan123"
              value={profileForm.nickname}
              onChange={e => {
                setFormErrors(p => ({ ...p, nickname: "" }));
                setProfileForm(p => ({ ...p, nickname: e.target.value }));
              }}
              error={formErrors.nickname}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={e => {
                setFormErrors(p => ({ ...p, email: "" }));
                setProfileForm(p => ({ ...p, email: e.target.value }));
              }}
              error={formErrors.email}
            />
            <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
              ⚠️ Si cambias el email deberás verificarlo de nuevo
            </p>
            {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            <div className="flex gap-3 mt-1">
              <Button type="button" variant="secondary" onClick={clearModal}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================================ */}
      {/* Modal — Cambiar contraseña       */}
      {/* ================================ */}
      {modal === "password" && (
        <Modal title="Cambiar contraseña" onClose={clearModal}>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <Input
              label="Contraseña actual"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={e => {
                setFormErrors(p => ({ ...p, currentPassword: "" }));
                setPasswordForm(p => ({ ...p, currentPassword: e.target.value }));
              }}
              error={formErrors.currentPassword}
            />
            <Input
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              value={passwordForm.newPassword}
              onChange={e => {
                setFormErrors(p => ({ ...p, newPassword: "" }));
                setPasswordForm(p => ({ ...p, newPassword: e.target.value }));
              }}
              error={formErrors.newPassword}
            />
            <Input
              label="Confirmar nueva contraseña"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={e => {
                setFormErrors(p => ({ ...p, confirmPassword: "" }));
                setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }));
              }}
              error={formErrors.confirmPassword}
            />
            {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            <div className="flex gap-3 mt-1">
              <Button type="button" variant="secondary" onClick={clearModal}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================================ */}
      {/* Modal — Admin reset password     */}
      {/* ================================ */}
      {modal === "reset" && (
        <Modal
          title={`Resetear contraseña`}
          onClose={clearModal}
        >
          <p className="text-sm text-gray-500 mb-4">
            Reseteando contraseña de{" "}
            <span className="font-medium text-gray-900">{selected?.email}</span>.
            El usuario deberá cambiarla al iniciar sesión.
          </p>
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
            <Input
              label="Nueva contraseña temporal"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              value={resetForm.newPassword}
              onChange={e => {
                setFormErrors(p => ({ ...p, newPassword: "" }));
                setResetForm({ newPassword: e.target.value });
              }}
              error={formErrors.newPassword}
            />
            {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            <div className="flex gap-3 mt-1">
              <Button type="button" variant="secondary" onClick={clearModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="danger" loading={saving}>
                Resetear contraseña
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </Layout>
  );
}