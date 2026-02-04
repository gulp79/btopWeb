import { NetworkMetrics } from '@/lib/types/metrics';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkPanelProps {
  data?: NetworkMetrics;
}

function formatBps(bps: number): string {
  if (bps === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bps) / Math.log(k));
  return `${((bps ?? 0) / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${((bytes ?? 0) / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export default function NetworkPanel({ data }: NetworkPanelProps) {
  if (!data || data.activeInterface === 'none') {
    return (
      <div className="bg-[#121212] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <WifiOff className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">Network</h2>
        </div>
        <div className="text-gray-500 text-sm">No active connection</div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Wifi className={`w-4 h-4 ${data.hasInternet ? 'text-green-400' : 'text-yellow-400'}`} />
        <h2 className="text-sm font-semibold text-cyan-400">Network</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="text-gray-400 mb-1">Interface</div>
          <div className="text-cyan-400 font-semibold">{data.activeInterface}</div>
        </div>

        <div>
          <div className="text-gray-400 mb-1">IP Address</div>
          <div className="text-gray-300">
            {data.publicIp || data.localIp}
            {!data.hasInternet && (
              <span className="ml-2 text-xs text-yellow-400">(No Internet)</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
          <div>
            <div className="text-gray-400 mb-1">Download</div>
            <div className="text-green-400 font-semibold">{formatBps(data.rxBps)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Total: {formatBytes(data.rxTotal)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Upload</div>
            <div className="text-blue-400 font-semibold">{formatBps(data.txBps)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Total: {formatBytes(data.txTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
