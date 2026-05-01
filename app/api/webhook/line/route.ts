import { NextResponse } from 'next/server';

export async function POST() {
  // Minimal stub for LINE webhook validation
  return new NextResponse('OK', { status: 200 });
}
