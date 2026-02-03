import { SystemInfo } from '@/lib/types/metrics';
import { Activity, ActivitySquare } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  error: string | null;
  systemInfo?: SystemInfo;
}

export default function Header({ connected, error, systemInfo }: HeaderProps) {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#151515] border border-cyan-900/30 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ActivitySquare className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            BTOP Web Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-gray-400">
              {error ? error : connected ? '1000ms' : 'Connecting...'}
            </span>
          </div>

          <div className="text-cyan-400 font-semibold text-lg">
            {timeString}
          </div>

          {systemInfo && (
            <>
              <div className="text-gray-400">
                <span className="text-cyan-400">{systemInfo.hostname}</span>
              </div>
              <div className="text-gray-500">
                {systemInfo.kernel}
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">up</span> {systemInfo.uptimeFormatted}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
