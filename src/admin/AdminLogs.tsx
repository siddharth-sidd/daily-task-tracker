import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { AdminAuditLog } from '../types/index.ts';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log record of configuration updates, user status modifications, and system events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-bold text-white font-sans text-xs">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-teal-400">{log.adminName}</td>
                  <td className="py-3 px-4 text-slate-400 uppercase text-[10px]">
                    {log.targetType}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs">{log.details}</td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
