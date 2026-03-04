// frontend/lib/db.js
// Utilidad para conectar con PostgreSQL (Neon)
import { Pool } from 'pg';

let pool;
let migrationDone = false;

// Cada migración corre de forma independiente: si una falla no bloquea las demás
const MIGRATIONS = [
  // ── courses ─────────────────────────────────────────────────────────────────
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS description    TEXT DEFAULT ''`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS zoom_link      TEXT`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS youtube_playlist TEXT`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at     TIMESTAMP DEFAULT NOW()`,
  // columnas del esquema nuevo (backend usa name/term/instructors)
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS name           TEXT`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS term           TEXT`,
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructors    TEXT[] DEFAULT '{}'`,
  // copiar datos del esquema viejo (init.sql usaba title/semester/instructor)
  `DO $$ BEGIN
     IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name='courses' AND column_name='title') THEN
       UPDATE courses SET name = title
         WHERE (name IS NULL OR name = '') AND title IS NOT NULL AND title <> '';
     END IF;
     IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name='courses' AND column_name='semester') THEN
       UPDATE courses SET term = semester
         WHERE (term IS NULL OR term = '') AND semester IS NOT NULL AND semester <> '';
     END IF;
     IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name='courses' AND column_name='instructor') THEN
       UPDATE courses
          SET instructors = ARRAY[instructor]
        WHERE (instructors IS NULL OR instructors = '{}')
          AND instructor IS NOT NULL AND instructor <> '';
     END IF;
   END $$`,

  // ── modules ──────────────────────────────────────────────────────────────────
  `ALTER TABLE modules ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0`,
  `ALTER TABLE modules ADD COLUMN IF NOT EXISTS description  TEXT DEFAULT ''`,
  `ALTER TABLE modules ADD COLUMN IF NOT EXISTS created_at   TIMESTAMP DEFAULT NOW()`,

  // ── module_items ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS module_items (
     id          SERIAL PRIMARY KEY,
     module_id   INTEGER REFERENCES modules(id) ON DELETE CASCADE,
     type        VARCHAR(50)  NOT NULL,
     title       VARCHAR(300) NOT NULL,
     content_url TEXT,
     order_index INTEGER NOT NULL DEFAULT 0,
     created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,

  // ── resources ────────────────────────────────────────────────────────────────
  `ALTER TABLE resources ADD COLUMN IF NOT EXISTS abstract    TEXT DEFAULT ''`,
  `ALTER TABLE resources ADD COLUMN IF NOT EXISTS tags        TEXT[] DEFAULT '{}'`,
  `ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_url    TEXT`,
  `ALTER TABLE resources ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP DEFAULT NOW()`,

  // ── user_library ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS user_library (
     id          SERIAL PRIMARY KEY,
     user_id     VARCHAR(100) NOT NULL,
     resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
     status      VARCHAR(50) DEFAULT 'saved',
     added_at    TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, resource_id)
   )`,
];

async function runMigrations(p) {
  if (migrationDone) return;
  let ok = 0;
  let fail = 0;
  for (const sql of MIGRATIONS) {
    try {
      await p.query(sql);
      ok++;
    } catch (err) {
      fail++;
      console.error('Migration step error (non-fatal):', err.message);
    }
  }
  migrationDone = true;
  console.log(`Migrations done: ${ok} ok, ${fail} failed`);
}

/**
 * Obtiene o crea el pool de conexiones a PostgreSQL
 */
export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not defined. Please set it in Vercel Environment Variables.'
      );
    }

    console.log('Initializing database pool with DATABASE_URL:',
      process.env.DATABASE_URL.substring(0, 30) + '...'
    );

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    runMigrations(pool);
  }

  return pool;
}

/**
 * Ejecuta una query SQL
 */
export async function query(text, params) {
  const p = getPool();
  const start = Date.now();
  try {
    const result = await p.query(text, params);
    console.log('Executed query', {
      text: text.substring(0, 100),
      duration: Date.now() - start,
      rows: result.rowCount,
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
