import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: number;
  user: string;
  command: string;
  cpu: number;
  mem: number;
  rssMB: number;
  etime: string;
  ni: number;
  state: string;
}

export interface ProcessMetrics {
  total: number;
  list: ProcessInfo[];
}

function formatElapsedTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d${hours}h`;
  } else if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }
}

export async function getProcessMetrics(sortBy: string = 'cpu', filter: string = '', limit: number = 200): Promise<ProcessMetrics> {
  try {
    const sortFlag = sortBy === 'mem' ? '-pmem' : '-pcpu';
    const { stdout } = await execAsync(
      `ps -eo pid,user,comm,pcpu,pmem,rss,etimes,ni,state --sort=${sortFlag} | head -n ${limit + 1}`,
      { timeout: 3000, maxBuffer: 1024 * 1024 * 10 }
    );

    const lines = stdout.trim().split('\n').slice(1);
    const processes: ProcessInfo[] = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 9) {
        const pid = parseInt(parts[0]);
        const user = parts[1];
        const command = parts[2];
        const cpu = parseFloat(parts[3]);
        const mem = parseFloat(parts[4]);
        const rss = parseInt(parts[5]);
        const etimes = parseInt(parts[6]);
        const ni = parseInt(parts[7]);
        const state = parts[8];

        if (filter) {
          const searchTerm = filter.toLowerCase();
          if (!command.toLowerCase().includes(searchTerm) && !user.toLowerCase().includes(searchTerm)) {
            continue;
          }
        }

        processes.push({
          pid,
          user,
          command,
          cpu: Math.round(cpu * 10) / 10,
          mem: Math.round(mem * 10) / 10,
          rssMB: Math.round(rss / 1024),
          etime: formatElapsedTime(etimes),
          ni,
          state,
        });
      }
    }

    return {
      total: processes.length,
      list: processes,
    };
  } catch (error) {
    console.error('Error reading process metrics:', error);
    return {
      total: 0,
      list: [],
    };
  }
}

export async function killProcess(pid: number, signal: 'TERM' | 'KILL'): Promise<{ success: boolean; error?: string }> {
  try {
    const sig = signal === 'KILL' ? 9 : 15;
    await execAsync(`kill -${sig} ${pid}`, { timeout: 2000 });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to kill process'
    };
  }
}
