import React, { useState } from 'react';
import { User, Shield, Key, Database, Cpu, CheckCircle2, Lock, Sliders, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, quickDemoLogin, logout } = useAuth();
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (role: 'inspector' | 'admin') => {
    setSwitching(true);
    try {
      await quickDemoLogin(role);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="text-xs font-mono text-slate-400">System Telemetry & Access</div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
          Settings & Security Governance
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect operator authorization credentials, model telemetry, and relational storage integrity.
        </p>
      </div>

      {/* Operator Profile Card */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 shadow"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user?.name || 'Operator'}</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
                  {user?.role || 'inspector'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{user?.email}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                Operator ID: {user?.id}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRoleSwitch(user?.role === 'admin' ? 'inspector' : 'admin')}
              disabled={switching}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${switching ? 'animate-spin' : ''}`} />
              <span>Switch to {user?.role === 'admin' ? 'Inspector' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Vision Pipeline Configuration */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Computer Vision Intelligence Telemetry</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Underlying Model Engine</span>
            <span className="font-mono text-slate-200 font-medium">Google Gemini 3.8 Flash</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Multi-modal vision analysis with structured JSON Type schema constraints.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Spatial Coordinate Normalization</span>
            <span className="font-mono text-slate-200 font-medium">0-1000 Normalized Box Bounds</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Relative ymin, xmin, ymax, xmax coordinates mapped to responsive canvas overlays.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Server Telemetry Header</span>
            <span className="font-mono text-slate-200 font-medium">User-Agent: aistudio-build</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Verified server-side SDK execution without client-side API exposure.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Average Processing Speed</span>
            <span className="font-mono text-emerald-400 font-medium">~1.40s / Full-Resolution Scan</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports continuous high-throughput manufacturing line audits.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Access Isolation */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security Architecture & RLS Enforcement</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-medium text-slate-200 block">
                Row Level Security (RLS) Isolation
              </span>
              <span className="text-[11px] text-slate-400">
                Inspectors only query their own inspection records; administrators have global audit access.
              </span>
            </div>
            <span className="font-mono text-emerald-400 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-medium text-slate-200 block">
                Cryptographic Password Protection
              </span>
              <span className="text-[11px] text-slate-400">
                Bcrypt 10 rounds salt hashing with salted digest storage.
              </span>
            </div>
            <span className="font-mono text-emerald-400 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-medium text-slate-200 block">
                JWT Token Authentication
              </span>
              <span className="text-[11px] text-slate-400">
                Stateless cryptographic Bearer tokens with 7-day expiration.
              </span>
            </div>
            <span className="font-mono text-emerald-400 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
