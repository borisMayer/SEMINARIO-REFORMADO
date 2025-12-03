
-- Esquema base para repositorio y LMS
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','docente','estudiante','bibliotecario')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  area TEXT NOT NULL,
  type TEXT NOT NULL,
  year INT,
  abstract TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  file_url TEXT,
  license TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_text ON resources USING gin (to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(abstract,'')));
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING gin (tags);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  instructors TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  ord INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  module_id INT REFERENCES modules(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Lectura','Tarea','Quiz','Foro')),
  title TEXT NOT NULL,
  resource_id INT REFERENCES resources(id) ON DELETE SET NULL,
  due_date DATE
);

CREATE TABLE IF NOT EXISTS enrollments (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('docente','estudiante')),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS saved_items (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, resource_id)
);

-- Datos demo
INSERT INTO users (name, email, role) VALUES
('Prof. L. Rojas','lrojas@example.com','docente'),
('Dra. N. Campos','ncampos@example.com','docente'),
('Est. A. Pérez','aperez@example.com','estudiante');

INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url, license, created_by)
VALUES
('Introducción a la Hermenéutica Bíblica', ARRAY['Dra. M. Herrera'], 'Biblia', 'Artículo', 2023, 'Marco metodológico para la interpretación bíblica en contextos latinoamericanos.', ARRAY['hermenéutica','exégesis','contexto'], '/files/hermeneutica.pdf', 'CC BY-NC', 1),
('Teología Pastoral y Acompañamiento', ARRAY['P. J. Morales'], 'Pastoral', 'Libro', 2021, 'Prácticas pastorales para comunidades rurales y urbanas.', ARRAY['acompañamiento','pastoral','comunidad'], '/files/pastoral.pdf', 'CC BY-NC', 1),
('Historia de la Iglesia en Aysén', ARRAY['C. Soto','A. Vega'], 'Historia', 'Tesis', 2024, 'Estudio histórico sobre el desarrollo eclesial en la Patagonia chilena.', ARRAY['historia','patagonia','iglesia'], '/files/iglesia_aysen.pdf', 'CC BY-NC', 2);

INSERT INTO courses (name, term, instructors) VALUES
('Teología Sistemática I','2025-1', ARRAY['Prof. L. Rojas']),
('Historia de la Iglesia Contemporánea','2025-1', ARRAY['Dra. N. Campos']);

INSERT INTO modules (course_id, title, ord) VALUES
(1, 'Revelación y Escritura', 1),
(1, 'Dios Uno y Trino', 2),
(2, 'Siglo XX y movimientos', 1);

INSERT INTO items (module_id, type, title, resource_id, due_date) VALUES
(1, 'Lectura', 'Capítulo 1: Revelación', 1, NULL),
(1, 'Tarea', 'Ensayo breve (1000 palabras)', NULL, '2025-03-22'),
(2, 'Lectura', 'Símbolos trinitarios clásicos', NULL, NULL),
(2, 'Quiz', 'Quiz semana 3', NULL, '2025-04-05'),
(3, 'Lectura', 'Historia Iglesia Aysén', 3, NULL),
(3, 'Foro', 'Debate: Vaticano II', NULL, '2025-04-18');
