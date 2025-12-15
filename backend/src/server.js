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

// 🔥 Configuración de CORS mejorada
const allowedOrigins = [
  'https://seminario-reformado-b4b5-krep29ybq.vercel.app', // Dominio de Vercel
  'http://localhost:3000', // Desarrollo local
  'http://localhost:5173', // Desarrollo local (Vite)
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (ej: acceso directo, Postman, curl)
    if (!origin) {
      console.log('✅ Petición sin origen (acceso directo) - permitida');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origen permitido:', origin);
      return callback(null, true);
    }

    console.log('⚠️ Origen bloqueado:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

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
  max: 10, // Aumentar el número máximo de conexiones en producción
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
};

let pool = new Pool(dbConfig);
let isReconnecting = false;

// Configurar listeners para el pool de conexiones
function setupPoolListeners() {
  pool.on('error', async (err) => {
    console.error('❌ Error en el pool de conexiones:', err.message);

    if (!isReconnecting && err.message.includes('terminated')) {
      isReconnecting = true;
      console.log('🔄 Reconectando a la base de datos...');

      try {
        await pool.end();
        pool = new Pool(dbConfig);
        setupPoolListeners();
        console.log('✅ Pool recreado con éxito');
      } catch (reconnectErr) {
        console.error('❌ Error al recrear el pool:', reconnectErr.message);
      } finally {
        isReconnecting = false;
      }
    }
  });

  pool.on('connect', () => {
    console.log('🔌 Nuevo cliente conectado a la base de datos');
  });

  pool.on('remove', () => {
    console.log('🔌 Cliente desconectado');
  });
}

setupPoolListeners();

// Función para asegurar que el pool esté disponible
async function ensurePool() {
  if (!pool || pool.ending) {
    console.log('🔄 Recreando pool de conexiones...');
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
      console.error(`❌ Intento ${i + 1} fallido:`, error.message);

      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Espera exponencial
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

    console.log('✅ Tablas inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar tablas:', error.message);
  }
}

// Inicializar tablas al iniciar el servidor
initializeTables().catch(err => console.error('Error en inicialización:', err));

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
    version: '1.0.1',
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
    console.error('❌ Error en health check de la base de datos:', error.message);
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
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await queryWithRetry(
      `INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, authors, area, type, year, abstract || '', tags || [], file_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear recurso:', error);
    res.status(500).json({ error: 'Error interno al crear recurso' });
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
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await queryWithRetry(
      `INSERT INTO courses (name, term, instructors, description, zoom_link, youtube_playlist)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, term, instructors, description || '', zoom_link || null, youtube_playlist || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear curso:', error);
    res.status(500).json({ error: 'Error interno al crear curso' });
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
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await queryWithRetry(
      'INSERT INTO library (user_id, resource_id) VALUES ($1, $2) ON CONFLICT (user_id, resource_id) DO NOTHING RETURNING *',
      [user_id, resource_id]
    );

    res.status(201).json(result.rows[0] || { message: 'El recurso ya está en la biblioteca' });
  } catch (error) {
    console.error('❌ Error al agregar a biblioteca:', error);
    res.status(500).json({ error: 'Error interno al agregar a biblioteca' });
  }
});

/* =========================
   MANEJO DE ERRORES GLOBALES
========================= */
app.use((req, res) => {
  console.log('❌ Ruta no encontrada:', req.method, req.path);
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: isProduction ? undefined : err.message
  });
});

/* =========================
   INICIO DEL SERVIDOR
========================= */
const server = app.listen(PORT, HOST, async () => {
  console.log(`✅ Servidor iniciado en ${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || 'local'}`);

  try {
    await queryWithRetry('SELECT 1');
    console.log('✅ Conexión a la base de datos establecida');
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  }
});

// Configuración para evitar timeouts en Railway
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Manejo de apagado graceful
const gracefulShutdown = async (signal) => {
  console.log(`⚠️ ${signal} recibido. Cerrando servidor...`);

  server.close(async () => {
    console.log('🔴 Servidor HTTP cerrado');
    try {
      await pool.end();
      console.log('🔴 Pool de conexiones cerrado');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error al cerrar el pool:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
