import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Cpu } from 'lucide-react';

interface AnalyticsChartProps {
  summary: {
    total: number;
    passed: number;
    failed: number;
    warning: number;
    passRate: number;
    avgScore: number;
    totalAnomalies: number;
    avgProcessingTimeSec: number;
    domainBreakdown: {
      manufacturing: number;
      safety: number;
      infrastructure: number;
      document: number;
    };
    severityBreakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ summary }) => {
  const { total, passed, failed, warning, passRate, avgScore, totalAnomalies, domainBreakdown, severityBreakdown } =
    summary;

  const domains = [
    { key: 'manufacturing', label: 'Manufacturing QC', count: domainBreakdown.manufacturing, color: 'bg-blue-500' },
    { key: 'safety', label: 'Workplace Safety & PPE', count: domainBreakdown.safety, color: 'bg-emerald-500' },
    { key: 'infrastructure', label: 'Civil Infrastructure', count: domainBreakdown.infrastructure, color: 'bg-amber-500' },
    { key: 'document', label: 'Document Tampering', count: domainBreakdown.document, color: 'bg-purple-500' },
  ];

  const maxDomainCount = Math.max(...domains.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart Card 1: Domain Distribution */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-200">
              Inspections by Domain Category
            </h4>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {total} Total Records
            </span>
          </div>

          <div className="space-y-3.5">
            {domains.map((d) => {
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              const barWidth = Math.max((d.count / maxDomainCount) * 100, 4);

              return (
                <div key={d.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{d.label}</span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {d.count} <span className="text-slate-600">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${d.color}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Target compliance threshold: 95.0%</span>
          <span className="font-mono text-blue-400">Multi-Domain Calibrated</span>
        </div>
      </div>

      {/* Chart Card 2: Status & Severity Spectrum */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-200">
              Audit Outcome & Anomaly Severity
            </h4>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {passRate}% Pass Rate
            </span>
          </div>

          {/* Outcome Multi-Segment Bar */}
          <div className="space-y-2 mb-5">
            <div className="text-xs text-slate-400">Overall Inspection Outcomes</div>
            <div className="w-full h-3.5 bg-slate-800/80 rounded-lg overflow-hidden flex">
              {passed > 0 && (
                <div
                  style={{ width: `${(passed / total) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Passed: ${passed}`}
                />
              )}
              {warning > 0 && (
                <div
                  style={{ width: `${(warning / total) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`Warning: ${warning}`}
                />
              )}
              {failed > 0 && (
                <div
                  style={{ width: `${(failed / total) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Failed: ${failed}`}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Passed: {passed}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Warning: {warning}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Failed: {failed}
              </span>
            </div>
          </div>

          {/* Severity Matrix */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Detected Anomalies by Severity</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-slate-950 border border-rose-900/30">
                <div className="text-base font-bold font-mono text-rose-400 tabular-nums">
                  {severityBreakdown.critical}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Critical</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-orange-900/30">
                <div className="text-base font-bold font-mono text-orange-400 tabular-nums">
                  {severityBreakdown.high}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">High</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-amber-900/30">
                <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                  {severityBreakdown.medium}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Medium</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-blue-900/30">
                <div className="text-base font-bold font-mono text-blue-400 tabular-nums">
                  {severityBreakdown.low}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Low</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Total Anomalies Detected: {totalAnomalies}</span>
          <span className="font-mono text-emerald-400">Avg Scan Time: 1.4s</span>
        </div>
      </div>
    </div>
  );
};
