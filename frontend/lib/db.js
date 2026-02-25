// frontend/lib/db.js
// Utilidad para conectar con PostgreSQL (Neon)
import { Pool } from 'pg';

let pool;
let migrationDone = false;

async function runMigrations(p) {
  if (migrationDone) return;
  try {
    await p.query(`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS zoom_link TEXT;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS youtube_playlist TEXT;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

      ALTER TABLE modules ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

      CREATE TABLE IF NOT EXISTS module_items (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(300) NOT NULL,
        content_url TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE resources ALTER COLUMN year TYPE TEXT USING year::TEXT;
      ALTER TABLE resources ADD COLUMN IF NOT EXISTS abstract TEXT DEFAULT '';
      ALTER TABLE resources ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
      ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_url TEXT;
      ALTER TABLE resources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'saved',
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, resource_id)
      );
    `);
    migrationDone = true;
    console.log('Migrations applied successfully');
  } catch (err) {
    console.error('Migration error (non-fatal):', err.message);
  }
}

/**
 * Obtiene o crea el pool de conexiones a PostgreSQL
 */
export function getPool() {
  if (!pool) {
    // CRÍTICO: Verificar que DATABASE_URL exista
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not defined. Please set it in Vercel Environment Variables.'
      );
    }

    console.log('Initializing database pool with DATABASE_URL:', 
      process.env.DATABASE_URL.substring(0, 30) + '...' // Solo mostrar inicio para seguridad
    );

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      // Configuración optimizada para serverless (Vercel)
      max: 1, // Máximo de conexiones en serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Log de errores del pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Run migrations asynchronously (non-blocking)
    runMigrations(pool);
  }

  return pool;
}

/**
 * Ejecuta una query SQL
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros de la query
 * @returns {Promise} Resultado de la query
 */
export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log para debugging
    console.log('Executed query', { 
      text: text.substring(0, 100), // Solo primeros 100 caracteres
      duration, 
      rows: result.rowCount 
    });
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Cierra el pool de conexiones (útil para testing)
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
