import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { InspectionCard } from '../components/InspectionCard';
import { Inspection } from '../server/types';

export const InspectionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const domain = searchParams.get('domain') || 'all';
  const status = searchParams.get('status') || 'all';
  const severity = searchParams.get('severity') || 'all';
  const [search, setSearch] = useState('');

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await api.getInspections({
        domain: domain !== 'all' ? domain : undefined,
        status: status !== 'all' ? status : undefined,
        severity: severity !== 'all' ? severity : undefined,
        search: search || undefined,
      });
      setInspections(res.inspections || []);
    } catch (err) {
      console.error('Failed to load inspections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [domain, status, severity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInspections();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this inspection record?')) return;
    try {
      await api.deleteInspection(id);
      setInspections((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const domainTabs = [
    { key: 'all', label: 'All Domains' },
    { key: 'manufacturing', label: 'Manufacturing' },
    { key: 'safety', label: 'Workplace Safety' },
    { key: 'infrastructure', label: 'Infrastructure' },
    { key: 'document', label: 'Document Tampering' },
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-slate-400">Audit Repository</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Inspection Records & Findings
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inspections/new"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Domain Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/60 border border-slate-800 rounded-xl w-fit">
          {domainTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (tab.key === 'all') next.delete('domain');
                else next.set('domain', tab.key);
                setSearchParams(next);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                domain === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filter Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, defect, or notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Status Select */}
            <select
              value={status}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value === 'all') next.delete('status');
                else next.set('status', e.target.value);
                setSearchParams(next);
              }}
              className="px-3 py-2 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="PASSED">Passed</option>
              <option value="WARNING">Warning</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Severity Select */}
            <select
              value={severity}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value === 'all') next.delete('severity');
                else next.set('severity', e.target.value);
                setSearchParams(next);
              }}
              className="px-3 py-2 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-900/80 border border-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dense Table"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading inspection records...
        </div>
      ) : inspections.length === 0 ? (
        <div className="py-20 text-center rounded-xl border border-dashed border-slate-800 p-8 space-y-3">
          <p className="text-sm font-semibold text-slate-300">No inspections match current criteria</p>
          <p className="text-xs text-slate-500">Adjust your domain filters or launch a new visual inspection.</p>
          <div className="pt-2">
            <Link
              to="/inspections/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Run New Audit
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspections.map((item) => (
            <InspectionCard key={item.id} inspection={item} onDelete={(id) => handleDelete(id, {} as any)} />
          ))}
        </div>
      ) : (
        /* Dense Table View */
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-medium">Visual Asset</th>
                <th className="py-3 px-4 font-medium">Domain</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Quality Score</th>
                <th className="py-3 px-4 font-medium">Severity</th>
                <th className="py-3 px-4 font-medium">Anomalies</th>
                <th className="py-3 px-4 font-medium">Created</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {inspections.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-10 h-10 rounded object-cover border border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-semibold text-slate-200 line-clamp-1 max-w-[240px]">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-300">{item.domain}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-medium ${
                        item.status === 'PASSED'
                          ? 'text-emerald-400'
                          : item.status === 'WARNING'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-200">
                    {Number(item.overall_score).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-400">{item.severity}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {item.anomalies_detected?.length || 0}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/inspections/${item.id}`}
                        className="p-1.5 text-blue-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="View Audit"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
