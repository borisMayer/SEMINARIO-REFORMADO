// frontend/src/app/api/items/[id]/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// DELETE - Eliminar item
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await query('DELETE FROM module_items WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item', details: error.message },
      { status: 500 }
    );
  }
}
