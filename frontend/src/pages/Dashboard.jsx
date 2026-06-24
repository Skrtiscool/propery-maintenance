import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import AppLayout from '../components/AppLayout';
import KanbanBoard from '../components/KanbanBoard';
import CreateRequestModal from '../components/CreateRequestModal';
import RequestDetailModal from '../components/RequestDetailModal';
import api from '../hooks/useApi';
import toast from 'react-hot-toast';

function StatsCard({ label, count, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white font-bold text-sm`}>
        {count}
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-bold text-gray-900">{count}</div>
      </div>
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const socketRef = useRef(null);

  const fetchTasks = useCallback(async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await api.get('/api/requests', { params });
      setTasks(res.data);
      setPendingCount(res.data.filter((t) => t.status === 'PENDING').length);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (user?.force_password_change) {
      setShowChangePw(true);
      toast('Please change your password before continuing', { icon: '\u{1F512}' });
    }
  }, [user]);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL || '', {
      transports: ['websocket', 'polling'],
    });
    const socket = socketRef.current;

    socket.on('request-status-update', (updated) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t)));
      toast(`Request moved to ${updated.status.replace(/_/g, ' ')}`, { icon: '\u{1F504}' });
    });

    socket.on('high-priority-request', (req) => {
      setTasks((prev) => [req, ...prev]);
      toast(`${req.priority} priority: ${req.title}`, { icon: '\u{1F534}' });
    });

    socket.on('request-deleted', (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast('Request deleted', { icon: '\u{1F5D1}' });
    });

    return () => socket.disconnect();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSubmitting(true);
    try {
      await api.post('/api/auth/change-password', pwForm);
      toast.success('Password changed successfully');
      setShowChangePw(false);
      setPwForm({ current_password: '', new_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await api.patch(`/api/requests/${taskId}/status`, { status: newStatus });
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await api.delete(`/api/requests/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelectedRequest(null);
      toast.success('Request deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    return t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.property_name?.toLowerCase().includes(q) || t.assigned_to_name?.toLowerCase().includes(q);
  });

  const stats = [
    { label: 'Pending', count: filteredTasks.filter((t) => t.status === 'PENDING').length, color: 'bg-gray-500' },
    { label: 'In Progress', count: filteredTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length, color: 'bg-yellow-500' },
    { label: 'Completed', count: filteredTasks.filter((t) => t.status === 'COMPLETED').length, color: 'bg-green-500' },
    { label: 'Total', count: filteredTasks.length, color: 'bg-blue-500' },
  ];

  return (
    <AppLayout pendingCount={pendingCount}>
      <div className="flex flex-col min-w-0">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
              <input type="text" placeholder="Search cards..." value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_PARTS">Waiting Parts</option>
                <option value="COMPLETED">Completed</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              + New Request
            </button>
          </div>
        </header>

        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pt-4 pb-2">
            {stats.map((s) => <StatsCard key={s.label} {...s} />)}
          </div>
        )}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pt-4 pb-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
          </div>
        )}

        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium mb-1">No requests yet</p>
              <p className="text-sm mb-4">Create your first maintenance request to get started.</p>
              <button onClick={() => setShowCreate(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                + New Request
              </button>
            </div>
          ) : (
            <KanbanBoard tasks={filteredTasks} onMoveTask={handleMoveTask} onCardClick={(task) => setSelectedRequest(task)} userRole={user?.role} />
          )}
        </main>
      </div>

      {showCreate && (
        <CreateRequestModal
          onClose={() => setShowCreate(false)}
          onCreated={(req) => {
            setTasks((prev) => [req, ...prev]);
            setPendingCount((c) => c + 1);
          }}
        />
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={(updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))}
          onDelete={handleDeleteRequest}
        />
      )}

      {showChangePw && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" required value={pwForm.current_password}
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" required value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                {!user?.force_password_change && (
                  <button type="button" onClick={() => setShowChangePw(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                )}
                <button type="submit" disabled={pwSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {pwSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
