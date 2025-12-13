
import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();

// CORS: ajusta dominios si quieres restringirlos
app.use(cors({
  origin: [
    'https://seminario-reformado-b4b5.vercel.app',
    'https://seminario-reformado-b4b5-krep29byq.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '2mb' }));

// ⚠️ Railway inyecta PORT. Debe usarse process.env.PORT
const PORT = process.env.PORT || 4000;

// Pool PG: soporta DATABASE_URL (Neon/Railway) o variables separadas
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
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
};

const pool = new Pool(poolConfigFromEnv());

// --- Rutas base para probar rápidamente ---
app.get('/', (req, res) => {
  res.send('Seminario Reformado API — OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
});

// --- Salud con DB ---
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

  if (q) {
    clauses.push(
      `(LOWER(title) LIKE LOWER($${idx}) OR ` +
      `LOWER(abstract) LIKE LOWER($${idx}) OR ` +
      `LOWER(array_to_string(authors,' ')) LIKE LOWER($${idx}))`
    );
    values.push(`%${q}%`);
    idx++;
  }
  if (area) { clauses.push(`area = $${idx}`); values.push(area); idx++; }
  if (type) { clauses.push(`type = $${idx}`); values.push(type); idx++; }
  if (year) { clauses.push(`year = $${idx}`); values.push(Number(year)); idx++; }

  // tags puede venir como "t1,t2" o como array; lo casteamos a text[]
  if (tags) {
    const arr = Array.isArray(tags)
      ? tags
      : String(tags).split(',').map(t => t.trim()).filter(Boolean);
    clauses.push(`tags @> $${idx}::text[]`);
    values.push(arr);
    idx++;
  }

  const sql = `
    SELECT id, title, authors, area, type, year, abstract, tags, file_url
    FROM resources
    ${clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''}
    ORDER BY id DESC
  `;

  try {
    const { rows } = await pool.query(sql, values);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/resources', async (req, res) => {
  const { title, authors, area, type, year, abstract, tags, file_url, license } = req.body;

  if (!title || !authors || !area || !type) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });
  }

  const authorsArr = Array.isArray(authors)
    ? authors
    : String(authors).split(',').map(s => s.trim()).filter(Boolean);

  const tagsArr = Array.isArray(tags)
    ? tags
    : (tags ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : []);

  try {
    const { rows } = await pool.query(
      `INSERT INTO resources
       (title, authors, area, type, year, abstract, tags, file_url, license, created_by)
       VALUES ($1, $2::text[], $3, $4, $5, $6, $7::text[], $8, $9, $10)
       RETURNING id`,
      [
        title,
        authorsArr,
        area,
        type,
        year ? Number(year) : null,
        abstract || null,
        tagsArr,
        file_url || null,
        license || null,
        1, // TODO: reemplazar con usuario autenticado cuando corresponda
      ]
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
    const { rows } = await pool.query(
      'SELECT id, title, ord FROM modules WHERE course_id = $1 ORDER BY ord ASC',
      [id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/modules/:id/items', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      'SELECT id, type, title, resource_id, due_date FROM items WHERE module_id = $1 ORDER BY id ASC',
      [id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// 404 controlado
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({ error: 'Error interno' });
});

// Robustez ante rechazos no manejados
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UncaughtException:', err);
});

app.listen(PORT, () => {
   console.log(`Backend escuchando en :${PORT}`);
