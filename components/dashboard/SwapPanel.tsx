import { SwapMetrics } from '@/lib/types/metrics';
import { HardDrive } from 'lucide-react';

interface SwapPanelProps {
  data?: SwapMetrics;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function SwapPanel({ data }: SwapPanelProps) {
  if (!data || data.total === 0) {
    return (
      <div className="bg-[#121212] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-cyan-400">Swap</h2>
        </div>
        <div className="text-gray-500 text-sm">No swap configured</div>
      </div>
    );
  }

  const usedPct = (data.used / data.total) * 100;

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-semibold text-cyan-400">Swap</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Total</span>
            <span className="text-gray-300">{formatBytes(data.total)}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Used</span>
            <span className="text-cyan-400 font-semibold">
              {formatBytes(data.used)} ({usedPct.toFixed(1)}%)
            </span>
          </div>
          <div className="h-4 bg-gray-900 rounded overflow-hidden border border-gray-800">
            <div
              className={`h-full transition-all duration-500 ${
                usedPct > 85 ? 'bg-red-500' : usedPct > 60 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <span className="text-gray-400">Free</span>
            <span className="text-gray-300">{formatBytes(data.free)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
