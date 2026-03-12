import { useState } from "react";
import { Sidebar } from "./Sidebar";

//  Envuelve cualquier página con el Sidebar
// En vez de poner <Sidebar /> en cada página, usamos <Layout>
export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/*  Overlay oscuro — solo en mobile cuando sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/*  Sidebar:
          - Mobile: fixed, fuera de pantalla por defecto, entra con translate
          - Desktop: static, siempre visible */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/*  Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header mobile con botón hamburguesa */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Icono hamburguesa ☰ */}
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-gray-700" />
              <span className="block w-6 h-0.5 bg-gray-700" />
              <span className="block w-6 h-0.5 bg-gray-700" />
            </div>
          </button>
          <span className="font-bold text-gray-900">Workers SaaS</span>
        </header>

        {/* Contenido con scroll */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}