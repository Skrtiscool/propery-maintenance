import React from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children, pendingCount }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar pendingCount={pendingCount} />
      <div className="pl-14">
        {children}
      </div>
    </div>
  );
}
