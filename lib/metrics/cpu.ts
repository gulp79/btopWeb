import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

interface CPUStats {
  user: number;
  nice: number;
  system: number;
  idle: number;
  iowait: number;
  irq: number;
  softirq: number;
  steal: number;
}

interface CPUMetrics {
  cores: number;
  totalPct: number;
  perCorePct: number[];
  freqMHz: number[];
  loadAvg: number[];
  tempsC: number[];
}

let lastCPUStats: CPUStats[] | null = null;
let lastTimestamp = 0;

async function readCPUStats(): Promise<CPUStats[]> {
  try {
    const data = await readFile('/proc/stat', 'utf-8');
    const lines = data.split('\n');
    const stats: CPUStats[] = [];

    for (const line of lines) {
      if (line.startsWith('cpu')) {
        const parts = line.split(/\s+/);
        if (parts[0] === 'cpu' || parts[0].match(/^cpu\d+$/)) {
          stats.push({
            user: parseInt(parts[1]) || 0,
            nice: parseInt(parts[2]) || 0,
            system: parseInt(parts[3]) || 0,
            idle: parseInt(parts[4]) || 0,
            iowait: parseInt(parts[5]) || 0,
            irq: parseInt(parts[6]) || 0,
            softirq: parseInt(parts[7]) || 0,
            steal: parseInt(parts[8]) || 0,
          });
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('Error reading CPU stats:', error);
    return [];
  }
}

function calculateCPUPercentage(
  prev: CPUStats,
  curr: CPUStats
): number {
  const prevTotal = prev.user + prev.nice + prev.system + prev.idle +
                    prev.iowait + prev.irq + prev.softirq + prev.steal;
  const currTotal = curr.user + curr.nice + curr.system + curr.idle +
                    curr.iowait + curr.irq + curr.softirq + curr.steal;

  const prevIdle = prev.idle + prev.iowait;
  const currIdle = curr.idle + curr.iowait;

  const totalDiff = currTotal - prevTotal;
  const idleDiff = currIdle - prevIdle;

  if (totalDiff === 0) return 0;

  return ((totalDiff - idleDiff) / totalDiff) * 100;
}

async function getCPUFrequencies(coreCount: number): Promise<number[]> {
  const freqs: number[] = [];

  for (let i = 0; i < coreCount; i++) {
    try {
      const path = `/sys/devices/system/cpu/cpu${i}/cpufreq/scaling_cur_freq`;
      if (existsSync(path)) {
        const data = await readFile(path, 'utf-8');
        freqs.push(Math.round(parseInt(data.trim()) / 1000));
      } else {
        freqs.push(0);
      }
    } catch {
      freqs.push(0);
    }
  }

  return freqs;
}

async function getLoadAverage(): Promise<number[]> {
  try {
    const data = await readFile('/proc/loadavg', 'utf-8');
    const parts = data.trim().split(/\s+/);
    return [
      parseFloat(parts[0]),
      parseFloat(parts[1]),
      parseFloat(parts[2]),
    ];
  } catch {
    return [0, 0, 0];
  }
}

async function getCPUTemperatures(): Promise<number[]> {
  const temps: number[] = [];

  try {
    for (let i = 0; i < 10; i++) {
      const path = `/sys/class/thermal/thermal_zone${i}/temp`;
      if (existsSync(path)) {
        const data = await readFile(path, 'utf-8');
        const temp = parseInt(data.trim()) / 1000;
        if (temp > 0 && temp < 150) {
          temps.push(Math.round(temp * 10) / 10);
        }
      } else {
        break;
      }
    }
  } catch {
  }

  return temps;
}

export async function getCPUMetrics(): Promise<CPUMetrics> {
  const currentStats = await readCPUStats();
  const now = Date.now();

  let perCorePct: number[] = [];
  let totalPct = 0;

  if (lastCPUStats && currentStats.length > 0 && now - lastTimestamp < 2000) {
    if (currentStats[0]) {
      totalPct = calculateCPUPercentage(lastCPUStats[0], currentStats[0]);
    }

    for (let i = 1; i < currentStats.length; i++) {
      if (lastCPUStats[i] && currentStats[i]) {
        perCorePct.push(calculateCPUPercentage(lastCPUStats[i], currentStats[i]));
      }
    }
  } else {
    perCorePct = new Array(currentStats.length - 1).fill(0);
  }

  lastCPUStats = currentStats;
  lastTimestamp = now;

  const coreCount = perCorePct.length;
  const freqMHz = await getCPUFrequencies(coreCount);
  const loadAvg = await getLoadAverage();
  const tempsC = await getCPUTemperatures();

  return {
    cores: coreCount,
    totalPct: Math.round(totalPct * 10) / 10,
    perCorePct: perCorePct.map(p => Math.round(p * 10) / 10),
    freqMHz,
    loadAvg: loadAvg.map(l => Math.round(l * 100) / 100),
    tempsC,
  };
}
