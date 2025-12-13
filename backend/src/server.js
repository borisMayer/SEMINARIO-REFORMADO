import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno (solo para desarrollo local)
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
  database: process.env.PGDATABASE || 'appdb',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Validar configuración antes de crear el pool
const requiredEnvVars = ['PGHOST', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
  console.error('💡 Verifica tu configuración en Railway');
  process.exit(1);
}

const pool = new Pool(dbConfig);

// Log de configuración (sin mostrar passwords)
console.log('🔍 Configuración de Base de Datos:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   SSL: Enabled`);

// Test de conexión inicial
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a Neon PostgreSQL:');
    console.error('   Message:', err.message);
    console.error('   Code:', err.code);
    if (err.code === 'ENOTFOUND') {
      console.error('💡 Verifica que PGHOST sea correcto');
    }
  } else {
    console.log('✅ Conectado exitosamente a Neon PostgreSQL');
    release();
  }
});

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
});

/* =========================
   ROUTES
========================= */

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 Seminario Reformado API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      dbTest: '/api/db-test'
    }
  });
});

// Health check básico
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'backend',
    uptime: process.uptime(),
    time: new Date().toISOString(),
    port: PORT,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || 'local'
  });
});

// Health check con DB
app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as timestamp, version()');
    const duration = Date.now() - start;
    
    res.json({ 
      ok: true, 
      db: 'connected',
      responseTime: `${duration}ms`,
      timestamp: result.rows[0].timestamp,
      postgresVersion: result.rows[0].version.split(' ').slice(0, 2).join(' ')
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

// Endpoint de prueba detallado de DB
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        pg_postmaster_start_time() as server_start_time,
        version() as version
    `);
    
    res.json({
      ok: true,
      connection: 'successful',
      info: result.rows[0]
    });
  } catch (err) {
    console.error('❌ DB Test Error:', err);
    res.status(500).json({
      ok: false,
      error: err.message,
      code: err.code,
      hint: err.hint || 'Verifica las credenciales de la base de datos'
    });
  }
});

/* =========================
   ERROR HANDLERS
========================= */

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method,
    availableEndpoints: ['/', '/health', '/api/health', '/api/db-test']
  });
});

// Global Error Handler
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
  
  // Timeout de seguridad
  setTimeout(() => {
    console.error('❌ No se pudo cerrar gracefully, forzando salida...');
    process.exit(1);
  }, 10000);
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
  console.log('');
}).on('error', (err) => {
  console.error('❌ Error al iniciar el servidor:', err);
  process.exit(1);
});
