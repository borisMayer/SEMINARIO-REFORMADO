import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, resource_id } = body;

    if (!user_id || !resource_id) {
      return NextResponse.json(
        { 
          error: 'Faltan campos requeridos',
          required: ['user_id', 'resource_id'],
          received: { user_id: !!user_id, resource_id: !!resource_id }
        },
        { status: 400 }
      );
    }

    console.log('Saving to library:', { user_id, resource_id });

    // Verificar si ya existe
    const existing = await query(
      'SELECT * FROM user_library WHERE user_id = $1 AND resource_id = $2',
      [user_id, resource_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: 'Ya existe en la biblioteca' },
        { status: 200 }
      );
    }

    const result = await query(
      `INSERT INTO user_library (user_id, resource_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [user_id, resource_id]
    );

    console.log('Saved to library successfully');

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error saving to library:', error);
    return NextResponse.json(
      { 
        error: 'Error al guardar en biblioteca', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
