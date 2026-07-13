import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/health`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(
        { status: 'error', message: 'FastAPI health check failed' },
        { status: 503 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Could not connect to FastAPI server' },
      { status: 503 }
    );
  }
}

