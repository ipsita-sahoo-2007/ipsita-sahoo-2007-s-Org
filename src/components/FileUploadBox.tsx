import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, X, Check, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface FileUploadBoxProps {
  onImageSelected: (data: { file?: File; dataUrl: string; samplePath?: string }) => void;
  selectedPreviewUrl?: string | null;
  onClear?: () => void;
  domain?: string;
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  onImageSelected,
  selectedPreviewUrl,
  onClear,
  domain,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [sampleAssets, setSampleAssets] = useState<any[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load presets
    api.getSampleAssets().then((res) => {
      setSampleAssets(res.assets || []);
    }).catch(() => {});

    return () => {
      stopCamera();
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.jpg, .png, .webp, .tiff)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onImageSelected({ file, dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('Unable to access optical camera feed. Please check device permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      stopCamera();
      onImageSelected({ dataUrl });
    }
  };

  const handleSelectPreset = (asset: any) => {
    stopCamera();
    onImageSelected({
      dataUrl: asset.url,
      samplePath: asset.url,
    });
  };

  return (
    <div className="space-y-4">
      {/* Active Camera View */}
      {isCameraActive ? (
        <div className="relative rounded-xl border border-slate-700 bg-black overflow-hidden flex flex-col items-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full max-h-[420px] object-cover"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded text-xs font-mono text-emerald-400 border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE OPTICAL STREAM
          </div>
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={captureFrame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Capture High-Res Frame
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : selectedPreviewUrl ? (
        /* Image Preview Box */
        <div className="relative rounded-xl border border-slate-700 bg-slate-900/60 p-3 flex flex-col items-center">
          <img
            src={selectedPreviewUrl}
            alt="Inspection Asset Preview"
            className="max-h-[360px] w-auto max-w-full rounded-lg object-contain border border-slate-800 shadow"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-full bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 transition-colors"
              title="Remove asset"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Asset staged for multi-modal analysis</span>
          </div>
        </div>
      ) : (
        /* Drag and Drop Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[220px] ${
            isDragging
              ? 'border-blue-500 bg-blue-950/20 text-blue-200'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/30 text-slate-400'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/tiff"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h4 className="text-sm font-semibold text-slate-200">
            Drag & drop visual asset here, or click to browse
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Supports high-resolution photography, scanned documents, and video frames (JPG, PNG, WEBP, TIFF up to 25MB)
          </p>

          <div className="mt-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Select File
            </button>
            <span className="text-xs text-slate-600">or</span>
            <button
              type="button"
              onClick={startCamera}
              className="px-3 py-1.5 text-xs font-medium text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera
            </button>
          </div>

          {cameraError && (
            <p className="text-xs text-rose-400 mt-2">{cameraError}</p>
          )}
        </div>
      )}

      {/* Preset Reference Assets Picker */}
      {sampleAssets.length > 0 && !selectedPreviewUrl && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-300">Or test with calibrated industrial presets:</span>
            <span className="text-[11px] font-mono text-slate-500">1-click inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {sampleAssets.map((asset) => {
              const isDomainMatch = domain ? asset.domain === domain : false;
              return (
                <button
                  key={asset.domain}
                  type="button"
                  onClick={() => handleSelectPreset(asset)}
                  className={`text-left p-2 rounded-lg border transition-all duration-150 flex flex-col group ${
                    isDomainMatch
                      ? 'border-blue-500/80 bg-blue-950/20'
                      : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className="w-full h-20 object-cover rounded mb-2 border border-slate-800 group-hover:opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                    {asset.title}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {asset.domain}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
