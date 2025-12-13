import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();

/* ======================
   CONFIG
====================== */
const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

/* ======================
   DATABASE
====================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});

/* ======================
   ROUTES
====================== */
app.get('/', (req, res) => {
  res.send('API OK');
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
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

/* ======================
   404
====================== */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/* ======================
   START
====================== */
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});
