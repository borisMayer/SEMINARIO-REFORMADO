import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();

/* =========================
   CONFIG
========================= */
const PORT = Number(process.env.PORT || 4000);
const HOST = '0.0.0.0';

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: [
    'https://seminario-reformado-b4b5.vercel.app',
    'https://seminario-reformado-b4b5-krep29byq.vercel.app',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

/* =========================
   DATABASE
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
});

/* =========================
   HEALTH
========================= */
app.get('/', (_, res) => {
  res.send('Seminario Reformado API — OK');
});

app.get('/health', (_, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get('/api/health', async (_, res) => {
  try {
