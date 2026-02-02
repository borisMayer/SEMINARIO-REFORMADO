import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (area) {
      sql += ` AND area = $${paramCount}`;
      params.push(area);
      paramCount++;
    }

    if (type) {
      sql += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (search) {
      sql += ` AND (title ILIKE $${paramCount} OR abstract ILIKE $${paramCount} OR $${paramCount} = ANY(authors))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    console.log('Fetching resources with filters:', { area, type, search });
    
    const result = await query(sql, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener recursos', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, authors, area, type, year, abstract, tags, file_url } = body;

    if (!title || !area) {
      return NextResponse.json(
        { 
          error: 'Faltan campos requeridos',
          required: ['title', 'area'],
          received: { title: !!title, area: !!area }
        },
        { status: 400 }
      );
    }

    console.log('Creating new resource:', { title, area, type });

    const result = await query(
      `INSERT INTO resources (title, authors, area, type, year, abstract, tags, file_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        title, 
        authors || [], 
        area, 
        type || 'PDF', 
        year || new Date().getFullYear().toString(), 
        abstract || '', 
        tags || [], 
        file_url || ''
      ]
    );

    console.log('Resource created successfully:', result.rows[0].id);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear recurso', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
