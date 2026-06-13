import express from "express";
import cors from "cors"; // Para permitir peticiones desde el frontend
// import { pool } from "./db.js";  para conectar una base como normalmente se hace con el pool de pg
import {prisma} from "./lib/prisma.js"; // Prisma para consultas a la base de datos CON MIGRACIONES y un ORM más moderno
import authRoutes from "./modules/auth/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import workersRoutes from "./modules/workers/workers.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import dotenv from "dotenv";
import logsRoutes from "./modules/logs/logs.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import seccionRoutes from "./modules/sessions/sessions.routes.js";
import invitationsRoutes from "./modules/invitations/invitations.routes.js";


dotenv.config();

const app = express();

// Si estás detrás de un proxy (como en producción), esto es necesario para que el rate limiter funcione correctamente con la IP del cliente real
app.set("trust proxy", 1);
// Configuración de CORS para permitir peticiones desde el frontend y va antes de cualquier cosa
app.use(cors({
  origin: ["http://localhost:5173", // URL del frontend en desarrollo
    "http://localhost",       // Docker
    "http://localhost:80",     // Docker alternativo 
    "https://workers-saas.vercel.app"       // ← producción (Vercel)
  ],     

  credentials: true                  // permite enviar cookies/headers de auth
}));



// Middlewares globales
app.use(express.json());

// Rutas simples /(genreales  pruebas ,etc)
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.get("/test", (req, res) => {
  res.json({ ok: true });
});

// Rutas de módulos
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/workers", workersRoutes);

app.use("/logs", logsRoutes);
app.use("/users", usersRoutes);
app.use("/sessions", seccionRoutes);
app.use("/invitations", invitationsRoutes);

 // Middleware de manejo de errores (SIEMPRE AL FINAL DE LAS RUTAS)
app.use(errorHandler);

// Test DB
/*app.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});*/
  // el de arriba es de forma tradicional con pool, el de abajo es con prisma
app.get("/test-db", async (req, res) => {
  const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
  res.json(result);
});

// Exportamos el app para usarlo en index.js y también en los tests sin necesidad de levantar el servidor completo
export default app;

