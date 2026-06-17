import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';
import toast from 'react-hot-toast';

function getPriorityColor(p) {
  switch (p) {
    case 'EMERGENCY': return 'bg-red-100 text-red-700';
    case 'HIGH': return 'bg-orange-100 text-orange-700';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-blue-100 text-blue-700';
  }
}

const STATUS_LABELS = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ASSIGNED: 'Assigned',
};

export default function RequestDetailModal({ request, onClose, onUpdated }) {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [partsNotes, setPartsNotes] = useState('');
  const [showPartsInput, setShowPartsInput] = useState(false);

  useEffect(() => {
    if (request.status === 'APPROVED') {
      api.get('/api/auth/workers').then((r) => setWorkers(r.data)).catch(() => {});
    }
  }, [request.status]);

  const handleAction = async (newStatus, notes) => {
    try {
      const payload = { status: newStatus };
      if (notes) payload.notes = notes;
      const res = await api.patch(`/api/requests/${request.id}/status`, payload);
      toast.success(STATUS_LABELS[newStatus] || newStatus.replace(/_/g, ' '));
      onUpdated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleAssign = async (userId) => {
    setAssigning(true);
    try {
      const res = await api.patch(`/api/requests/${request.id}/assign`, { assigned_to: userId });
      toast.success('Assigned to worker');
      onUpdated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">{request.title}</h2>
            <span className={`inline-block mt-1 text-xs px-2 py-1 rounded font-medium ${getPriorityColor(request.priority)}`}>
              {request.priority}
            </span>
            <span className="ml-2 text-xs text-gray-500">{request.status.replace(/_/g, ' ')}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {request.description && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Description</label>
            <p className="text-sm text-gray-700 mt-1">{request.description}</p>
          </div>
        )}

        {request.completion_notes && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Parts / Notes</label>
            <p className="text-sm text-gray-700 mt-1">{request.completion_notes}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1 mb-4">
          {request.property_name && <p>Property: {request.property_name}</p>}
          {request.unit_number && <p>Unit: {request.unit_number}</p>}
          {request.created_by_name && <p>Reported by: {request.created_by_name}</p>}
          {request.assigned_to_name && <p>Assigned to: {request.assigned_to_name}</p>}
          <p>Created: {new Date(request.created_at).toLocaleString()}</p>
        </div>

        {request.status === 'PENDING' && user?.role !== 'WORKER' && (
          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button onClick={() => handleAction('REJECTED')}
              className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
              Reject
            </button>
            <button onClick={() => handleAction('APPROVED')}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
              Approve
            </button>
          </div>
        )}

        {request.status === 'APPROVED' && user?.role !== 'WORKER' && (
          <div className="pt-3 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Worker</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              defaultValue=""
              onChange={(e) => e.target.value && handleAssign(e.target.value)}
              disabled={assigning}
            >
              <option value="" disabled>{assigning ? 'Assigning...' : 'Select a worker...'}</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.full_name}</option>
              ))}
            </select>
          </div>
        )}

        {request.status === 'ASSIGNED' && user?.role === 'WORKER' && (
          <div className="flex justify-end pt-3 border-t">
            <button onClick={() => handleAction('IN_PROGRESS')}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Accept
            </button>
          </div>
        )}

        {request.status === 'IN_PROGRESS' && user?.role === 'WORKER' && (
          <div className="pt-3 border-t space-y-3">
            {showPartsInput ? (
              <div className="space-y-2">
                <textarea
                  value={partsNotes}
                  onChange={(e) => setPartsNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={2}
                  placeholder="Describe the parts needed..."
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => { setShowPartsInput(false); setPartsNotes(''); }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button onClick={() => handleAction('WAITING_PARTS', partsNotes)}
                    className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700">
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowPartsInput(true)}
                  className="px-4 py-2 text-sm text-orange-600 border border-orange-300 rounded hover:bg-orange-50">
                  Waiting Parts
                </button>
                <button onClick={() => handleAction('COMPLETED')}
                  className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  Mark Complete
                </button>
              </div>
            )}
          </div>
        )}

        {request.status === 'WAITING_PARTS' && user?.role === 'WORKER' && (
          <div className="flex justify-end pt-3 border-t">
            <button onClick={() => handleAction('IN_PROGRESS')}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Resume (Back to In Progress)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
