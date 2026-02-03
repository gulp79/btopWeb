import { DiskMetrics } from '@/lib/types/metrics';
import { HardDrive } from 'lucide-react';

interface DisksPanelProps {
  data?: DiskMetrics[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function DisksPanel({ data }: DisksPanelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#121212] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-cyan-400">Disks</h2>
        </div>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 shadow-lg max-h-[500px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-semibold text-cyan-400">Disks</h2>
      </div>

      <div className="space-y-4">
        {data.map((disk, idx) => {
          const usedPct = (disk.used / disk.size) * 100;

          return (
            <div key={idx} className="bg-[#0a0a0a] border border-gray-800 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-cyan-400 font-semibold text-sm truncate">
                    {disk.mount}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {disk.device} • {disk.fstype}
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm text-gray-300">
                    {formatBytes(disk.used)}
                  </div>
                  <div className="text-xs text-gray-500">
                    of {formatBytes(disk.size)}
                  </div>
                </div>
              </div>

              <div className="mb-1">
                <div className="h-3 bg-gray-900 rounded overflow-hidden border border-gray-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      usedPct > 85
                        ? 'bg-red-500'
                        : usedPct > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usedPct, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-500">
                  {usedPct.toFixed(1)}% used
                </span>
                <span className="text-gray-500">
                  {formatBytes(disk.avail)} free
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
