import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Calendar } from 'lucide-react';
import { Inspection } from '../server/types';

interface InspectionCardProps {
  inspection: Inspection;
  onDelete?: (id: string) => void;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({ inspection }) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PASSED':
        return {
          label: 'Passed',
          icon: CheckCircle2,
          color: 'text-emerald-400',
        };
      case 'WARNING':
        return {
          label: 'Warning',
          icon: AlertTriangle,
          color: 'text-amber-400',
        };
      case 'FAILED':
        return {
          label: 'Failed',
          icon: XCircle,
          color: 'text-rose-400',
        };
      default:
        return {
          label: 'Processing',
          icon: AlertTriangle,
          color: 'text-blue-400',
        };
    }
  };

  const statusInfo = getStatusDisplay(inspection.status);
  const StatusIcon = statusInfo.icon;
  const formattedDate = new Date(inspection.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition-all duration-150 flex flex-col overflow-hidden">
      {/* Thumbnail Section */}
      <Link to={`/inspections/${inspection.id}`} className="relative block h-44 overflow-hidden bg-slate-950">
        <img
          src={inspection.image_url}
          alt={inspection.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          referrerPolicy="no-referrer"
        />

        {/* Status Label Overlay */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-slate-950/85 backdrop-blur border border-slate-800 rounded flex items-center gap-1.5 text-xs font-medium">
          <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
          <span className={statusInfo.color}>{statusInfo.label}</span>
        </div>

        {/* Score Overlay */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-slate-950/85 backdrop-blur border border-slate-800 rounded text-xs font-mono tabular-nums text-slate-200">
          {Number(inspection.overall_score).toFixed(1)}% score
        </div>
      </Link>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Zero-Pill text with bullet separator */}
          <div className="flex items-center gap-2 text-xs text-slate-400 capitalize mb-1.5">
            <span className="font-medium text-slate-300">{inspection.domain}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{inspection.severity} severity</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="tabular-nums">{formattedDate}</span>
          </div>

          <Link to={`/inspections/${inspection.id}`}>
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
              {inspection.title}
            </h3>
          </Link>

          {inspection.notes && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {inspection.notes}
            </p>
          )}
        </div>

        {/* Footer Diagnostic Summary */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            {inspection.anomalies_detected?.length || 0}{' '}
            {inspection.anomalies_detected?.length === 1 ? 'anomaly' : 'anomalies'}
          </span>

          <Link
            to={`/inspections/${inspection.id}`}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium group/link"
          >
            <span>Review Findings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
