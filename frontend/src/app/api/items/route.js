import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { module_id, type, title, content_url, order_index } = body;

    if (!module_id || !type || !title) {
      return NextResponse.json(
        { 
          error: 'Faltan campos requeridos',
          required: ['module_id', 'type', 'title'],
          received: { 
            module_id: !!module_id, 
            type: !!type, 
            title: !!title 
          }
        },
        { status: 400 }
      );
    }

    console.log('Creating new item:', { module_id, type, title });

    const result = await query(
      `INSERT INTO module_items (module_id, type, title, content_url, order_index, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [module_id, type, title, content_url || null, order_index || 0]
    );

    console.log('Item created successfully:', result.rows[0].id);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear item', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
