import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { course_id, title, order_index } = body;

    if (!course_id || !title) {
      return NextResponse.json(
        { 
          error: 'Faltan campos requeridos',
          required: ['course_id', 'title'],
          received: { course_id: !!course_id, title: !!title }
        },
        { status: 400 }
      );
    }

    console.log('Creating new module:', { course_id, title });

    const result = await query(
      `INSERT INTO modules (course_id, title, order_index, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [course_id, title, order_index || 0]
    );

    console.log('Module created successfully:', result.rows[0].id);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear módulo', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
