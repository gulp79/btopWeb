import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DiskMetrics {
  device: string;
  mount: string;
  fstype: string;
  size: number;
  used: number;
  avail: number;
}

const EXCLUDED_FSTYPES = ['proc', 'sysfs', 'tmpfs', 'devtmpfs', 'devpts', 'cgroup', 'cgroup2', 'pstore', 'bpf', 'securityfs', 'debugfs', 'tracefs', 'fusectl', 'configfs'];

export async function getDiskMetrics(): Promise<DiskMetrics[]> {
  try {
    const { stdout } = await execAsync('df -B1 -T -x squashfs', { timeout: 3000 });
    const lines = stdout.trim().split('\n').slice(1);
    const disks: DiskMetrics[] = [];

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 7) {
        const device = parts[0];
        const fstype = parts[1];
        const size = parseInt(parts[2]);
        const used = parseInt(parts[3]);
        const avail = parseInt(parts[4]);
        const mount = parts[6];

        if (EXCLUDED_FSTYPES.includes(fstype)) {
          continue;
        }

        if (mount.startsWith('/sys') || mount.startsWith('/proc') || mount.startsWith('/dev')) {
          continue;
        }

        if (size === 0) {
          continue;
        }

        disks.push({
          device,
          mount,
          fstype,
          size,
          used,
          avail,
        });
      }
    }

    return disks.sort((a, b) => {
      if (a.mount === '/') return -1;
      if (b.mount === '/') return 1;
      return a.mount.localeCompare(b.mount);
    });
  } catch (error) {
    console.error('Error reading disk metrics:', error);
    return [];
  }
}
