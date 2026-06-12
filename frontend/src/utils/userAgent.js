//  Detecta el navegador desde el user agent string
export const parseBrowser = (ua = "") => {
  if (!ua || ua === "unknown") return "Navegador desconocido";
  if (ua.includes("Edg"))     return "Edge";
  if (ua.includes("Chrome"))  return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari"))  return "Safari";
  if (ua.includes("Opera"))   return "Opera";
  return "Navegador desconocido";
};

//  Detecta el sistema operativo
export const parseOS = (ua = "") => {
  if (!ua || ua === "unknown") return "SO desconocido";
  if (ua.includes("Windows"))  return "Windows";
  if (ua.includes("Mac"))      return "macOS";
  if (ua.includes("iPhone"))   return "iPhone";
  if (ua.includes("Android"))  return "Android";
  if (ua.includes("Linux"))    return "Linux";
  return "SO desconocido";
};

//  Devuelve un ícono según el dispositivo
export const getDeviceIcon = (ua = "") => {
  if (ua.includes("iPhone") || ua.includes("Android")) return "📱";
  if (ua.includes("iPad"))                              return "📱";
  return "💻";
};

//  Formatea tiempo relativo: "hace 2 horas", "hace 3 días"
export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  < 1)   return "ahora mismo";
  if (mins  < 60)  return `hace ${mins} min`;
  if (hours < 24)  return `hace ${hours}h`;
  if (days  < 30)  return `hace ${days} días`;
  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric", month: "short"
  });
};