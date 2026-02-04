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
  let intervalId: NodeJS.Timeout;

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
          
          // Tentiamo l'invio. Se il controller è chiuso, Node 25+ lancerà un errore.
          controller.enqueue(encoder.encode(message));
        } catch (error: any) {
          // Se lo stream è chiuso, fermiamo l'intervallo ed evitiamo il log di errore
          if (error.code === 'ERR_INVALID_STATE' || error.message?.includes('closed')) {
            clearInterval(intervalId);
          } else {
            console.error('Error collecting metrics:', error);
          }
        }
      };

      // Primo invio immediato
      await sendMetrics();
      
      // Setup dell'intervallo
      intervalId = setInterval(sendMetrics, 1000);
    },
    cancel() {
      // Questo metodo viene chiamato automaticamente quando il browser chiude la connessione
      if (intervalId) {
        clearInterval(intervalId);
      }
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
