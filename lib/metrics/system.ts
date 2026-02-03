import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { hostname } from 'os';

const execAsync = promisify(exec);

export interface SystemInfo {
  hostname: string;
  kernel: string;
  uptimeSec: number;
  uptimeFormatted: string;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
}

export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    const uptimeData = await readFile('/proc/uptime', 'utf-8');
    const uptimeSec = Math.floor(parseFloat(uptimeData.split(' ')[0]));

    let kernel = '';
    try {
      const { stdout } = await execAsync('uname -r', { timeout: 1000 });
      kernel = stdout.trim();
    } catch {
      kernel = 'unknown';
    }

    return {
      hostname: hostname(),
      kernel,
      uptimeSec,
      uptimeFormatted: formatUptime(uptimeSec),
    };
  } catch (error) {
    console.error('Error reading system info:', error);
    return {
      hostname: hostname(),
      kernel: 'unknown',
      uptimeSec: 0,
      uptimeFormatted: '0m',
    };
  }
}
