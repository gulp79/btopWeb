export interface SystemInfo {
  hostname: string;
  kernel: string;
  uptimeSec: number;
  uptimeFormatted: string;
}

export interface CPUMetrics {
  cores: number;
  totalPct: number;
  perCorePct: number[];
  freqMHz: number[];
  loadAvg: number[];
  tempsC: number[];
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  available: number;
  buffers: number;
  cached: number;
}

export interface SwapMetrics {
  total: number;
  used: number;
  free: number;
}

export interface NetworkMetrics {
  activeInterface: string;
  publicIp: string;
  localIp: string;
  rxBps: number;
  txBps: number;
  rxTotal: number;
  txTotal: number;
  hasInternet: boolean;
}

export interface DiskMetrics {
  device: string;
  mount: string;
  fstype: string;
  size: number;
  used: number;
  avail: number;
}

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

export interface MetricsData {
  ts: number;
  host: SystemInfo;
  cpu: CPUMetrics;
  mem: MemoryMetrics;
  swap: SwapMetrics;
  net: NetworkMetrics;
  disks: DiskMetrics[];
  processes: ProcessMetrics;
}
