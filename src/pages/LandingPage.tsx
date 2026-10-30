import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle,
  FileText,
  BarChart3,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SAMPLE_ASSETS } from '../constants/assets';

export const LandingPage: React.FC = () => {
  const domains = [
    {
      id: 'manufacturing',
      title: 'Industrial Manufacturing QC',
      subtitle: 'Sub-millimeter defect detection across aerospace & automotive assembly',
      image: SAMPLE_ASSETS.manufacturing,
      specs: '0.003mm tolerance · Surface fissure scanning · Burr & porosity check',
      accuracy: '99.4% precision',
    },
    {
      id: 'safety',
      title: 'Workplace Safety & PPE Compliance',
      subtitle: 'Automated OSHA compliance and high-elevation safety equipment verification',
      image: SAMPLE_ASSETS.safety,
      specs: 'Hardhats & vests · Continuous tie-off · Exclusion zone geofence',
      accuracy: 'Real-time detection',
    },
    {
      id: 'infrastructure',
      title: 'Civil & Infrastructure Integrity',
      subtitle: 'Structural concrete spalling, exposed rebar corrosion, and fatigue monitoring',
      image: SAMPLE_ASSETS.infrastructure,
      specs: 'Bridge piers · Highway overpasses · Hydraulic seepage tracing',
      accuracy: 'AASHTO standard',
    },
    {
      id: 'document',
      title: 'Scanned Document & Credential Authentication',
      subtitle: 'Optical watermark, holographic diffraction, and microprint forgery detection',
      image: SAMPLE_ASSETS.document,
      specs: 'Microline continuity · Security seals · Kerning & font tampering',
      accuracy: 'Level IV clearance',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-mono tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Multi-Modal Computer Vision Engine</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Gemini 3.8 Flash</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white text-balance leading-[1.15]">
              Eliminate manual inspection bottlenecks with autonomous visual intelligence.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              VisionGuard AI transforms raw imagery, drone captures, and scanned documents into
              auditable, structured quality data. Detect micro-defects, safety breaches, and
              tampering with sub-second latency and normalized spatial coordinates.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/inspections/new"
                className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all whitespace-nowrap"
              >
                <span>Launch Live Inspection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Explore Audit Hub
              </Link>
            </div>

            {/* Proof Points Strip: Adjacent to Hero */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">1.4s</div>
                <div className="text-xs text-slate-400 mt-0.5">Average AI Scan Latency</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">99.2%</div>
                <div className="text-xs text-slate-400 mt-0.5">Defect Recognition Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">4 Domains</div>
                <div className="text-xs text-slate-400 mt-0.5">Calibrated Vision Models</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-sm">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-950">
                <img
                  src={SAMPLE_ASSETS.manufacturing}
                  alt="Industrial Turbine Inspection"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Simulated Bounding Box Overlay */}
                <div className="absolute top-[28%] left-[45%] w-[38%] h-[32%] border-2 border-amber-400 bg-amber-400/20 rounded shadow-lg">
                  <span className="absolute -top-6 left-0 bg-slate-950/90 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/40">
                    Surface Burr 92%
                  </span>
                </div>

                {/* Diagnostic Badge */}
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-semibold text-white">Stage 1 Turbine Blade</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">87.5% Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism-to-Outcome Architecture Section */}
      <section className="px-6 py-16 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
              Autonomous Pipeline Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              From raw pixels to auditable compliance in three discrete steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">1. Ingest & Target</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload ultra-high resolution photography, video frames, or live camera streams. Select
                domain-specific rule profiles and tolerance thresholds.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Up to 25MB · JPG / PNG / WEBP / TIFF
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">2. Multi-Modal Vision Inference</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini 3.8 Flash interrogates image structures with schema-governed JSON outputs,
                pinpointing anomaly coordinates, severity metrics, and confidence bounds.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Normalized Coordinates (0-1000) · Sub-second
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">3. Remediate & Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect anomalies on an interactive canvas, dispatch corrective remediation orders,
                and export timestamped audit certificates for compliance records.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Printable PDF Report · Relational Archive
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Showcase Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
              Comprehensive Domain Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Purpose-built visual intelligence profiles
            </h2>
          </div>
          <Link
            to="/inspections/new"
            className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
          >
            <span>Run automated inspection on any domain</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {domains.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden flex flex-col group hover:border-slate-700 transition-colors"
            >
              <div className="relative h-56 bg-slate-950 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-slate-950/80 backdrop-blur border border-slate-800 rounded text-xs font-mono text-emerald-400">
                  {item.accuracy}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.subtitle}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px] truncate max-w-[280px]">
                    {item.specs}
                  </span>
                  <Link
                    to={`/inspections/new?domain=${item.id}`}
                    className="text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 py-16 border-t border-slate-800 bg-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to deploy enterprise visual quality control?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Test immediate zero-setup inspection with calibrated industrial presets or upload your
            own inspection imagery.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/inspections/new"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
            >
              Start Inspection Now
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-sm font-medium transition-colors"
            >
              View Analytics Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-slate-900 bg-slate-950 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div>
          © 2026 VisionGuard AI Systems Inc. Enterprise Visual Quality & Compliance.
        </div>
        <div className="flex items-center gap-6">
          <span>ISO 9001 / OSHA 1926 Aligned</span>
          <span>Powered by Google Gemini 3.8</span>
        </div>
      </footer>
    </div>
  );
};
