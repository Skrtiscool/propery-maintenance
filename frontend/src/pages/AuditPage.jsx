import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../hooks/useApi';
import toast from 'react-hot-toast';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/audit')
      .then((r) => setLogs(r.data))
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false));
  }, []);

  const actionColor = (action) => {
    if (action?.includes('CREATED')) return 'text-green-600';
    if (action?.includes('UPDATED') || action?.includes('STATUS')) return 'text-blue-600';
    if (action?.includes('DELETED')) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="animate-pulse bg-gray-200 h-12 rounded" />)}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No audit logs yet</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Action</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{log.user_name || 'System'}</td>
                    <td className="px-5 py-3">
                      <span className={`font-medium text-xs ${actionColor(log.action)}`}>
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
