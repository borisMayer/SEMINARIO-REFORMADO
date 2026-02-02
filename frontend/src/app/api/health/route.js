import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as time, version() as version');
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        time: result.rows[0].time,
        version: result.rows[0].version
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          error: error.message
        }
      },
      { status: 500 }
    );
  }
}
