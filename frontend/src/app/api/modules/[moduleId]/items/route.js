import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { moduleId } = params;
    
    console.log('Fetching items for module:', moduleId);
    
    const result = await query(
      'SELECT * FROM module_items WHERE module_id = $1 ORDER BY order_index',
      [moduleId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener items', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
