import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function PublicRequestForm() {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/public/requests', form);
      setSubmitted(true);
      toast.success('Request submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white rounded-xl shadow-lg p-10 max-w-md text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Request Submitted</h1>
          <p className="text-sm text-gray-500 mb-6">Your maintenance request has been received.</p>
          <button onClick={() => { setSubmitted(false); setForm({ title: '', description: '', priority: 'MEDIUM' }); }}
            className="text-sm text-blue-600 hover:text-blue-800">
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Maintenance Request</h1>
          <p className="text-sm text-gray-500 mt-1">Fill out this form to report an issue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What needs to be fixed?" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4} placeholder="Describe the issue in detail..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
