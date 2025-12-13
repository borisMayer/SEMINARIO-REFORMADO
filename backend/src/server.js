import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();

/* =========================
   CONFIG GENERAL
========================= */
const PORT = process.env.PORT; // 🔥 OBLIGATORIO EN RAILWAY
const HOST = '0.0.0.0';

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

/* =========================
   DATABASE (NEON)
========================= */
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

/* =========================
   ROUTES
========================= */
app.get('/', (req, res) => {
  res.send('🚀 Seminario Reformado API OK');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, db: 'error' });
  }
});

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

/* =========================
   START SERVER
========================= */
if (!PORT) {
  console.error('❌ PORT no definido. Railway no inyectó el puerto.');
  process.exit(1);
}

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend escuchando en ${HOST}:${PORT}`);
});
