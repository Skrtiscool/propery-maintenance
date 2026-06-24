import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/users', label: 'Users', icon: '👤' },
  { path: '/properties', label: 'Properties', icon: '🏠' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 w-9 h-9 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setOpen(false)} />
      )}

      {/* sidebar panel */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
          <span className="font-semibold text-sm text-gray-800">Property Maintenance</span>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        <div className="px-2 py-3 border-b border-gray-100">
          <div className="px-3 py-2 text-xs text-gray-500">
            {user?.full_name} <span className="text-gray-400">·</span> {user?.role?.replace('_', ' ')}
          </div>
        </div>

        <nav className="px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <button onClick={logout}
            className="w-full text-xs text-red-600 hover:text-red-800 font-medium py-2 border border-red-200 rounded hover:bg-red-50 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
