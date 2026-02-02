// frontend/app/api/resources/[id]/route.js
// Endpoints para gestionar un recurso específico por ID

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/resources/[id]
 * Obtiene un recurso específico por ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    console.log('Fetching resource:', id);
    
    const result = await query('SELECT * FROM resources WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Recurso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener recurso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/resources/[id]
 * Actualiza un recurso existente
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, authors, area, type, year, abstract, tags, file_url } = body;

    console.log('Updating resource:', id);

    const result = await query(
      `UPDATE resources 
       SET title = COALESCE($1, title),
           authors = COALESCE($2, authors),
           area = COALESCE($3, area),
           type = COALESCE($4, type),
           year = COALESCE($5, year),
           abstract = COALESCE($6, abstract),
           tags = COALESCE($7, tags),
           file_url = COALESCE($8, file_url)
       WHERE id = $9
       RETURNING *`,
      [title, authors, area, type, year, abstract, tags, file_url, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Recurso no encontrado' },
        { status: 404 }
      );
    }

    console.log('Resource updated successfully:', id);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { 
        error: 'Error al actualizar recurso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resources/[id]
 * Elimina un recurso existente
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('Deleting resource:', id);
    
    const result = await query(
      'DELETE FROM resources WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Recurso no encontrado' },
        { status: 404 }
      );
    }

    console.log('Resource deleted successfully:', id);

    return NextResponse.json({
      message: 'Recurso eliminado exitosamente',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar recurso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
