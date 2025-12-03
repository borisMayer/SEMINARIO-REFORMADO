
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 4000;
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'appuser',
  password: process.env.PGPASSWORD || 'apppass',
  database: process.env.PGDATABASE || 'appdb',
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// --- Recursos ---
app.get('/api/resources', async (req, res) => {
  const { q, area, type, year, tags } = req.query;
  const clauses = [];
  const values = [];
  let idx = 1;
  if (q) { clauses.push("(LOWER(title) LIKE LOWER($"+idx+") OR LOWER(abstract) LIKE LOWER($"+idx+") OR LOWER(array_to_string(authors,' ')) LIKE LOWER($"+idx+") )"); values.push('%'+q+'%'); idx++; }
  if (area) { clauses.push("area = $"+idx); values.push(area); idx++; }
  if (type) { clauses.push("type = $"+idx); values.push(type); idx++; }
  if (year) { clauses.push("year = $"+idx); values.push(Number(year)); idx++; }
  if (tags) { clauses.push("tags @> $"+idx); values.push(String(tags).split(',')); idx++; }
  const sql = `SELECT id, title, authors, area, type, year, abstract, tags, file_url FROM resources ${clauses.length? 'WHERE '+clauses.join(' AND ') : ''} ORDER BY id DESC`;
  try {
    const { rows } = await pool.query(sql, values);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/resources', async (req, res) => {
  const { title, authors, area, type, year, abstract, tags, file_url, license } = req.body;
  if (!title || !authors || !area || !type) return res.status(400).json({ error: 'Campos obligatorios faltantes' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url, license, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
      [title, authors, area, type, year || null, abstract || null, tags || [], file_url || null, license || null, 1]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// --- Cursos ---
app.get('/api/courses', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, term, instructors FROM courses ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/courses/:id/modules', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query('SELECT id, title, ord FROM modules WHERE course_id = $1 ORDER BY ord ASC', [id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/modules/:id/items', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query('SELECT id, type, title, resource_id, due_date FROM items WHERE module_id = $1 ORDER BY id ASC', [id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en :${PORT}`);
});
