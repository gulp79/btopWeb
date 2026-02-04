import { MemoryMetrics } from '@/lib/types/metrics';
import { MemoryStick } from 'lucide-react';

interface MemoryPanelProps {
  data?: MemoryMetrics;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${((bytes ?? 0) / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function MemoryPanel({ data }: MemoryPanelProps) {
  if (!data || data.total === 0) {
    return (
      <div className="bg-[#121212] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MemoryStick className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-cyan-400">Memory</h2>
        </div>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  const usedPct = (data.used / data.total) * 100;
  const buffersPct = (data.buffers / data.total) * 100;
  const cachedPct = (data.cached / data.total) * 100;
  const freePct = 100 - usedPct;

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <MemoryStick className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-semibold text-cyan-400">Memory</h2>
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
              {formatBytes(data.used)} ({(usedPct ?? 0).toFixed(1)}%)
            </span>
          </div>
          <div className="h-4 bg-gray-900 rounded overflow-hidden border border-gray-800">
            <div
              className={`h-full transition-all duration-500 ${
                usedPct > 85 ? 'bg-red-500' : usedPct > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Available</span>
            <span className="text-gray-300">{formatBytes(data.available)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-800">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Buffers</span>
            <span className="text-gray-400">{formatBytes(data.buffers)}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">Cached</span>
            <span className="text-gray-400">{formatBytes(data.cached)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
