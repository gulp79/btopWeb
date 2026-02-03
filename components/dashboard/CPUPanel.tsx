import { CPUMetrics } from '@/lib/types/metrics';
import { Cpu } from 'lucide-react';

interface CPUPanelProps {
  data?: CPUMetrics;
}

export default function CPUPanel({ data }: CPUPanelProps) {
  if (!data) {
    return (
      <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading CPU data...</div>
      </div>
    );
  }

  const colors = [
    'bg-cyan-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-purple-500',
  ];

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-cyan-400">CPU</h2>
        <div className="ml-auto text-sm text-gray-400">
          {data.cores} cores
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Total Usage</span>
              <span className="text-cyan-400 font-semibold">{data.totalPct.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(data.totalPct, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {data.perCorePct.map((pct, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">C{i}</span>
                  <div className="flex items-center gap-2">
                    {data.freqMHz[i] > 0 && (
                      <span className="text-gray-600">{data.freqMHz[i]} MHz</span>
                    )}
                    <span className="text-cyan-400 font-semibold w-12 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-gray-900 rounded overflow-hidden border border-gray-800">
                  <div
                    className={`h-full ${colors[i % colors.length]} transition-all duration-500`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded p-3">
            <div className="text-sm text-gray-400 mb-2">Load Average</div>
            <div className="flex gap-4 text-cyan-400 font-semibold">
              <div>
                <div className="text-xs text-gray-500">1min</div>
                <div>{data.loadAvg[0].toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">5min</div>
                <div>{data.loadAvg[1].toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">15min</div>
                <div>{data.loadAvg[2].toFixed(2)}</div>
              </div>
            </div>
          </div>

          {data.tempsC.length > 0 && (
            <div className="bg-[#0a0a0a] border border-gray-800 rounded p-3">
              <div className="text-sm text-gray-400 mb-2">Temperature</div>
              <div className="flex flex-wrap gap-3">
                {data.tempsC.map((temp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Zone {i}</span>
                    <span className={`font-semibold ${temp > 80 ? 'text-red-400' : temp > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {temp.toFixed(1)}°C
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
