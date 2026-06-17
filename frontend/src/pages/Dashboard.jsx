import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import CreateRequestModal from '../components/CreateRequestModal';
import CreateUserModal from '../components/CreateUserModal';
import RequestDetailModal from '../components/RequestDetailModal';
import api from '../hooks/useApi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await api.get('/api/requests', { params });
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">
            Property Maintenance {user?.role && <span className="text-xs text-gray-500 ml-2">({user.role.replace('_', ' ')})</span>}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              + New Request
            </button>
            {user?.role === 'HEAD_ADMIN' && (
              <button onClick={() => setShowCreateUser(true)}
                className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700">
                + New User
              </button>
            )}
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center space-x-2">
          <label className="text-sm text-gray-600">Filter by status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : (
          <KanbanBoard tasks={tasks} onMoveTask={handleMoveTask} onCardClick={(task) => setSelectedRequest(task)} userRole={user?.role} />
        )}
      </main>

      {showCreate && (
        <CreateRequestModal
          onClose={() => setShowCreate(false)}
          onCreated={(req) => setTasks((prev) => [req, ...prev])}
        />
      )}

      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onCreated={() => {}}
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
    </div>
  );
}
