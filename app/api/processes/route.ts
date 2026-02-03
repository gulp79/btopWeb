import { NextRequest, NextResponse } from 'next/server';
import { getProcessMetrics } from '@/lib/metrics/processes';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sort = searchParams.get('sort') || 'cpu';
  const filter = searchParams.get('filter') || '';
  const limit = parseInt(searchParams.get('limit') || '200');

  try {
    const processes = await getProcessMetrics(sort, filter, limit);
    return NextResponse.json(processes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    );
  }
}
