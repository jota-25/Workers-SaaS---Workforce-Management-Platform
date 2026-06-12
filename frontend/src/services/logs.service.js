import api from "../lib/axios";

export const getLogs = async (params = {}) => {
  const res = await api.get("/logs", { params });
  return res.data; // { page, limit, data: [...] }
};

export const getLogsStats = async () => {
  const res = await api.get("/logs/stats");
  return res.data; // { actions, users, byDay }
};

//  Para el export abrimos una URL directa en el navegador
// así el navegador descarga el archivo automáticamente
export const exportLogs = (type, format, from, to) => {
  const params = new URLSearchParams({ type, format });
  if (from) params.append("from", from);
  if (to)   params.append("to", to);

  const token = localStorage.getItem("accessToken");
  const url = `${import.meta.env.VITE_API_URL}/logs/export?${params}`;

  //  Creamos un link temporal con el token en el header
  // no podemos usar axios aquí porque necesitamos descarga directa
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement("a");
      link.href  = URL.createObjectURL(blob);
      link.download = `${type}_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "csv"}`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
};