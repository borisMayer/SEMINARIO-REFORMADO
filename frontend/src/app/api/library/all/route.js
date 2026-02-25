// frontend/src/app/api/library/all/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query(`
      SELECT
        ul.id,
        ul.user_id,
        ul.resource_id,
        ul.status,
        ul.added_at,
        r.title   AS resource_title,
        r.authors AS resource_authors,
        r.type    AS resource_type,
        r.area    AS resource_area
      FROM user_library ul
      LEFT JOIN resources r ON ul.resource_id = r.id
      ORDER BY ul.added_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching library data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library data', details: error.message },
      { status: 500 }
    );
  }
}
