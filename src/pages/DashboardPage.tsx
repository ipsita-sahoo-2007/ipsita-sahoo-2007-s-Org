import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { useAuth } from '../context/AuthContext';
import { Inspection } from '../server/types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, inspRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getInspections(),
        ]);
        setSummary(sumRes.summary);
        setRecentInspections((inspRes.inspections || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard telemetry', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Passed
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warning
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return <span className="text-slate-400">Processing</span>;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-slate-400">
            Operational Hub · Operator: <span className="text-slate-200">{user?.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Visual Quality Control & Telemetry Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inspections"
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            All Inspections
          </Link>
          <Link
            to="/inspections/new"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch Inspection</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="text-xs text-slate-400">Total Inspections</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1 tabular-nums">
              {summary.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>All active domain audits</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="text-xs text-slate-400">Pass / Compliance Rate</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {summary.passRate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Avg score: <strong className="text-slate-300 font-mono">{summary.avgScore}%</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="text-xs text-slate-400">Detected Anomalies</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
              {summary.totalAnomalies}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.severityBreakdown.critical} critical flagged
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="text-xs text-slate-400">Model Scan Latency</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
              1.4s
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Gemini 3.8 Flash multi-modal
            </div>
          </div>
        </div>
      )}

      {/* Analytics Visualizations */}
      {summary && <AnalyticsChart summary={summary} />}

      {/* Recent Inspection Activity Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Inspection Runs</h3>
            <p className="text-xs text-slate-400">Latest multi-modal computer vision audits</p>
          </div>
          <Link
            to="/inspections"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-medium">Asset & Title</th>
                <th className="py-3 px-4 font-medium">Domain</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Quality Score</th>
                <th className="py-3 px-4 font-medium">Anomalies</th>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentInspections.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-10 h-10 rounded object-cover border border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="font-semibold text-slate-200 line-clamp-1 max-w-[240px]">
                        {item.title}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-300">{item.domain}</td>
                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-200">
                    {Number(item.overall_score).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {item.anomalies_detected?.length || 0}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/inspections/${item.id}`}
                      className="px-2.5 py-1 text-xs font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 border border-blue-500/20 rounded transition-colors inline-block"
                    >
                      Audit
                    </Link>
                  </td>
                </tr>
              ))}
              {recentInspections.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No inspection runs found. Launch your first inspection above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
