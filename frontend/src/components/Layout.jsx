import { Sidebar } from "./Sidebar";

//  Envuelve cualquier página con el Sidebar
// En vez de poner <Sidebar /> en cada página, usamos <Layout>
export const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};