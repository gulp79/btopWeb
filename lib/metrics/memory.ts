import { readFile } from 'fs/promises';

interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  available: number;
  buffers: number;
  cached: number;
}

interface SwapMetrics {
  total: number;
  used: number;
  free: number;
}

export async function getMemoryMetrics(): Promise<MemoryMetrics> {
  try {
    const data = await readFile('/proc/meminfo', 'utf-8');
    const lines = data.split('\n');
    const info: Record<string, number> = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s+(\d+)/);
      if (match) {
        info[match[1]] = parseInt(match[2]) * 1024;
      }
    }

    const total = info.MemTotal || 0;
    const available = info.MemAvailable || info.MemFree || 0;
    const free = info.MemFree || 0;
    const buffers = info.Buffers || 0;
    const cached = info.Cached || 0;
    const used = total - available;

    return {
      total,
      used,
      free,
      available,
      buffers,
      cached,
    };
  } catch (error) {
    console.error('Error reading memory metrics:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
      available: 0,
      buffers: 0,
      cached: 0,
    };
  }
}

export async function getSwapMetrics(): Promise<SwapMetrics> {
  try {
    const data = await readFile('/proc/meminfo', 'utf-8');
    const lines = data.split('\n');
    const info: Record<string, number> = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s+(\d+)/);
      if (match) {
        info[match[1]] = parseInt(match[2]) * 1024;
      }
    }

    const total = info.SwapTotal || 0;
    const free = info.SwapFree || 0;
    const used = total - free;

    return {
      total,
      used,
      free,
    };
  } catch (error) {
    console.error('Error reading swap metrics:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
    };
  }
}
