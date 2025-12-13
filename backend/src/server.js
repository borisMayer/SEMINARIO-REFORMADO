import express from 'express';
import cors from 'cors';
import pg from 'pg';

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
   DATABASE (NEON)
========================= */
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'appdb', // 🔥 Fallback al nombre correcto
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Verificación de variables de entorno al iniciar
console.log('🔍 Verificando configuración...');
console.log(`PORT: ${PORT}`);
console.log(`PGHOST: ${process.env.PGHOST ? '✅' : '❌'}`);
console.log(`PGUSER: ${process.env.PGUSER ? '✅' : '❌'}`);
console.log(`PGDATABASE: ${process.env.PGDATABASE || 'appdb'}`);

// Test de conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a Neon PostgreSQL:', err.message);
    console.error('Stack:', err.stack);
  } else {
    console.log('✅ Conectado exitosamente a Neon PostgreSQL');
    release();
  }
});

/* =========================
   ROUTES
========================= */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 Seminario Reformado API funcionando',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health',
      '/api/health',
      '/api/db-test'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'backend',
    time: new Date().toISOString(),
    port: PORT,
    host: HOST,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || 'local'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as timestamp, version()');
    res.json({ 
      ok: true, 
      db: 'connected',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
    });
  } catch (err) {
    console.error('❌ DB Health Check Error:', err.message);
    res.status(500).json({ 
      ok: false, 
      db: 'error',
      message: err.message,
      code: err.code
    });
  }
});

// Endpoint para probar la conexión a la DB
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        version() as version
    `);
    
    res.json({
      ok: true,
      connection: 'successful',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('❌ DB Test Error:', err);
    res.status(500).json({
      ok: false,
      error: err.message,
      code: err.code,
      detail: err.detail
    });
  }
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido, cerrando servidor...');
  pool.end(() => {
    console.log('✅ Pool de conexiones cerrado');
    process.exit(0);
  });
});

/* =========================
   START SERVER
========================= */
if (!PORT) {
  console.error('❌ PORT no definido');
  process.exit(1);
}

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend escuchando en ${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME || 'development'}`);
  console.log(`🌐 Public URL: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'N/A'}`);
});
