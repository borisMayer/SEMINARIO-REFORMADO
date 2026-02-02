import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { courseId } = params;
    
    console.log('Fetching modules for course:', courseId);
    
    const result = await query(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index',
      [courseId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener módulos', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
