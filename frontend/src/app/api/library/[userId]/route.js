import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    
    console.log('Fetching library for user:', userId);
    
    const result = await query(
      `SELECT r.* 
       FROM resources r
       INNER JOIN user_library ul ON r.id = ul.resource_id
       WHERE ul.user_id = $1
       ORDER BY ul.created_at DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener biblioteca', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
