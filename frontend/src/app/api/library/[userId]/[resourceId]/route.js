import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  try {
    const { userId, resourceId } = params;
    
    console.log('Removing from library:', { userId, resourceId });
    
    const result = await query(
      'DELETE FROM user_library WHERE user_id = $1 AND resource_id = $2 RETURNING *',
      [userId, resourceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró en la biblioteca' },
        { status: 404 }
      );
    }

    console.log('Removed from library successfully');

    return NextResponse.json({
      message: 'Eliminado de la biblioteca exitosamente'
    });
  } catch (error) {
    console.error('Error removing from library:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar de biblioteca', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
