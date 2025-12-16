import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();

// Railway asigna el PORT automáticamente
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de CORS mejorada para Vercel
const allowedOrigins = [
  'https://seminario-reformado-b4b5.vercel.app',
  /^https:\/\/seminario-reformado-b4b5(-[a-z0-9]+)?\.vercel\.app$/, // Todos los subdominios de Vercel
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (archivos locales, Postman, curl, etc.)
      if (!origin) {
        console.log('✅ Petición sin origen (acceso directo) - permitida');
        return callback(null, true);
      }

      // En desarrollo, permitir cualquier origen
      if (!isProduction) {
        console.log('✅ Desarrollo - Origen permitido:', origin);
        return callback(null, true);
      }

      // Verificar si el origen está en la lista o coincide con el patrón regex
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        // Si es regex, probar el patrón
        return allowedOrigin.test(origin);
      });

      if (isAllowed) {
        console.log('✅ Origen permitido:', origin);
        return callback(null, true);
      }

      console.log('⚠️ Origen bloqueado:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Manejo de OPTIONS para solicitudes preflight
app.options('*', cors());

/* =========================
   CONFIGURACIÓN DE LA BASE DE DATOS
========================= */
const requiredEnvVars = ['PGHOST', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
  process.exit(1);
}

const dbConfig = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'neondb',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
};

console.log('📊 Configuración DB:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  ssl: !!dbConfig.ssl,
});

let pool = new Pool(dbConfig);
let isReconnecting = false;

// Configurar listeners para el pool de conexiones
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
        console.error('❌ Error al recrear pool:', reconnectErr.message);
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
  if (!pool || pool.ending) {
    console.log('🔄 Recreando pool...');
    pool = new Pool(dbConfig);
    setupPoolListeners();
  }
  return pool;
}

// Wrapper para consultas con reintentos
async function queryWithRetry(text, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const currentPool = await ensurePool();
      return await currentPool.query(text, params);
    } catch (error) {
      console.error(`❌ Intento ${i + 1}/${retries} fallido:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

/* =========================
   INICIALIZACIÓN DE TABLAS
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
    console.error('❌ Error al inicializar tablas:', error.message);
  }
}

// Verificar conexión e inicializar tablas
async function initializeDatabase() {
  try {
    const result = await queryWithRetry('SELECT NOW() as time');
    console.log('✅ DB OK');
    await initializeTables();
  } catch (error) {
    console.error('❌ Error en DB:', error.message);
  }
}

initializeDatabase();

/* =========================
   ENDPOINTS DE SALUD
========================= */
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
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
    console.error('❌ DB health check error:', error.message);
    res.status(500).json({
      ok: false,
      database: 'error',
      message: error.message
    });
  }
});

/* =========================
   ENDPOINTS DE RECURSOS
========================= */
app.get('/api/resources', async (req, res) => {
  try {
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
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener recursos:', error);
    res.status(500).json({ error: 'Error interno al obtener recursos' });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const { title, authors, area, type, year, abstract, tags, file_url } = req.body;

    if (!title || !authors || !area || !type || !year) {
      return res.status(400).json({ error: 'Faltan campos requeridos: title, authors, area, type, year' });
    }

    const result = await queryWithRetry(
      `INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, authors, area, type, year, abstract || '', tags || [], file_url || null]
    );

    console.log('✅ Recurso creado:', result.rows[0].id, '-', title);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear recurso:', error);
    res.status(500).json({ error: 'Error interno al crear recurso' });
  }
});

app.put('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, authors, area, type, year, abstract, tags, file_url } = req.body;

    const result = await queryWithRetry(
      `UPDATE resources
       SET title = COALESCE($1, title),
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

    console.log('✅ Recurso actualizado:', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar recurso:', error);
    res.status(500).json({ error: 'Error interno al actualizar recurso' });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryWithRetry('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    console.log('✅ Recurso eliminado:', id);
    res.json({ message: 'Recurso eliminado correctamente', id: parseInt(id) });
  } catch (error) {
    console.error('❌ Error al eliminar recurso:', error);
    res.status(500).json({ error: 'Error interno al eliminar recurso' });
  }
});

/* =========================
   ENDPOINTS DE CURSOS
========================= */
app.get('/api/courses', async (req, res) => {
  try {
    const result = await queryWithRetry('SELECT * FROM courses ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener cursos:', error);
    res.status(500).json({ error: 'Error interno al obtener cursos' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { name, term, instructors, description, zoom_link, youtube_playlist } = req.body;

    if (!name || !term || !instructors) {
      return res.status(400).json({ error: 'Faltan campos requeridos: name, term, instructors' });
    }

    const result = await queryWithRetry(
      `INSERT INTO courses (name, term, instructors, description, zoom_link, youtube_playlist)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, term, instructors, description || '', zoom_link || null, youtube_playlist || null]
    );

    console.log('✅ Curso creado:', result.rows[0].id, '-', name);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear curso:', error);
    res.status(500).json({ error: 'Error interno al crear curso' });
  }
});

app.get('/api/courses/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryWithRetry(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index ASC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener módulos:', error);
    res.status(500).json({ error: 'Error interno al obtener módulos' });
  }
});

/* =========================
   ENDPOINTS DE MÓDULOS
========================= */
app.post('/api/modules', async (req, res) => {
  try {
    const { course_id, title, order_index } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ error: 'Faltan campos requeridos: course_id, title' });
    }

    const result = await queryWithRetry(
      `INSERT INTO modules (course_id, title, order_index)
       VALUES ($1, $2, $3) RETURNING *`,
      [course_id, title, order_index || 0]
    );

    console.log('✅ Módulo creado:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear módulo:', error);
    res.status(500).json({ error: 'Error interno al crear módulo' });
  }
});

app.get('/api/modules/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryWithRetry(
      'SELECT * FROM items WHERE module_id = $1 ORDER BY order_index ASC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener items:', error);
    res.status(500).json({ error: 'Error interno al obtener items' });
  }
});

/* =========================
   ENDPOINTS DE ITEMS
========================= */
app.post('/api/items', async (req, res) => {
  try {
    const { module_id, type, title, content_url, order_index } = req.body;

    if (!module_id || !type || !title) {
      return res.status(400).json({ error: 'Faltan campos requeridos: module_id, type, title' });
    }

    const result = await queryWithRetry(
      `INSERT INTO items (module_id, type, title, content_url, order_index)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [module_id, type, title, content_url || null, order_index || 0]
    );

    console.log('✅ Item creado:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear item:', error);
    res.status(500).json({ error: 'Error interno al crear item' });
  }
});

/* =========================
   ENDPOINTS DE BIBLIOTECA
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
    console.error('❌ Error al obtener biblioteca:', error);
    res.status(500).json({ error: 'Error interno al obtener biblioteca' });
  }
});

app.post('/api/library', async (req, res) => {
  try {
    const { user_id, resource_id } = req.body;

    if (!user_id || !resource_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos: user_id, resource_id' });
    }

    const result = await queryWithRetry(
      'INSERT INTO library (user_id, resource_id) VALUES ($1, $2) ON CONFLICT (user_id, resource_id) DO NOTHING RETURNING *',
      [user_id, resource_id]
    );

    if (result.rows.length > 0) {
      console.log('✅ Agregado a biblioteca:', user_id, resource_id);
      res.status(201).json(result.rows[0]);
    } else {
      res.status(200).json({ message: 'El recurso ya está en la biblioteca' });
    }
  } catch (error) {
    console.error('❌ Error al agregar a biblioteca:', error);
    res.status(500).json({ error: 'Error interno al agregar a biblioteca' });
  }
});

app.delete('/api/library/:userId/:resourceId', async (req, res) => {
  try {
    const { userId, resourceId } = req.params;
    const result = await queryWithRetry(
      'DELETE FROM library WHERE user_id = $1 AND resource_id = $2 RETURNING *',
      [userId, resourceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado en la biblioteca' });
    }

    console.log('✅ Removido de biblioteca:', userId, resourceId);
    res.json({ message: 'Recurso eliminado de la biblioteca' });
  } catch (error) {
    console.error('❌ Error al eliminar de biblioteca:', error);
    res.status(500).json({ error: 'Error interno al eliminar de biblioteca' });
  }
});

/* =========================
   MANEJO DE ERRORES GLOBALES
========================= */
app.use((req, res) => {
  console.log('❌ 404:', req.method, req.path);
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: isProduction ? 'Error interno' : err.message
  });
});

/* =========================
   INICIO DEL SERVIDOR
========================= */
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server: ${HOST}:${PORT}`);
  console.log(`🌍 Env: ${process.env.NODE_ENV || 'development'}`);
});

// Configuración para evitar timeouts
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Manejo de apagado graceful
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} - Cerrando...`);
  server.close(async () => {
    console.log('🔴 HTTP cerrado');
    try {
      await pool.end();
      console.log('🔴 DB cerrada');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
