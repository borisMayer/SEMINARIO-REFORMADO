import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
