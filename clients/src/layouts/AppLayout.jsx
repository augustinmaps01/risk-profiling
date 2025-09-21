import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import SessionStatus from '../components/auth/SessionStatus';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navigation />
      <SessionStatus />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}