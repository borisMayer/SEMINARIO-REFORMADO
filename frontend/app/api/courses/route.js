// frontend/app/api/courses/route.js
// Endpoints para gestionar cursos

import { query } from '../../lib/db.js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/courses
 * Obtiene todos los cursos
 */
export async function GET() {
  try {
    console.log('Fetching all courses');
    
    const result = await query(
      'SELECT * FROM courses ORDER BY created_at DESC'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener cursos', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Crea un nuevo curso
 * Body: { name, term, instructors, description, zoom_link, youtube_playlist }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, term, instructors, description, zoom_link, youtube_playlist } = body;

    // Validación
    if (!name) {
      return NextResponse.json(
        { 
          error: 'Faltan campos requeridos',
          required: ['name'],
          received: { name: !!name }
        },
        { status: 400 }
      );
    }

    console.log('Creating new course:', { name, term });

    const result = await query(
      `INSERT INTO courses (name, term, instructors, description, zoom_link, youtube_playlist, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        name, 
        term || '', 
        instructors || [], 
        description || '', 
        zoom_link || '', 
        youtube_playlist || ''
      ]
    );

    console.log('Course created successfully:', result.rows[0].id);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear curso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
