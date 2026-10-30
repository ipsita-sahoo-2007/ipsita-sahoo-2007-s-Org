import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, CheckCircle, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { InspectionProfile, InspectionDomain } from '../server/types';

export const ProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<InspectionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [domain, setDomain] = useState<InspectionDomain>('manufacturing');
  const [description, setDescription] = useState('');
  const [sensitivity, setSensitivity] = useState<'standard' | 'high' | 'ultra'>('high');
  const [minConfidence, setMinConfidence] = useState<number>(80);
  const [focusAreasText, setFocusAreasText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.getProfiles();
      setProfiles(res.profiles || []);
    } catch (err) {
      console.error('Failed to load profiles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Profile name is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const focus_areas = focusAreasText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.createProfile({
        name,
        domain,
        description,
        custom_rules: {
          sensitivity,
          min_confidence: Number(minConfidence),
          focus_areas,
          require_remediation: true,
        },
      });

      setProfiles((prev) => [...prev, res.profile]);
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setFocusAreasText('');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to remove this inspection profile?')) return;
    try {
      await api.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete profile');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-slate-400">Rule Templates</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Inspection Profiles & Anomaly Thresholds
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure domain-specific prompt constraints, sensitivity profiles, and minimum confidence gates.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Rule Profile</span>
        </button>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading rule profiles...
        </div>
      ) : profiles.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-800">
          <p className="text-sm font-semibold text-slate-300">No rule profiles configured</p>
          <p className="text-xs text-slate-500 mt-1">Create your first custom prompt profile above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {/* Zero-Pill text metadata */}
                    <div className="text-xs text-slate-400 capitalize flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-400">{profile.domain}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="font-mono">{profile.custom_rules?.sensitivity || 'Standard'} sensitivity</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {profile.description || 'General domain rules applied for inspection.'}
                </p>

                {/* Focus Areas */}
                {profile.custom_rules?.focus_areas && profile.custom_rules.focus_areas.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Target Focus Areas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.custom_rules.focus_areas.map((area, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  Min Confidence Gate: {profile.custom_rules?.min_confidence || 75}%
                </span>
                <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active Profile
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Inspection Rule Profile</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Profile Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Critical Surface Fissure Protocol"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-300">Domain Category</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as InspectionDomain)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="manufacturing">Manufacturing QC</option>
                    <option value="safety">Workplace Safety & PPE</option>
                    <option value="infrastructure">Civil Infrastructure</option>
                    <option value="document">Document & ID</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-300">Sensitivity Preset</label>
                  <select
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="standard">Standard (General Inspection)</option>
                    <option value="high">High (Industrial Quality)</option>
                    <option value="ultra">Ultra (Sub-millimeter Zero Tolerance)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-300">Minimum Confidence Threshold</label>
                  <span className="font-mono text-blue-400">{minConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Profile Purpose / Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary of what this inspection rule targets..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">
                  Focus Areas (Comma-separated items)
                </label>
                <input
                  type="text"
                  value={focusAreasText}
                  onChange={(e) => setFocusAreasText(e.target.value)}
                  placeholder="e.g. Micro-fissures, weld seam porosity, dimension tolerance"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
