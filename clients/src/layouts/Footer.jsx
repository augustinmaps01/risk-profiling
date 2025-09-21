import React from "react";
import Logo from "../assets/logo.png";
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm text-slate-600 text-center md:text-left">
            © {currentYear} All rights reserved.
          </div>

          <div className="flex items-center justify-center md:justify-end space-x-2">
            <span className="text-xs text-slate-500">Powered by</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700">
                MIS Department |
              </span>
              <img
                src={Logo}
                alt="Developer Logo"
                className="h-8 w-auto sm:h-10 md:h-10 lg:h-10 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
