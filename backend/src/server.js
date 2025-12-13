
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import pg from "pg";

const { Pool } = pg;
const app = express();

/* =========================
   CONFIG GENERAL
========================= */
const HOST = "0.0.0.0";
// En Railway el PORT viene de env; para local usa 4000 como fallback.
const PORT = Number(process.env.PORT || 4000);

// Variables esperadas (DB + CORS)
const REQUIRED_ENVS = ["PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE", "ALLOWED_ORIGIN"];

// Validación temprana (solo advierte si estamos en local)
const missing = REQUIRED_ENVS.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn(`⚠️ Faltan variables de entorno: ${missing.join(", ")}`);
  console.warn("   Define estas en Railway (producción) o .env (local).");
}

/* =========================
   MIDDLEWARE
========================= */
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json());
app.use(morgan("combined"));

// CORS dinámico desde env (soporta coma para múltiples orígenes)
const allowedOriginEnv = process.env.ALLOWED_ORIGIN || "";
const allowedOrigins = allowedOriginEnv.split(",").map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permite herramientas locales sin origin (curl/postman)
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true); // sin restricción explícita
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origen no permitido → ${origin}`));
  },
  credentials: true,
}));

/* =========================
   DATABASE (Neon / Railway / Render)
========================= */
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  keepAlive: true,
});

pool.on("error", (err) => {
  console.error("❌ Error en pool de Postgres:", err);
});

/* =========================
   ROUTES
========================= */
app.get("/", (req, res) => {
  res.send("🚀 Seminario Reformado API OK");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    console.error("❌ /api/health DB error:", err.message);
    res.status(500).json({ ok: false, db: "error", message: err.message });
  }
});

// Ejemplo de endpoint que usa DB
app.get("/api/cursos", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, nombre
      FROM cursos
      ORDER BY id ASC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/cursos error:", err.message);
    res.status(500).json({ error: "DB query failed" });
  }
});

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, HOST, () => {
  console.log(`✅ Backend escuchando en ${HOST}:${PORT}`);
  if (allowedOrigins.length) {
    console.log("✅ CORS permitido para:", allowedOrigins.join(", "));
  } else {
    console.log("⚠️ CORS: sin ALLOWED_ORIGIN definido, acepta cualquier origen (solo dev).");
  }
});

// Cierre ordenado
const shutdown = async (signal) => {
  console.log(`⏹️ Recibida señal ${signal}. Cerrando pool...`);
  try {
    await pool.end();
    console.log("✅ Pool cerrado correctamente.");
  } catch (e) {
    console.error("❌ Error cerrando pool:", e);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM
