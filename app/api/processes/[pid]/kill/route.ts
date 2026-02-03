import { NextRequest, NextResponse } from 'next/server';
import { killProcess } from '@/lib/metrics/processes';

export async function POST(
  request: NextRequest,
  { params }: { params: { pid: string } }
) {
  try {
    const body = await request.json();
    const { signal } = body;

    if (signal !== 'TERM' && signal !== 'KILL') {
      return NextResponse.json(
        { error: 'Invalid signal. Must be TERM or KILL' },
        { status: 400 }
      );
    }

    const pid = parseInt(params.pid);
    if (isNaN(pid)) {
      return NextResponse.json(
        { error: 'Invalid PID' },
        { status: 400 }
      );
    }

    const result = await killProcess(pid, signal);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to kill process' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to kill process' },
      { status: 500 }
    );
  }
}
