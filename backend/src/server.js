import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();

/* =========================
   CONFIG GENERAL
========================= */
const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'https://seminario-reformado-b4b5-krep29ybq.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

/* =========================
   DATABASE CONFIG
========================= */
const dbConfig = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'neondb',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const requiredEnvVars = ['PGHOST', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
  process.exit(1);
}

const pool = new Pool(dbConfig);

console.log('🔍 Configuración de Base de Datos:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a Neon PostgreSQL:');
    console.error('   Message:', err.message);
  } else {
    console.log('✅ Conectado exitosamente a Neon PostgreSQL');
    release();
  }
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool:', err);
});

/* =========================
   INICIALIZAR TABLAS
========================= */
async function initializeTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        authors TEXT[] NOT NULL,
        area VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        year VARCHAR(4) NOT NULL,
        abstract TEXT,
        tags TEXT[],
        file_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(300) NOT NULL,
        term VARCHAR(50) NOT NULL,
        instructors TEXT[] NOT NULL,
        description TEXT,
        zoom_link TEXT,
        youtube_playlist TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(300) NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(300) NOT NULL,
        content_url TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS library (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, resource_id)
      );
    `);

    console.log('✅ Tablas inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error inicializando tablas:', error);
  }
}

initializeTables();

/* =========================
   ROUTES - BÁSICAS
========================= */
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 Seminario Reformado API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      resources: '/api/resources',
      courses: '/api/courses',
      library: '/api/library/:userId'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'backend',
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as timestamp');
    res.json({ 
      ok: true, 
      db: 'connected',
      timestamp: result.rows[0].timestamp
    });
  } catch (err) {
    res.status(500).json({ 
      ok: false, 
      db: 'error',
      message: err.message
    });
  }
});

/* =========================
   ROUTES - RECURSOS
========================= */
// GET /api/resources - Listar con filtros
app.get('/api/resources', async (req, res) => {
  try {
    const { q, area, type, year, tags } = req.query;
    
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (title ILIKE $${paramIndex} OR abstract ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (area) {
      query += ` AND area = $${paramIndex}`;
      params.push(area);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (year) {
      query += ` AND year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (tags) {
      query += ` AND tags && $${paramIndex}`;
      params.push(tags.split(','));
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Error al obtener recursos' });
  }
});

// POST /api/resources - Crear recurso
app.post('/api/resources', async (req, res) => {
  try {
    const { title, authors, area, type, year, abstract, tags, file_url } = req.body;
    
    const result = await pool.query(
      `INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, authors, area, type, year, abstract || '', tags || [], file_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Error al crear recurso' });
  }
});

// PUT /api/resources/:id - Actualizar recurso
app.put('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, authors, area, type, year, abstract, tags, file_url } = req.body;
    
    const result = await pool.query(
      `UPDATE resources SET 
        title = COALESCE($1, title),
        authors = COALESCE($2, authors),
        area = COALESCE($3, area),
        type = COALESCE($4, type),
        year = COALESCE($5, year),
        abstract = COALESCE($6, abstract),
        tags = COALESCE($7, tags),
        file_url = COALESCE($8, file_url)
       WHERE id = $9 RETURNING *`,
      [title, authors, area, type, year, abstract, tags, file_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Error al actualizar recurso' });
  }
});

// DELETE /api/resources/:id - Eliminar recurso
app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);
    res.json({ message: 'Recurso eliminado' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Error al eliminar recurso' });
  }
});

/* =========================
   ROUTES - CURSOS
========================= */
// GET /api/courses - Listar cursos
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
});

// POST /api/courses - Crear curso
app.post('/api/courses', async (req, res) => {
  try {
    const { name, term, instructors, description, zoom_link, youtube_playlist } = req.body;
    
    const result = await pool.query(
      `INSERT INTO courses (name, term, instructors, description, zoom_link, youtube_playlist) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, term, instructors, description || '', zoom_link || null, youtube_playlist || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error al crear curso' });
  }
});

// GET /api/courses/:id/modules - Listar módulos de un curso
app.get('/api/courses/:courseId/modules', async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index',
      [courseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Error al obtener módulos' });
  }
});

// POST /api/modules - Crear módulo
app.post('/api/modules', async (req, res) => {
  try {
    const { course_id, title, order_index } = req.body;
    
    const result = await pool.query(
      'INSERT INTO modules (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING *',
      [course_id, title, order_index]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Error al crear módulo' });
  }
});

// GET /api/modules/:moduleId/items - Listar items de un módulo
app.get('/api/modules/:moduleId/items', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await pool.query(
      'SELECT * FROM items WHERE module_id = $1 ORDER BY order_index',
      [moduleId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Error al obtener items' });
  }
});

// POST /api/items - Crear item
app.post('/api/items', async (req, res) => {
  try {
    const { module_id, type, title, content_url, order_index } = req.body;
    
    const result = await pool.query(
      'INSERT INTO items (module_id, type, title, content_url, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [module_id, type, title, content_url || null, order_index]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Error al crear item' });
  }
});

/* =========================
   ROUTES - BIBLIOTECA
========================= */
// GET /api/library/:userId - Obtener biblioteca del usuario
app.get('/api/library/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT r.* FROM resources r 
       JOIN library l ON r.id = l.resource_id 
       WHERE l.user_id = $1 
       ORDER BY l.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ error: 'Error al obtener biblioteca' });
  }
});

// POST /api/library - Guardar en biblioteca
app.post('/api/library', async (req, res) => {
  try {
    const { user_id, resource_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO library (user_id, resource_id) VALUES ($1, $2) ON CONFLICT (user_id, resource_id) DO NOTHING RETURNING *',
      [user_id, resource_id]
    );
    
    res.status(201).json(result.rows[0] || { message: 'Ya existe en biblioteca' });
  } catch (error) {
    console.error('Error saving to library:', error);
    res.status(500).json({ error: 'Error al guardar en biblioteca' });
  }
});

// DELETE /api/library/:userId/:resourceId - Eliminar de biblioteca
app.delete('/api/library/:userId/:resourceId', async (req, res) => {
  try {
    const { userId, resourceId } = req.params;
    await pool.query(
      'DELETE FROM library WHERE user_id = $1 AND resource_id = $2',
      [userId, resourceId]
    );
    res.json({ message: 'Eliminado de biblioteca' });
  } catch (error) {
    console.error('Error removing from library:', error);
    res.status(500).json({ error: 'Error al eliminar de biblioteca' });
  }
});

/* =========================
   ERROR HANDLERS
========================= */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */
const gracefulShutdown = () => {
  console.log('⚠️  Señal de cierre recibida, cerrando servidor...');
  pool.end(() => {
    console.log('✅ Pool de conexiones cerrado');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/* =========================
   START SERVER
========================= */
app.listen(PORT, HOST, () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('✅ Servidor iniciado exitosamente');
  console.log('═══════════════════════════════════════════');
  console.log(`📍 Escuchando en: ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME || 'development'}`);
  console.log(`🔗 Public URL: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'N/A'}`);
  console.log('═══════════════════════════════════════════');
}).on('error', (err) => {
  console.error('❌ Error al iniciar el servidor:', err);
  process.exit(1);
});
