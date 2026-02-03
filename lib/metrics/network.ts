import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface NetworkMetrics {
  activeInterface: string;
  publicIp: string;
  localIp: string;
  rxBps: number;
  txBps: number;
  rxTotal: number;
  txTotal: number;
  hasInternet: boolean;
}

interface NetworkStats {
  interface: string;
  rxBytes: number;
  txBytes: number;
  timestamp: number;
}

let lastNetworkStats: NetworkStats | null = null;

async function getDefaultInterface(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('ip route show default', { timeout: 1000 });
    const match = stdout.match(/default via [\d.]+ dev (\S+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function getInterfaceIP(iface: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`ip -4 addr show ${iface}`, { timeout: 1000 });
    const match = stdout.match(/inet ([\d.]+)/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

async function checkInternetConnectivity(): Promise<boolean> {
  try {
    await execAsync('ping -c 1 -W 1 1.1.1.1', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

async function getPublicIP(): Promise<string> {
  try {
    const { stdout } = await execAsync('curl -s --max-time 2 https://api.ipify.org', { timeout: 3000 });
    return stdout.trim();
  } catch {
    return '';
  }
}

async function getInterfaceStats(iface: string): Promise<{ rxBytes: number; txBytes: number } | null> {
  try {
    const rxData = await readFile(`/sys/class/net/${iface}/statistics/rx_bytes`, 'utf-8');
    const txData = await readFile(`/sys/class/net/${iface}/statistics/tx_bytes`, 'utf-8');

    return {
      rxBytes: parseInt(rxData.trim()),
      txBytes: parseInt(txData.trim()),
    };
  } catch {
    return null;
  }
}

export async function getNetworkMetrics(): Promise<NetworkMetrics> {
  const defaultIface = await getDefaultInterface();

  if (!defaultIface) {
    return {
      activeInterface: 'none',
      publicIp: '',
      localIp: '',
      rxBps: 0,
      txBps: 0,
      rxTotal: 0,
      txTotal: 0,
      hasInternet: false,
    };
  }

  const stats = await getInterfaceStats(defaultIface);
  const localIp = await getInterfaceIP(defaultIface);

  if (!stats) {
    return {
      activeInterface: defaultIface,
      publicIp: '',
      localIp,
      rxBps: 0,
      txBps: 0,
      rxTotal: 0,
      txTotal: 0,
      hasInternet: false,
    };
  }

  const now = Date.now();
  let rxBps = 0;
  let txBps = 0;

  if (lastNetworkStats && lastNetworkStats.interface === defaultIface) {
    const timeDiff = (now - lastNetworkStats.timestamp) / 1000;
    if (timeDiff > 0 && timeDiff < 5) {
      rxBps = Math.max(0, (stats.rxBytes - lastNetworkStats.rxBytes) / timeDiff);
      txBps = Math.max(0, (stats.txBytes - lastNetworkStats.txBytes) / timeDiff);
    }
  }

  lastNetworkStats = {
    interface: defaultIface,
    rxBytes: stats.rxBytes,
    txBytes: stats.txBytes,
    timestamp: now,
  };

  const hasInternet = await checkInternetConnectivity();
  let publicIp = '';

  if (hasInternet) {
    publicIp = await getPublicIP();
  }

  return {
    activeInterface: defaultIface,
    publicIp,
    localIp,
    rxBps: Math.round(rxBps),
    txBps: Math.round(txBps),
    rxTotal: stats.rxBytes,
    txTotal: stats.txBytes,
    hasInternet,
  };
}
