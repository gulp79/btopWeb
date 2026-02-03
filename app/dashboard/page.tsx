'use client';

import { useState, useEffect } from 'react';
import { MetricsData } from '@/lib/types/metrics';
import Header from '@/components/dashboard/Header';
import CPUPanel from '@/components/dashboard/CPUPanel';
import MemoryPanel from '@/components/dashboard/MemoryPanel';
import SwapPanel from '@/components/dashboard/SwapPanel';
import NetworkPanel from '@/components/dashboard/NetworkPanel';
import DisksPanel from '@/components/dashboard/DisksPanel';
import ProcessesPanel from '@/components/dashboard/ProcessesPanel';
import Footer from '@/components/dashboard/Footer';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource('/api/metrics/stream');

        eventSource.onopen = () => {
          setConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: MetricsData = JSON.parse(event.data);
            setMetrics(data);
          } catch (e) {
            console.error('Failed to parse metrics:', e);
          }
        };

        eventSource.onerror = () => {
          setConnected(false);
          setError('Connection lost. Reconnecting...');
          eventSource?.close();
          setTimeout(connect, 3000);
        };
      } catch (e) {
        console.error('Failed to connect:', e);
        setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-mono">
      <div className="container mx-auto p-4 max-w-[2000px]">
        <Header
          connected={connected}
          error={error}
          systemInfo={metrics?.host}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr_1fr] gap-4 mt-4">
          <div className="flex flex-col gap-4">
            <MemoryPanel data={metrics?.mem} />
            <SwapPanel data={metrics?.swap} />
            <NetworkPanel data={metrics?.net} />
          </div>

          <div className="flex flex-col gap-4">
            <CPUPanel data={metrics?.cpu} />
          </div>

          <div className="flex flex-col gap-4">
            <DisksPanel data={metrics?.disks} />
            <ProcessesPanel data={metrics?.processes} />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
