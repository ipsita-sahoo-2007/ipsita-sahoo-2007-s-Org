import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSearch, PlusCircle, Sliders, Settings, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Operational Dashboard', icon: LayoutDashboard },
    { to: '/inspections', label: 'Inspection Records', icon: FileSearch },
    { to: '/inspections/new', label: 'New Inspection Run', icon: PlusCircle },
    { to: '/profiles', label: 'Domain Rule Profiles', icon: Sliders },
    { to: '/settings', label: 'System & Security', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3">
            Core Workspace
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/inspections'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3">
            Domains Supported
          </span>
          <div className="mt-2 space-y-1 text-xs text-slate-400">
            <div className="px-3 py-1.5 flex items-center justify-between rounded hover:bg-slate-900/40">
              <span>Manufacturing QC</span>
              <span className="text-[11px] font-mono text-slate-500">ISO 9001</span>
            </div>
            <div className="px-3 py-1.5 flex items-center justify-between rounded hover:bg-slate-900/40">
              <span>Workplace PPE</span>
              <span className="text-[11px] font-mono text-slate-500">OSHA 1926</span>
            </div>
            <div className="px-3 py-1.5 flex items-center justify-between rounded hover:bg-slate-900/40">
              <span>Infrastructure Civil</span>
              <span className="text-[11px] font-mono text-slate-500">AASHTO</span>
            </div>
            <div className="px-3 py-1.5 flex items-center justify-between rounded hover:bg-slate-900/40">
              <span>Document Tampering</span>
              <span className="text-[11px] font-mono text-slate-500">ICAO 9303</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engine & Pipeline State */}
      <div className="pt-4 border-t border-slate-900 space-y-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Vision Engine
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Multi-modal Gemini 3.8 Flash pipeline with normalized coordinate resolution.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate text-slate-300 font-medium">{user.name}</span>
            <span className="ml-auto text-[10px] uppercase font-mono text-slate-500">{user.role}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
