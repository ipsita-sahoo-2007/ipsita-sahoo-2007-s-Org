import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Info,
  Sliders,
} from 'lucide-react';
import { api } from '../services/api';
import { FileUploadBox } from '../components/FileUploadBox';
import { InspectionDomain, SeverityLevel, InspectionProfile } from '../server/types';

export const NewInspectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialDomain = (searchParams.get('domain') as InspectionDomain) || 'manufacturing';

  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState<InspectionDomain>(initialDomain);
  const [priority, setPriority] = useState<SeverityLevel>('medium');
  const [notes, setNotes] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profiles, setProfiles] = useState<InspectionProfile[]>([]);

  // Asset staging
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [samplePath, setSamplePath] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load profiles
    api.getProfiles().then((res) => {
      setProfiles(res.profiles || []);
    }).catch(() => {});

    // Prefill default title based on domain
    if (!title) {
      const defaultTitles: Record<InspectionDomain, string> = {
        manufacturing: 'Aero Turbine Rotor Blade Batch Inspection',
        safety: 'Structural Steel Ironworker PPE Audit',
        infrastructure: 'Highway River Pier Substructure Scan',
        document: 'Technical Security Clearance Protocol Verification',
      };
      setTitle(defaultTitles[domain] || 'Visual Quality Inspection');
    }
  }, [domain]);

  const handleDomainChange = (newDomain: InspectionDomain) => {
    setDomain(newDomain);
    const defaultTitles: Record<InspectionDomain, string> = {
      manufacturing: 'Aero Turbine Rotor Blade Batch Inspection',
      safety: 'Structural Steel Ironworker PPE Audit',
      infrastructure: 'Highway River Pier Substructure Scan',
      document: 'Technical Security Clearance Protocol Verification',
    };
    setTitle(defaultTitles[newDomain]);
  };

  const handleImageSelected = (data: { file?: File; dataUrl: string; samplePath?: string }) => {
    if (data.file) {
      setSelectedFile(data.file);
      setSamplePath(null);
    } else if (data.samplePath) {
      setSamplePath(data.samplePath);
      setSelectedFile(null);
    }
    setPreviewUrl(data.dataUrl);
    setErrorMessage(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSamplePath(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setErrorMessage('Please upload an image, capture a camera frame, or select an industrial preset asset.');
      return;
    }

    if (!title.trim() || title.length < 3) {
      setErrorMessage('Title must be at least 3 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setAnalysisStep('Ingesting visual asset and packaging generative payload...');

    try {
      setTimeout(() => {
        setAnalysisStep('Invoking Google Gemini 3.8 Flash multi-modal vision engine...');
      }, 500);

      let payload: any;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('domain', domain);
        formData.append('priority', priority);
        if (notes) formData.append('notes', notes);
        if (selectedProfileId) formData.append('profileId', selectedProfileId);
        formData.append('image', selectedFile);
        payload = formData;
      } else {
        payload = {
          title,
          domain,
          priority,
          notes,
          profileId: selectedProfileId || undefined,
          imageUrl: samplePath || previewUrl,
        };
      }

      const res = await api.createInspection(payload);
      setAnalysisStep('Structuring detected bounding anomalies and persisting report...');

      setTimeout(() => {
        navigate(`/inspections/${res.inspection.id}`);
      }, 400);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Inspection pipeline failed. Please try again.');
    }
  };

  const domainDescriptions: Record<InspectionDomain, string> = {
    manufacturing: 'Surface micro-cracks, alignment tolerances, tooling burrs, missing parts',
    safety: 'Hardhats, high-visibility vests, eye protection, fall-arrest harnesses, zone breaches',
    infrastructure: 'Concrete spalling, rust oxidation, rebar exposure, shear fractures, fatigue',
    document: 'Scanned ID tampering, microprint integrity, holographic seals, font discrepancies',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="text-xs font-mono text-slate-400">Intake Pipeline</div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
          New AI Visual Inspection Run
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Stage high-resolution visual imagery and execute domain-calibrated Gemini computer vision analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Domain Selection */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              1. Select Inspection Domain
            </label>
            <span className="text-[11px] font-mono text-blue-400">Calibrated Prompts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {(['manufacturing', 'safety', 'infrastructure', 'document'] as InspectionDomain[]).map(
              (d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDomainChange(d)}
                  className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    domain === d
                      ? 'border-blue-500 bg-blue-950/30 text-white ring-1 ring-blue-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs capitalize text-slate-100">{d}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {domainDescriptions[d]}
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* Step 2: Visual Asset Staging */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              2. Visual Asset Ingestion
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {previewUrl ? 'Asset Staged' : 'Awaiting Input'}
            </span>
          </div>

          <FileUploadBox
            onImageSelected={handleImageSelected}
            selectedPreviewUrl={previewUrl}
            onClear={handleClearImage}
            domain={domain}
          />
        </div>

        {/* Step 3: Inspection Metadata & Configuration */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
            3. Operational Parameters
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Asset Title / Identifier</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Turbine Rotor Blade Lot #492"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Audit Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical / Emergency</option>
              </select>
            </div>
          </div>

          {/* Rule Profile Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Inspection Rule Profile (Optional)
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Default Domain Rule Set</option>
              {profiles
                .filter((p) => p.domain === domain)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.custom_rules?.sensitivity} sensitivity)
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Inspector Notes / Specific Focus Targets (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pay special attention to trailing edge cooling channels for micro-cracks larger than 0.003mm."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Submission Button & Execution Modal */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inspections')}
            className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !previewUrl}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing AI Scan...</span>
              </>
            ) : (
              <>
                <span>Execute Vision Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Live Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Executing Visual Intelligence Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">{analysisStep}</p>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
