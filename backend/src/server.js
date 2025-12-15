import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();

// Railway asigna el PORT automáticamente - NUNCA usar 4000
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔥 CORS CORREGIDO - Permite acceso directo y desde Vercel
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://seminario-reformado-b4b5-krep29ybq.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    
    // ✅ CLAVE: Permite peticiones sin origen (acceso directo al backend)
    if (!origin) {
      console.log('✅ Petición sin origen (acceso directo) - permitida');
      return callback(null, true);
    }
    
    if (allowed.includes(origin)) {
      console.log('✅ Origen permitido:', origin);
      return callback(null, true);
    }
    
    console.log('⚠️  Origen bloqueado:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

/* =========================
   DATABASE CONFIG CON RECONEXIÓN
========================= */
const requiredEnvVars = ['PGHOST', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Variables faltantes:', missingVars.join(', '));
  process.exit(1);
}

const dbConfig = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'neondb',
  ssl: { rejectUnauthorized: false },
  max: 5,
  min: 1,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

let pool = new Pool(dbConfig);
let isReconnecting = false;

console.log('🔍 DB:', {
  host: dbConfig.host.substring(0, 25) + '...',
  port: dbConfig.port,
  database: dbConfig.database,
});

// Configurar listeners del pool
function setupPoolListeners() {
  pool.on('error', async (err) => {
    console.error('❌ Pool error:', err.message);
    
    if (!isReconnecting && err.message.includes('terminated')) {
      isReconnecting = true;
      console.log('🔄 Iniciando reconexión...');
      
      try {
        await pool.end();
        pool = new Pool(dbConfig);
        setupPoolListeners();
        console.log('✅ Pool recreado');
      } catch (reconnectErr) {
        console.error('❌ Error recreando pool:', reconnectErr.message);
      } finally {
        isReconnecting = false;
      }
    }
  });

  pool.on('connect', () => {
    console.log('🔌 Cliente conectado');
  });

  pool.on('remove', () => {
    console.log('🔌 Cliente removido');
  });
}

setupPoolListeners();

// Función para asegurar que el pool esté disponible
async function ensurePool() {
  if (!pool || pool.ending || pool.ended) {
    console.log('🔄 Recreando pool...');
    pool = new Pool(dbConfig);
    setupPoolListeners();
  }
  return pool;
}

// Wrapper para queries con retry
async function queryWithRetry(text, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const currentPool = await ensurePool();
      return await currentPool.query(text, params);
    } catch (error) {
      console.error(`Query intento ${i + 1} falló:`, error.message);
      
      if (i === retries - 1) throw error;
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/* =========================
   INICIALIZAR TABLAS
========================= */
async function initializeTables() {
  try {
    await queryWithRetry(`
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

    await queryWithRetry(`
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

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(300) NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryWithRetry(`
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

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS library (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, resource_id)
      )
    `);

    console.log('✅ Tablas creadas');
  } catch (error) {
    console.error('❌ Error en tablas:', error.message);
  }
}

// Inicializar tablas en background (no bloquea)
initializeTables().catch(err => console.error('Init error:', err));

/* =========================
   HEALTH CHECKS - PRIMERAS RUTAS
========================= */

// 🔥 HEALTHCHECK ESPECIAL PARA RAILWAY - DEBE SER LA PRIMERA RUTA
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    ok: true, 
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  });
});

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

app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const result = await queryWithRetry('SELECT NOW() as time');
    const duration = Date.now() - start;
    
    res.status(200).json({ 
      ok: true, 
      database: 'connected',
      responseTime: `${duration}ms`,
      timestamp: result.rows[0].time,
    });
  } catch (error) {
    console.error('DB health check error:', error.message);
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
    console.log('📥 GET /api/resources');
    const { q, area, type, year, tags } = req.query;
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    let idx = 1;

    if (q) {
      query += ` AND (title ILIKE $${idx} OR abstract ILIKE $${idx})`;
      params.push(`%${q}%`);
      idx++;
    }
    if (area) {
      query += ` AND area = $${idx}`;
      params.push(area);
      idx++;
    }
    if (type) {
      query += ` AND type = $${idx}`;
      params.push(type);
      idx++;
    }
    if (year) {
      query += ` AND year = $${idx}`;
      params.push(year);
      idx++;
    }
    if (tags) {
      query += ` AND tags && $${idx}`;
      params.push(tags.split(','));
      idx++;
    }

    query += ' ORDER BY created_at DESC LIMIT 100';
    const result = await queryWithRetry(query, params);
    console.log(`✅ ${result.rows.length} recursos encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching resources:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const { title, authors, area, type, year, abstract, tags, file_url } = req.body;
    
    if (!title || !authors || !area || !type || !year) {
      return res.status(400).json({ error: 'Campos requeridos: title, authors, area, type, year' });
    }
    
    const result = await queryWithRetry(
      `INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, authors, area, type, year, abstract || '', tags || [], file_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: error.message });
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
    
    const result = await queryWithRetry(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryWithRetry('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json({ message: 'Recurso eliminado', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   CURSOS
========================= */
app.get('/api/courses', async (req, res) => {
  try {
    const result = await queryWithRetry('SELECT * FROM courses ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { name, term, instructors, description, zoom_link, youtube_playlist } = req.body;
    
    if (!name || !term || !instructors) {
      return res.status(400).json({ error: 'Campos requeridos: name, term, instructors' });
    }
    
    const result = await queryWithRetry(
      `INSERT INTO courses (name, term, instructors, description, zoom_link, youtube_playlist) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, term, instructors, description || '', zoom_link || null, youtube_playlist || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/:courseId/modules', async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await queryWithRetry(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index',
      [courseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/modules', async (req, res) => {
  try {
    const { course_id, title, order_index = 0 } = req.body;
    
    if (!course_id || !title) {
      return res.status(400).json({ error: 'Campos requeridos: course_id, title' });
    }
    
    const result = await queryWithRetry(
      'INSERT INTO modules (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING *',
      [course_id, title, order_index]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/modules/:moduleId/items', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await queryWithRetry(
      'SELECT * FROM items WHERE module_id = $1 ORDER BY order_index',
      [moduleId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { module_id, type, title, content_url, order_index = 0 } = req.body;
    
    if (!module_id || !type || !title) {
      return res.status(400).json({ error: 'Campos requeridos: module_id, type, title' });
    }
    
    const result = await queryWithRetry(
      'INSERT INTO items (module_id, type, title, content_url, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [module_id, type, title, content_url || null, order_index]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   BIBLIOTECA
========================= */
app.get('/api/library/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await queryWithRetry(
      `SELECT r.* FROM resources r 
       INNER JOIN library l ON r.id = l.resource_id 
       WHERE l.user_id = $1 ORDER BY l.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/library', async (req, res) => {
  try {
    const { user_id, resource_id } = req.body;
    
    if (!user_id || !resource_id) {
      return res.status(400).json({ error: 'Campos requeridos: user_id, resource_id' });
    }
    
    const result = await queryWithRetry(
      'INSERT INTO library (user_id, resource_id) VALUES ($1, $2) ON CONFLICT (user_id, resource_id) DO NOTHING RETURNING *',
      [user_id, resource_id]
    );
    
    res.status(201).json(result.rows[0] || { message: 'Ya existe en biblioteca' });
  } catch (error) {
    console.error('Error saving to library:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/library/:userId/:resourceId', async (req, res) => {
  try {
    const { userId, resourceId } = req.params;
    const result = await queryWithRetry(
      'DELETE FROM library WHERE user_id = $1 AND resource_id = $2 RETURNING id',
      [userId, resourceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No encontrado en biblioteca' });
    }
    
    res.json({ message: 'Eliminado de biblioteca' });
  } catch (error) {
    console.error('Error removing from library:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   ERROR HANDLERS
========================= */
app.use((req, res) => {
  console.log('❌ 404:', req.method, req.path);
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
const gracefulShutdown = async (signal) => {
  console.log(`⚠️  ${signal} recibido, cerrando...`);
  
  server.close(() => {
    console.log('🔴 HTTP server cerrado');
  });
  
  try {
    await pool.end();
    console.log('🔴 Pool cerrado');
    process.exit(0);
  } catch (err) {
    console.error('Error cerrando pool:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/* =========================
   START SERVER
========================= */
const server = app.listen(PORT, HOST, async () => {
  console.log('✅ Server:', `${HOST}:${PORT}`);
  console.log('🌍 Env:', process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || 'local');
  
  try {
    await queryWithRetry('SELECT 1');
    console.log('✅ DB OK');
  } catch (err) {
    console.error('❌ DB:', err.message);
  }
});

// Keep-alive para Railway
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});
