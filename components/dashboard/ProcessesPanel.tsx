'use client';

import { useState } from 'react';
import { ProcessMetrics } from '@/lib/types/metrics';
import { Activity, Search, X, Skull } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProcessesPanelProps {
  data?: ProcessMetrics;
}

export default function ProcessesPanel({ data }: ProcessesPanelProps) {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'cpu' | 'mem'>('cpu');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [killSignal, setKillSignal] = useState<'TERM' | 'KILL'>('TERM');
  const [showKillDialog, setShowKillDialog] = useState(false);

  if (!data) {
    return (
      <div className="bg-[#121212] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-cyan-400">Processes</h2>
        </div>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  const filteredProcesses = data.list.filter((proc) => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      proc.command.toLowerCase().includes(searchTerm) ||
      proc.user.toLowerCase().includes(searchTerm) ||
      proc.pid.toString().includes(searchTerm)
    );
  });

  const handleKill = async () => {
    if (!selectedPid) return;

    try {
      const response = await fetch(`/api/processes/${selectedPid}/kill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal: killSignal }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to kill process: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to kill process');
    }

    setShowKillDialog(false);
    setSelectedPid(null);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'R':
        return 'text-green-400';
      case 'S':
        return 'text-blue-400';
      case 'D':
        return 'text-yellow-400';
      case 'Z':
        return 'text-red-400';
      case 'T':
        return 'text-gray-400';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 shadow-lg flex flex-col h-[600px]">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-semibold text-cyan-400">Processes</h2>
        <span className="text-xs text-gray-500">({data.total})</span>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter processes..."
            className="pl-8 pr-8 h-8 text-sm bg-[#0a0a0a] border-gray-700"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant={sortBy === 'cpu' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('cpu')}
          className="h-8"
        >
          CPU
        </Button>
        <Button
          variant={sortBy === 'mem' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('mem')}
          className="h-8"
        >
          MEM
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#0a0a0a] border-b border-gray-800">
            <tr className="text-left text-gray-400">
              <th className="p-2 font-semibold">PID</th>
              <th className="p-2 font-semibold">User</th>
              <th className="p-2 font-semibold">Command</th>
              <th className="p-2 font-semibold text-right">CPU%</th>
              <th className="p-2 font-semibold text-right">MEM%</th>
              <th className="p-2 font-semibold text-right">RSS</th>
              <th className="p-2 font-semibold">Time</th>
              <th className="p-2 font-semibold text-center">S</th>
              <th className="p-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.map((proc) => (
              <tr
                key={proc.pid}
                className="border-b border-gray-800/50 hover:bg-[#0a0a0a] transition-colors"
              >
                <td className="p-2 text-gray-400">{proc.pid}</td>
                <td className="p-2 text-gray-400">{proc.user}</td>
                <td className="p-2 text-cyan-400 truncate max-w-[200px]">
                  {proc.command}
                </td>
                <td className="p-2 text-right text-green-400 font-semibold">
                  {proc.cpu.toFixed(1)}
                </td>
                <td className="p-2 text-right text-blue-400 font-semibold">
                  {proc.mem.toFixed(1)}
                </td>
                <td className="p-2 text-right text-gray-300">
                  {proc.rssMB}M
                </td>
                <td className="p-2 text-gray-400">{proc.etime}</td>
                <td className={`p-2 text-center font-semibold ${getStateColor(proc.state)}`}>
                  {proc.state}
                </td>
                <td className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPid(proc.pid);
                      setKillSignal('TERM');
                      setShowKillDialog(true);
                    }}
                    className="h-6 w-6 p-0 hover:bg-red-900/20"
                  >
                    <Skull className="w-3 h-3 text-red-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProcesses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No processes found
          </div>
        )}
      </div>

      <AlertDialog open={showKillDialog} onOpenChange={setShowKillDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kill Process {selectedPid}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will send a signal to terminate the process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 my-4">
            <Button
              variant={killSignal === 'TERM' ? 'default' : 'outline'}
              onClick={() => setKillSignal('TERM')}
              className="flex-1"
            >
              SIGTERM (graceful)
            </Button>
            <Button
              variant={killSignal === 'KILL' ? 'destructive' : 'outline'}
              onClick={() => setKillSignal('KILL')}
              className="flex-1"
            >
              SIGKILL (force)
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleKill}>
              Kill Process
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
