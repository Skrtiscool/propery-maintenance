import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';
import toast from 'react-hot-toast';

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/requests');
      setRequests(res.data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/requests', form);
      toast.success('Request submitted');
      setRequests((prev) => [res.data, ...prev]);
      setForm({ title: '', description: '', priority: 'MEDIUM' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  function priorityColor(p) {
    switch (p) {
      case 'EMERGENCY': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  }

  function statusColor(s) {
    switch (s) {
      case 'PENDING': return 'bg-gray-200 text-gray-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'ASSIGNED': return 'bg-indigo-100 text-indigo-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">Property Maintenance</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Submit a Maintenance Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Leaking faucet in kitchen" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3} placeholder="Describe the issue..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">My Requests</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-500">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm">{req.title}</h3>
                    <div className="flex space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityColor(req.priority)}`}>{req.priority}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColor(req.status)}`}>{req.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  {req.description && <p className="text-xs text-gray-600 mt-1">{req.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
