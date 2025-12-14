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
const isProduction = process.env.NODE_ENV === 'production';

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS mejorado
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://seminario-reformado-b4b5-krep29ybq.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4000'
    ];
    
    // Permitir requests sin origin (como Postman) en desarrollo
    if (!origin && !isProduction) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Validación de variables de entorno
const requiredEnvVars = ['PGHOST', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Variables faltantes:', missingVars.join(', '));
  process.exit(1);
}

const pool = new Pool(dbConfig);

// Log de configuración
console.log('🔍 Base de Datos:', {
  host: dbConfig.host.substring(0, 20) + '...',
  port: dbConfig.port,
  database: dbConfig.database,
});

// Eventos del pool
pool.on('connect', () => {
  console.log('🔌 Nueva conexión al pool');
});

pool.on('error', (err) => {
  console.error('❌ Error del pool:', err.message);
});

/* =========================
   INICIALIZAR TABLAS (ASYNC - NO BLOQUEANTE)
========================= */
async function initializeTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Tabla resources
    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        authors TEXT[] NOT NULL,
        area VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        year VARCHAR(4) NOT NULL,
        abstract TEXT DEFAULT '',
        tags TEXT[] DEFAULT '{}',
        file_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla courses
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(300) NOT NULL,
        term VARCHAR(50) NOT NULL,
        instructors TEXT[] NOT NULL,
        description TEXT DEFAULT '',
        zoom_link TEXT,
        youtube_playlist TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla modules
    await client.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(300) NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla items
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(300) NOT NULL,
        content_url TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla library
    await client.query(`
      CREATE TABLE IF NOT EXISTS library (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, resource_id)
      )
    `);

    // Índices para mejorar performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_resources_area ON resources(area);
      CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
      CREATE INDEX IF NOT EXISTS idx_resources_year ON resources(year);
      CREATE INDEX IF NOT EXISTS idx_library_user ON library(user_id);
      CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
      CREATE INDEX IF NOT EXISTS idx_items_module ON items(module_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Tablas e índices creados');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en tablas:', error.message);
  } finally {
    client.release();
  }
}

// Inicializar en background (no bloquea el servidor)
initializeTables().catch(err => console.error('Init error:', err));

/* =========================
   HEALTH CHECKS
========================= */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: '🚀 Seminario Reformado API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    endpoints: {
      health: '/health',
      dbHealth: '/api/health',
      resources: '/api/resources',
      courses: '/api/courses',
      library: '/api/library/:userId'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    ok: true, 
    service: 'seminario-reformado-api',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as timestamp, version()');
    const duration = Date.now() - start;
    
    res.status(200).json({ 
      ok: true, 
      database: 'connected',
      responseTime: `${duration}ms`,
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
    });
  } catch (error) {
    console.error('❌ DB health check failed:', error.message);
    res.status(500).json({ 
      ok: false, 
      database: 'error',
      message: error.message
    });
  }
});

/* =========================
   RECURSOS
========================= */
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

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Error al obtener recursos', details: error.message });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const { title, authors, area, type, year, abstract, tags, file_url } = req.body;
    
    if (!title || !authors || !area || !type || !year) {
      return res.status(400).json({ error: 'Campos requeridos: title, authors, area, type, year' });
    }
    
    const result = await pool.query(
      `INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, authors, area, type, year, abstract || '', tags || [], file_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Error al crear recurso', details: error.message });
  }
});

app.put('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const updates = [];
    const values = [];
    let index = 1;

    Object.keys(fields).forEach(key => {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${index}`);
        values.push(fields[key]);
        index++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    const query = `UPDATE resources SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Error al actualizar', details: error.message });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json({ message: 'Recurso eliminado', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Error al eliminar', details: error.message });
  }
});

/* =========================
   CURSOS
========================= */
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error al obtener cursos', details: error.message });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { name, term, instructors, description, zoom_link, youtube_playlist } = req.body;
    
    if (!name || !term || !instructors) {
      return res.status(400).json({ error: 'Campos requeridos: name, term, instructors' });
    }
    
    const result = await pool.query(
      `INSERT INTO courses (name, term, instructors, description, zoom_link, youtube_playlist) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, term, instructors, description || '', zoom_link || null, youtube_playlist || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error al crear curso', details: error.message });
  }
});

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
    res.status(500).json({ error: 'Error al obtener módulos', details: error.message });
  }
});

app.post('/api/modules', async (req, res) => {
  try {
    const { course_id, title, order_index = 0 } = req.body;
    
    if (!course_id || !title) {
      return res.status(400).json({ error: 'Campos requeridos: course_id, title' });
    }
    
    const result = await pool.query(
      'INSERT INTO modules (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING *',
      [course_id, title, order_index]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Error al crear módulo', details: error.message });
  }
});

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
    res.status(500).json({ error: 'Error al obtener items', details: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { module_id, type, title, content_url, order_index = 0 } = req.body;
    
    if (!module_id || !type || !title) {
      return res.status(400).json({ error: 'Campos requeridos: module_id, type, title' });
    }
    
    const result = await pool.query(
      'INSERT INTO items (module_id, type, title, content_url, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [module_id, type, title, content_url || null, order_index]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Error al crear item', details: error.message });
  }
});

/* =========================
   BIBLIOTECA
========================= */
app.get('/api/library/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT r.* FROM resources r 
       INNER JOIN library l ON r.id = l.resource_id 
       WHERE l.user_id = $1 
       ORDER BY l.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ error: 'Error al obtener biblioteca', details: error.message });
  }
});

app.post('/api/library', async (req, res) => {
  try {
    const { user_id, resource_id } = req.body;
    
    if (!user_id || !resource_id) {
      return res.status(400).json({ error: 'Campos requeridos: user_id, resource_id' });
    }
    
    const result = await pool.query(
      'INSERT INTO library (user_id, resource_id) VALUES ($1, $2) ON CONFLICT (user_id, resource_id) DO NOTHING RETURNING *',
      [user_id, resource_id]
    );
    
    res.status(201).json(result.rows[0] || { message: 'Ya existe en tu biblioteca' });
  } catch (error) {
    console.error('Error saving to library:', error);
    res.status(500).json({ error: 'Error al guardar', details: error.message });
  }
});

app.delete('/api/library/:userId/:resourceId', async (req, res) => {
  try {
    const { userId, resourceId } = req.params;
    const result = await pool.query(
      'DELETE FROM library WHERE user_id = $1 AND resource_id = $2 RETURNING id',
      [userId, resourceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No encontrado en biblioteca' });
    }
    
    res.json({ message: 'Eliminado de biblioteca' });
  } catch (error) {
    console.error('Error removing from library:', error);
    res.status(500).json({ error: 'Error al eliminar', details: error.message });
  }
});

/* =========================
   ERROR HANDLERS
========================= */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Error interno',
    message: isProduction ? 'Internal Server Error' : err.message
  });
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */
const gracefulShutdown = (signal) => {
  console.log(`⚠️  ${signal} recibido, cerrando...`);
  
  server.close(() => {
    console.log('🔴 HTTP server cerrado');
    pool.end(() => {
      console.log('🔴 Pool cerrado');
      process.exit(0);
    });
  });
  
  // Force close después de 10s
  setTimeout(() => {
    console.error('⚠️  Forzando cierre...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/* =========================
   START SERVER
========================= */
const server = app.listen(PORT, HOST, async () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('✅ Servidor iniciado');
  console.log('═══════════════════════════════════════════');
  console.log(`📍 ${HOST}:${PORT}`);
  console.log(`🌍 ${process.env.RAILWAY_ENVIRONMENT_NAME || 'local'}`);
  console.log(`🔗 ${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost'}`);
  console.log('═══════════════════════════════════════════');
  
  // Test DB connection
  try {
    await pool.query('SELECT 1');
    console.log('✅ DB conectada');
  } catch (err) {
    console.error('❌ DB error:', err.message);
  }
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Keep-alive para Railway
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
