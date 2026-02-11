// frontend/lib/db.js
// Utilidad para conectar con PostgreSQL (Neon)
import { Pool } from 'pg';

let pool;

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
