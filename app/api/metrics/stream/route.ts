import { getCPUMetrics } from '@/lib/metrics/cpu';
import { getMemoryMetrics, getSwapMetrics } from '@/lib/metrics/memory';
import { getNetworkMetrics } from '@/lib/metrics/network';
import { getDiskMetrics } from '@/lib/metrics/disks';
import { getProcessMetrics } from '@/lib/metrics/processes';
import { getSystemInfo } from '@/lib/metrics/system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendMetrics = async () => {
        try {
          const [system, cpu, memory, swap, network, disks, processes] = await Promise.all([
            getSystemInfo(),
            getCPUMetrics(),
            getMemoryMetrics(),
            getSwapMetrics(),
            getNetworkMetrics(),
            getDiskMetrics(),
            getProcessMetrics('cpu', '', 200),
          ]);

          const data = {
            ts: Date.now(),
            host: system,
            cpu,
            mem: memory,
            swap,
            net: network,
            disks,
            processes,
          };

          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error collecting metrics:', error);
        }
      };

      await sendMetrics();
      const interval = setInterval(sendMetrics, 1000);

      const cleanup = () => {
        clearInterval(interval);
      };

      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
