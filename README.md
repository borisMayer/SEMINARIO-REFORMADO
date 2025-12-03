
# Repositorio Académico – Facultad de Educación Teológica (MVP tipo Canvas/LMS)

Proyecto completo (frontend + backend + base de datos) listo para ejecutar con Docker.

## Requisitos
- Docker y Docker Compose instalados.

## Puesta en marcha rápida
1. Copia el archivo `.env.example` a `.env` y ajusta valores si es necesario:
   ```bash
   cp .env.example .env
   ```
2. Levanta la plataforma:
   ```bash
   docker compose up -d --build
   ```
3. Accede al **frontend** en: http://localhost:3000
4. API **backend** en: http://localhost:4000
5. Base de datos **PostgreSQL** expuesta en `localhost:5432` (usuario `appuser`, password `apppass`).

## Estructura
- `frontend/`: Next.js + Tailwind (UI simple con búsqueda, filtros y aulas).
- `backend/`: Express.js + pg (endpoints REST). 
- `db/init.sql`: Esquema SQL y datos de ejemplo.
- `docker-compose.yml`: Orquestación de servicios.

## Variables de entorno
Ver `.env.example`.

## Notas
- Este MVP incluye componentes UI mínimos (sin shadcn) para evitar dependencias complejas. Puedes migrar luego a shadcn/ui si lo prefieres.
- La búsqueda y filtros funcionan contra la API y el esquema de Postgres provisto.

