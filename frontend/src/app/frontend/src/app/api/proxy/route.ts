// src/app/api/proxy/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'El parámetro "path" es requerido' }, { status: 400 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en el proxy:', error);
    return NextResponse.json({ error: 'Error al conectar con la API' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'El parámetro "path" es requerido' }, { status: 0 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;
  const body = await request.json();

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en el proxy:', error);
    return NextResponse.json({ error: 'Error al conectar con la API' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'El parámetro "path" es requerido' }, { status: 400 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;
  const body = await request.json();

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en el proxy:', error);
    return NextResponse.json({ error: 'Error al conectar con la API' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'El parámetro "path" es requerido' }, { status: 400 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en el proxy:', error);
    return NextResponse.json({ error: 'Error al conectar con la API' }, { status: 500 });
  }
}
