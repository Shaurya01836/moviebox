import { NextRequest, NextResponse } from 'next/server';
import { TmdbService } from '@/services/tmdb.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const data = await TmdbService.searchMulti(query, isNaN(page) ? 1 : page);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown search error';
    console.error('Search API Handler Error:', message);

    return NextResponse.json(
      {
        error: message,
        query: '',
        results: [],
        totalResults: 0,
        page: 1,
        totalPages: 0,
      },
      { status: 500 }
    );
  }
}
