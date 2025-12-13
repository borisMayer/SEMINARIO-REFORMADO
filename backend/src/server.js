import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();

/* =========================
   CORS
========================= */
app.use(cors({
  origin: [
    'https://seminario-reformado-b4b5.vercel.app',
    'https://seminario-reformado-b4b5-krep29byq.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '2mb' }));

/* =========================
   PORT
========================= */
// Railway inyecta PORT, local usa 4000
const PORT = process.env.PORT || 4000;

/* =========================
   PostgreSQL Pool
========================= */
const poolConfigFromEnv = () => {
  const url = process.env.DATABASE_URL;

  if (url) {
    return {
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'appuser',
    password: process.env.PGPASSWORD || 'apppass',
    database: process.env.PGDATABASE || 'appdb',
    ssl: process.env.PGSSLMODE === 'require'
      ? { rejectUnauthorized: false }
      : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
};

const pool = new Pool(poolConfigFromEnv());

/* =========================
   RUTAS BASE
========================= */
app.get('/', (req, res) => {
  res.send('Seminario Reformado API — OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/* =========================
   RESOURCES
========================= */
app.get('/api/resources', async (req, res) => {
  const { q, area, type, year, tags } = req.query;

  const clauses = [];
  const va
