import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    results: [],
    page: 1,
    totalPages: 0,
    totalResults: 0
  });
}
