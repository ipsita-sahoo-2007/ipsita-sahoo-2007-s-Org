import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileDown,
  RefreshCw,
  Printer,
  Shield,
  Layers,
  ChevronRight,
  Target,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisViewer } from '../components/AnalysisViewer';
import { Inspection, Anomaly } from '../server/types';

export const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [completedRemediations, setCompletedRemediations] = useState<Record<number, boolean>>({});

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getInspection(id);
      setInspection(res.inspection);
    } catch (err) {
      console.error('Failed to load inspection', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleReanalyze = async () => {
    if (!id) return;
    setIsReanalyzing(true);
    try {
      const res = await api.reanalyzeInspection(id);
      setInspection(res.inspection);
    } catch (err: any) {
      alert(err.message || 'Re-analysis failed');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!inspection) return;
    const rows = [
      ['Inspection ID', inspection.id],
      ['Title', inspection.title],
      ['Domain', inspection.domain],
      ['Status', inspection.status],
      ['Overall Score', `${inspection.overall_score}%`],
      ['Severity', inspection.severity],
      ['Created At', inspection.created_at],
      [''],
      ['Anomaly Index', 'Title', 'Confidence', 'Description', 'Coordinates'],
      ...inspection.anomalies_detected.map((a, idx) => [
        idx + 1,
        `"${a.title.replace(/"/g, '""')}"`,
        `${a.confidence}%`,
        `"${a.description.replace(/"/g, '""')}"`,
        a.boundingBox
          ? `ymin:${a.boundingBox.ymin} xmin:${a.boundingBox.xmin} ymax:${a.boundingBox.ymax} xmax:${a.boundingBox.xmax}`
          : 'N/A',
      ]),
      [''],
      ['Recommendations'],
      ...inspection.recommendations.map((r) => [`"${r.replace(/"/g, '""')}"`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VisionGuard_Audit_${inspection.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-slate-500 text-xs">
        Loading inspection analysis report...
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <p className="text-sm font-semibold text-slate-200">Inspection record not found</p>
        <Link
          to="/inspections"
          className="inline-flex items-center gap-2 text-xs text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to inspection records</span>
        </Link>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PASSED':
        return {
          label: 'Inspection Passed',
          desc: 'Compliant with domain specifications',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40 border-emerald-800/60',
        };
      case 'WARNING':
        return {
          label: 'Inspection Warning',
          desc: 'Non-critical variances or minor anomalies detected',
          icon: AlertTriangle,
          color: 'text-amber-400',
          bg: 'bg-amber-950/40 border-amber-800/60',
        };
      case 'FAILED':
        return {
          label: 'Inspection Failed',
          desc: 'Critical safety violations or structural defects detected',
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-950/40 border-rose-800/60',
        };
      default:
        return {
          label: status,
          desc: 'Pending evaluation',
          icon: AlertTriangle,
          color: 'text-blue-400',
          bg: 'bg-blue-950/40 border-blue-800/60',
        };
    }
  };

  const statusInfo = getStatusDisplay(inspection.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Printable & Nav Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/inspections" className="hover:text-slate-200 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Audits</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="capitalize">{inspection.domain}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 truncate max-w-[200px]">{inspection.title}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
            <span>{isReanalyzing ? 'Re-analyzing...' : 'Re-Run Scan'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header (Visible in print mode) */}
      <div className="hidden print:block pb-4 border-b border-black text-black">
        <h1 className="text-2xl font-bold">VisionGuard AI Quality Audit Certificate</h1>
        <p className="text-xs text-gray-600">
          Official Visual Inspection Report · Audit Reference ID: {inspection.id}
        </p>
      </div>

      {/* Executive Overview Banner */}
      <div className={`p-5 rounded-xl border ${statusInfo.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{inspection.title}</span>
              <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}>
                {inspection.status}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {inspection.ai_raw_response?.summary ||
                statusInfo.desc ||
                'Automated visual analysis completed.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-6 shrink-0">
          <div className="text-left sm:text-right">
            <div className="text-[11px] text-slate-400 font-medium">Compliance Score</div>
            <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {Number(inspection.overall_score).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Inspection Grid: Left Canvas Viewer, Right Findings & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Visual Analysis Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <AnalysisViewer
            imageUrl={inspection.image_url}
            title={inspection.title}
            anomalies={inspection.anomalies_detected}
            selectedAnomalyId={selectedAnomalyId}
            onSelectAnomaly={setSelectedAnomalyId}
            status={inspection.status}
            overallScore={Number(inspection.overall_score)}
          />

          {/* Audit Metadata Strip */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Inspection Domain</span>
              <span className="font-semibold text-slate-200 capitalize">{inspection.domain}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Severity Level</span>
              <span className="font-semibold text-slate-200 capitalize">{inspection.severity}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Priority</span>
              <span className="font-semibold text-slate-200 capitalize">{inspection.priority || 'Medium'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Audit Timestamp</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {new Date(inspection.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detected Anomalies Breakdown & Action Plan */}
        <div className="lg:col-span-5 space-y-6">
          {/* Anomaly Detection List */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>Detected Anomalies ({inspection.anomalies_detected?.length || 0})</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Click to highlight
              </span>
            </div>

            {inspection.anomalies_detected.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Zero structural defects or non-compliance detected. Standard parameters verified.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {inspection.anomalies_detected.map((anomaly, idx) => {
                  const isSelected = selectedAnomalyId === anomaly.id;
                  return (
                    <div
                      key={anomaly.id || idx}
                      onClick={() =>
                        setSelectedAnomalyId(isSelected ? null : anomaly.id)
                      }
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-400">
                            {idx + 1}
                          </span>
                          <span>{anomaly.title}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-medium shrink-0">
                          {anomaly.confidence}% conf
                        </span>
                      </div>

                      <p className="text-slate-400 mt-1.5 leading-relaxed">
                        {anomaly.description}
                      </p>

                      {anomaly.boundingBox && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>
                            Location: Y:{anomaly.boundingBox.ymin} X:{anomaly.boundingBox.xmin}
                          </span>
                          <span>
                            Box: {Math.round(anomaly.boundingBox.ymax - anomaly.boundingBox.ymin)}×{Math.round(anomaly.boundingBox.xmax - anomaly.boundingBox.xmin)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Corrective Action Recommendations */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Remediation Checklist & Action Plan</span>
            </h3>

            {inspection.recommendations.length === 0 ? (
              <p className="text-xs text-slate-400">No corrective actions required.</p>
            ) : (
              <div className="space-y-2">
                {inspection.recommendations.map((rec, idx) => {
                  const isChecked = !!completedRemediations[idx];
                  return (
                    <label
                      key={idx}
                      className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/40 flex items-start gap-3 cursor-pointer transition-colors text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setCompletedRemediations((prev) => ({
                            ...prev,
                            [idx]: e.target.checked,
                          }))
                        }
                        className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                      />
                      <span
                        className={`leading-relaxed ${
                          isChecked ? 'line-through text-slate-500' : 'text-slate-300'
                        }`}
                      >
                        {rec}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
