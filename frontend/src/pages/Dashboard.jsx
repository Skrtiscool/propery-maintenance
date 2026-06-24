import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import KanbanBoard from '../components/KanbanBoard';
import CreateRequestModal from '../components/CreateRequestModal';
import RequestDetailModal from '../components/RequestDetailModal';
import api from '../hooks/useApi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    if (user?.force_password_change) {
      setShowChangePw(true);
      toast('Please change your password before continuing', { icon: '\u{1F512}' });
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await api.get('/api/requests', { params });
      setTasks(res.data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

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
      toast.success('Status updated');
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update status');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-w-0">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              + New Request
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : (
            <KanbanBoard tasks={tasks} onMoveTask={handleMoveTask} onCardClick={(task) => setSelectedRequest(task)} userRole={user?.role} />
          )}
        </main>
      </div>

      {showCreate && (
        <CreateRequestModal
          onClose={() => setShowCreate(false)}
          onCreated={(req) => setTasks((prev) => [req, ...prev])}
        />
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={(updated) =>
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          }
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
