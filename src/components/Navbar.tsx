import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Shield, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:border-blue-400 transition-colors">
            <Eye className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              VisionGuard <span className="text-blue-500 text-xs font-mono font-medium">AI</span>
            </span>
          </div>
        </Link>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <Link
            to="/dashboard"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              isCurrent('/dashboard') ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/inspections"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              isCurrent('/inspections') && location.pathname !== '/inspections/new'
                ? 'text-white'
                : 'hover:text-slate-200'
            }`}
          >
            Audits & Logs
          </Link>
          <Link
            to="/inspections/new"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              isCurrent('/inspections/new') ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Live Inspection
          </Link>
          <Link
            to="/profiles"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              isCurrent('/profiles') ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Rule Profiles
          </Link>
          <Link
            to="/settings"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              isCurrent('/settings') ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Configuration
          </Link>
        </nav>

        {/* Zone 3: Primary Action & Auth State */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/inspections/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                to="/settings"
                className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-slate-900 transition-colors"
                title={`${user.name} (${user.role})`}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-medium text-slate-300 truncate max-w-[100px]">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => quickDemoLogin('inspector')}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded transition-colors whitespace-nowrap"
              >
                Demo Sign-In
              </button>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-900 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
