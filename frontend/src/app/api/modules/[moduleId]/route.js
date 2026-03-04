import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const { moduleId } = params;
    const body = await request.json();
    const { title, order_index, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE modules
          SET title       = $1,
              order_index = COALESCE($2, order_index),
              description = COALESCE($3, description)
        WHERE id = $4
      RETURNING *`,
      [title, order_index ?? null, description ?? null, moduleId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Error al actualizar módulo', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { moduleId } = params;
    await query('DELETE FROM modules WHERE id = $1', [moduleId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Error al eliminar módulo', details: error.message },
      { status: 500 }
    );
  }
}
