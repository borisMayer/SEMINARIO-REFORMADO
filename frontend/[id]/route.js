// frontend/app/api/courses/[id]/route.js
// Endpoints para gestionar un curso específico por ID

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/courses/[id]
 * Obtiene un curso específico con todos sus módulos
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    console.log('Fetching course:', id);
    
    // Obtener curso
    const courseResult = await query(
      'SELECT * FROM courses WHERE id = $1',
      [id]
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Obtener módulos del curso (si existen)
    const modulesResult = await query(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index',
      [id]
    );

    // Combinar curso con sus módulos
    const course = {
      ...courseResult.rows[0],
      modules: modulesResult.rows
    };

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener curso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Actualiza un curso existente
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, term, instructors, description, zoom_link, youtube_playlist } = body;

    console.log('Updating course:', id);

    const result = await query(
      `UPDATE courses 
       SET name = COALESCE($1, name),
           term = COALESCE($2, term),
           instructors = COALESCE($3, instructors),
           description = COALESCE($4, description),
           zoom_link = COALESCE($5, zoom_link),
           youtube_playlist = COALESCE($6, youtube_playlist)
       WHERE id = $7
       RETURNING *`,
      [name, term, instructors, description, zoom_link, youtube_playlist, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    console.log('Course updated successfully:', id);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { 
        error: 'Error al actualizar curso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Elimina un curso existente
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('Deleting course:', id);
    
    const result = await query(
      'DELETE FROM courses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    console.log('Course deleted successfully:', id);

    return NextResponse.json({
      message: 'Curso eliminado exitosamente',
      course: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar curso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
```

5. Scroll abajo y en **"Commit changes"**:
   - Mensaje: `Add course by ID endpoint`
6. Click en **"Commit changes"** (botón verde)

---

## ✅ ¡Archivos API completos!

Ya tienes todos los archivos necesarios:
- ✅ `health/route.js`
- ✅ `resources/route.js`
- ✅ `resources/[id]/route.js`
- ✅ `courses/route.js`
- ✅ `courses/[id]/route.js`

---

## 🔄 Siguiente paso: Esperar el redeploy

Vercel debería **redeploy automáticamente** cuando detecte los cambios en GitHub (2-3 minutos).

O puedes ir a **Vercel → Deployments** y hacer **Redeploy** manualmente.

---

**Una vez que termine el deployment, prueba de nuevo:**
```
https://seminario-reformado-b4b5.vercel.app/api/health
