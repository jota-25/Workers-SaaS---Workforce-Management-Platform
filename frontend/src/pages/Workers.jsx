import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker
} from "../services/workers.service";

//  Formulario vacío reutilizable — para crear y resetear
const EMPTY_FORM = { name: "", email: "", position: "" };

export default function Workers() {
  const [workers, setWorkers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Búsqueda y paginación
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const limit = 8;

  // Modal
  const [modal, setModal]         = useState(null); // null | "create" | "edit"
  const [selected, setSelected]   = useState(null); // worker seleccionado para editar

  // Formulario dentro del modal
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]       = useState(false);
  const [serverError, setServerError] = useState("");

  // ================================
  // Cargar workers
  // ================================
  const fetchWorkers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWorkers({ name: search, page, limit });
      setWorkers(data);
    } catch {
      setError("No se pudieron cargar los workers");
    } finally {
      setLoading(false);
    }
  };

  //  Se recarga cuando cambia la búsqueda o la página
  useEffect(() => {
    fetchWorkers();
  }, [search, page]);

  // ================================
  // Manejo del formulario
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormErrors(prev => ({ ...prev, [name]: "" }));
    setServerError("");
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim())     errors.name = "El nombre es requerido";
    if (!form.email.trim())    errors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                               errors.email = "Email inválido";
    if (!form.position.trim()) errors.position = "El cargo es requerido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ================================
  // Abrir modales
  // ================================
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setServerError("");
    setModal("create");
  };

  const openEdit = (worker) => {
    setSelected(worker);
    setForm({
      name:     worker.name,
      email:    worker.email,
      position: worker.position
    });
    setFormErrors({});
    setServerError("");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  // ================================
  // Crear worker
  // ================================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await createWorker(form);
      closeModal();
      fetchWorkers(); //  recargamos la lista
    } catch (error) {
      const msg = error.response?.data?.message;
      setServerError(msg || "Error al crear el worker");
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // Editar worker
  // ================================
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await updateWorker(selected.id, form);
      closeModal();
      fetchWorkers();
    } catch (error) {
      const msg = error.response?.data?.message;
      setServerError(msg || "Error al actualizar el worker");
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // Desactivar worker
  // ================================
  const handleDelete = async (worker) => {
    //  Confirmación antes de desactivar
    const ok = window.confirm(
      `¿Desactivar a ${worker.name}? Podrá reactivarse después.`
    );
    if (!ok) return;

    try {
      await deleteWorker(worker.id);
      fetchWorkers();
    } catch {
      alert("Error al desactivar el worker");
    }
  };

  // ================================
  // Render
  // ================================
  return (
    <Layout>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona el equipo de trabajo
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="!w-auto px-5"
        >
          + Nuevo worker
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); //  al buscar volvemos a la página 1
          }}
        />
      </div>

      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Nombre</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Cargo</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Estado</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">

            {loading ? (
              //  Skeleton rows mientras carga
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : workers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  {search ? "Sin resultados para tu búsqueda" : "No hay workers todavía"}
                </td>
              </tr>
            ) : (
              workers.map(worker => (
                <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {worker.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{worker.email}</td>
                  <td className="px-6 py-4 text-gray-500">{worker.position}</td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${worker.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }
                    `}>
                      {worker.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(worker)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Editar
                      </button>
                      {worker.is_active && (
                        <button
                          onClick={() => handleDelete(worker)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>

        {/* Paginación */}
        {!loading && workers.length > 0 && (
          <div className="flex justify-between items-center px-6 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
            >
              ← Anterior
            </button>
            <span className="text-sm text-gray-400">Página {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={workers.length < limit}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal Crear */}
      {modal === "create" && (
        <Modal title="Nuevo worker" onClose={closeModal}>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Nombre"
              name="name"
              placeholder="Juan López"
              value={form.name}
              onChange={handleChange}
              error={formErrors.name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="juan@empresa.com"
              value={form.email}
              onChange={handleChange}
              error={formErrors.email}
            />
            <Input
              label="Cargo"
              name="position"
              placeholder="Supervisor"
              value={form.position}
              onChange={handleChange}
              error={formErrors.position}
            />
            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}
            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Crear worker
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {modal === "edit" && (
        <Modal title="Editar worker" onClose={closeModal}>
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <Input
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={formErrors.name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={formErrors.email}
            />
            <Input
              label="Cargo"
              name="position"
              value={form.position}
              onChange={handleChange}
              error={formErrors.position}
            />
            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}
            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </Layout>
  );
}
