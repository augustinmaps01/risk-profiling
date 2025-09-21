import React from 'react';
import Footer from './Footer';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-2 sm:py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
      <Footer />
    </div>
  );
}