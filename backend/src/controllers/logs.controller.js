import { pool } from "../db.js";
import ExcelJS from "exceljs";
import { generateCSV } from "../utils/export.js";

// guardar actividaes
export const getLogs = async (req, res, next) => {
  try {
    const {
      userId,
      action,
      worker,
      from,
      to,
      page = 1,
      limit = 10
    } = req.query;

    let query = `
      SELECT 
        l.*,
        u.email AS user_email,
        w.name AS worker_name
      FROM activity_logs l
      LEFT JOIN users u ON u.id = l.user_id
      LEFT JOIN workers w ON w.id = l.resource_id
      WHERE 1=1
    `;

    const values = [];
    let count = 1;

    if (userId) {
      query += ` AND l.user_id = $${count++}`;
      values.push(userId);
    }

    if (action) {
      query += ` AND l.action = $${count++}`;
      values.push(action);
    }

    if (worker) {
      query += ` AND l.resource_id = $${count++}`;
      values.push(worker);
    }

    if (from) {
      query += ` AND l.created_at >= $${count++}`;
      values.push(from);
    }

    if (to) {
      query += ` AND l.created_at <= $${count++}`;
      values.push(to);
    }

    query += `
      ORDER BY l.created_at DESC
      LIMIT $${count++}
      OFFSET $${count}
    `;

    values.push(limit, (page - 1) * limit);

    const result = await pool.query(query, values);

    res.json({
      page: Number(page),
      limit: Number(limit),
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};


// exportar a excel  o scv 


  // ================================
  // EXPORT — endpoint principal
  // ================================
  export const exportData = async (req, res, next) => {
    try {
      const { 
        type = "activity",  // activity | audit | users | workers
        format = "excel",   // excel | csv
        from,               // fecha inicio (opcional)
        to                  // fecha fin (opcional)
      } = req.query;

      //  Según el tipo, definimos la query y las columnas
      const config = getExportConfig(type);

      if (!config) {
        return res.status(400).json({ 
          message: "Tipo inválido. Usa: activity, audit, users, workers" 
        });
      }

      //  Aplicamos filtros de fecha si los hay
      let query = config.query;
      const values = [];
      let count = 1;

      if (from) {
        query += ` AND ${config.dateColumn} >= $${count++}`;
        values.push(from);
      }

      if (to) {
        query += ` AND ${config.dateColumn} <= $${count++}`;
        values.push(to);
      }

      query += ` ORDER BY ${config.dateColumn} DESC`;

      const result = await pool.query(query, values);
      const rows = result.rows;

      //  Según el formato, generamos el archivo
      if (format === "csv") {
        return sendCSV(res, config, rows);
      }

      return await sendExcel(res, config, rows);

    } catch (error) {
      next(error);
    }
  };


  // ================================
  // Configuración por tipo de export
  // ================================
  const getExportConfig = (type) => {
    const configs = {

      activity: {
        query: `
          SELECT 
            a.id,
            u.email AS usuario,
            a.action AS accion,
            a.resource AS recurso,
            a.ip,
            a.created_at AS fecha
          FROM activity_logs a
          LEFT JOIN users u ON u.id = a.user_id
          WHERE 1=1
        `,
        dateColumn: "a.created_at",
        filename: "activity_logs",
        sheetName: "Activity Logs",
        columns: [
          { label: "ID",       key: "id" },
          { label: "Usuario",  key: "usuario" },
          { label: "Acción",   key: "accion" },
          { label: "Recurso",  key: "recurso" },
          { label: "IP",       key: "ip" },
          { label: "Fecha",    key: "fecha" }
        ]
      },

      audit: {
        query: `
          SELECT
            a.id,
            u.email AS usuario,
            a.action AS accion,
            a.resource AS recurso,
            a.resource_id AS recurso_id,
            a.before_data AS antes,
            a.after_data AS despues,
            a.created_at AS fecha
          FROM audit_trail a
          LEFT JOIN users u ON u.id = a.user_id
          WHERE 1=1
        `,
        dateColumn: "a.created_at",
        filename: "audit_trail",
        sheetName: "Audit Trail",
        columns: [
          { label: "ID",         key: "id" },
          { label: "Usuario",    key: "usuario" },
          { label: "Acción",     key: "accion" },
          { label: "Recurso",    key: "recurso" },
          { label: "Recurso ID", key: "recurso_id" },
          { label: "Antes",      key: "antes" },
          { label: "Después",    key: "despues" },
          { label: "Fecha",      key: "fecha" }
        ]
      },

      users: {
        query: `
          SELECT
            u.id,
            u.email,
            u.nickname,
            r.name AS rol,
            u.is_active AS activo,
            u.is_verified AS verificado,
            u.created_at AS fecha_registro
          FROM users u
          LEFT JOIN roles r ON r.id = u.role_id
          WHERE 1=1
        `,
        dateColumn: "u.created_at",
        filename: "users",
        sheetName: "Usuarios",
        columns: [
          { label: "ID",              key: "id" },
          { label: "Email",           key: "email" },
          { label: "Nickname",        key: "nickname" },
          { label: "Rol",             key: "rol" },
          { label: "Activo",          key: "activo" },
          { label: "Verificado",      key: "verificado" },
          { label: "Fecha Registro",  key: "fecha_registro" }
        ]
      },

      workers: {
        query: `
          SELECT
            w.id,
            w.name AS nombre,
            w.email,
            w.position AS cargo,
            w.is_active AS activo,
            u.email AS usuario_vinculado,
            w.created_at AS fecha_registro
          FROM workers w
          LEFT JOIN users u ON u.id = w.user_id
          WHERE 1=1
        `,
        dateColumn: "w.created_at",
        filename: "workers",
        sheetName: "Workers",
        columns: [
          { label: "ID",               key: "id" },
          { label: "Nombre",           key: "nombre" },
          { label: "Email",            key: "email" },
          { label: "Cargo",            key: "cargo" },
          { label: "Activo",           key: "activo" },
          { label: "Usuario Vinculado",key: "usuario_vinculado" },
          { label: "Fecha Registro",   key: "fecha_registro" }
        ]
      }

    };

    return configs[type] || null;
  };


  // ================================
  // Generar y enviar CSV
  // ================================
  const sendCSV = (res, config, rows) => {
    const csv = generateCSV(config.columns, rows);

    //  Headers HTTP para que el navegador descargue el archivo
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${config.filename}_${today()}.csv`
    );

    //  BOM para que Excel abra el CSV con tildes correctamente
    res.send("\uFEFF" + csv);
  };


  // ================================
  // Generar y enviar Excel
  // ================================
  const sendExcel = async (res, config, rows) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(config.sheetName);

    // Columnas con ancho automático
    sheet.columns = config.columns.map(col => ({
      header: col.label,
      key: col.key,
      width: Math.max(col.label.length + 5, 15)
    }));

    //  Estilo del header
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F2937" } // gris oscuro
      };
    });

    //  Agregar filas — los campos JSONB los convertimos a string legible
    rows.forEach(row => {
      const formatted = {};
      config.columns.forEach(col => {
        const val = row[col.key];
        // Si es un objeto (como before_data/after_data), lo convertimos a JSON string
        formatted[col.key] = typeof val === "object" && val !== null
          ? JSON.stringify(val)
          : val;
      });
      sheet.addRow(formatted);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${config.filename}_${today()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  };


  // ================================
  // Helper — fecha de hoy para el nombre del archivo
  // ================================
  const today = () => new Date().toISOString().split("T")[0]; // "2024-03-11"

// ================================
// fin del export en el excel o csv
// ================================

//  esto son las graficas de las actvidades que se registran

export const getLogsStats = async (req, res, next) => {
  try {
    const actions = await pool.query(`
      SELECT action, COUNT(*) AS total
      FROM activity_logs
      GROUP BY action
      ORDER BY total DESC
    `);

    const users = await pool.query(`
      SELECT u.email, COUNT(*) AS total
      FROM activity_logs l
      LEFT JOIN users u ON u.id = l.user_id
      GROUP BY u.email
      ORDER BY total DESC
    `);

    const byDay = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total
      FROM activity_logs
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      actions: actions.rows,
      users: users.rows,
      byDay: byDay.rows
    });
  } catch (error) {
    next(error);
  }
};
