// frontend/src/app/api/admin/stats/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener estadísticas de la base de datos
    const resourcesResult = await query('SELECT COUNT(*) as count FROM resources');
    const coursesResult = await query('SELECT COUNT(*) as count FROM courses WHERE is_active = true');
    const libraryResult = await query('SELECT COUNT(DISTINCT user_id) as count FROM user_library');
    
    const stats = {
      totalResources: parseInt(resourcesResult.rows[0].count),
      activeCourses: parseInt(coursesResult.rows[0].count),
      libraryUsers: parseInt(libraryResult.rows[0].count)
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}
