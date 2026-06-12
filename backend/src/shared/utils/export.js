//  No necesitas instalar nada — construimos CSV manualmente
// Es importante entender cómo funciona antes de usar librerías

export const generateCSV = (columns, rows) => {
  // columns = ["ID", "Usuario", "Acción"]
  // rows = [{ id: 1, user: "juan@...", action: "LOGIN" }, ...]

  // Primera línea: los headers
  const header = columns.map(col => col.label).join(",");

  // Resto de líneas: los datos
  const body = rows.map(row => {
    return columns.map(col => {
      const value = row[col.key] ?? "";
      //  Si el valor tiene comas o saltos de línea, lo envolvemos en comillas
      // Eso es el estándar CSV (RFC 4180)
      const str = String(value).replace(/"/g, '""');
      return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
    }).join(",");
  });

  return [header, ...body].join("\n");
};