import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Eye, EyeOff, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Anomaly, SeverityLevel } from '../server/types';

interface AnalysisViewerProps {
  imageUrl: string;
  title: string;
  anomalies: Anomaly[];
  selectedAnomalyId?: string | null;
  onSelectAnomaly?: (id: string | null) => void;
  status?: string;
  overallScore?: number;
}

export const AnalysisViewer: React.FC<AnalysisViewerProps> = ({
  imageUrl,
  title,
  anomalies,
  selectedAnomalyId,
  onSelectAnomaly,
  status = 'PASSED',
  overallScore = 100,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredAnomalyId, setHoveredAnomalyId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const getSeverityColor = (severity?: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-rose-500',
          bg: 'bg-rose-500/20',
          text: 'text-rose-400',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        };
      case 'high':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-500/20',
          text: 'text-orange-400',
          badge: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
        };
      case 'medium':
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-400/20',
          text: 'text-amber-300',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
        };
      default:
        return {
          border: 'border-blue-400',
          bg: 'bg-blue-400/20',
          text: 'text-blue-300',
          badge: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col ${
        isFullscreen ? 'h-screen w-screen p-4' : 'w-full'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[280px]">
            {title}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {anomalies.length} {anomalies.length === 1 ? 'detection' : 'detections'}
          </span>
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
              showBoxes ? 'text-blue-400 bg-blue-950/60 border border-blue-800/40' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Bounding Boxes"
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">Overlay</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.75}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative flex-1 min-h-[420px] max-h-[680px] bg-slate-900/40 overflow-auto flex items-center justify-center p-4">
        <div
          className="relative inline-block transition-transform duration-150 origin-center select-none"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Main Visual Asset */}
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[580px] object-contain rounded shadow-lg block pointer-events-auto"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Graceful SVG fallback container
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.image-fallback')) {
                const fallback = document.createElement('div');
                fallback.className =
                  'image-fallback w-[640px] h-[400px] flex flex-col items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 text-sm gap-2 rounded';
                fallback.innerHTML =
                  '<svg class="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Asset Preview Stream</span>';
                parent.appendChild(fallback);
              }
            }}
          />

          {/* Interactive Bounding Boxes Overlay */}
          {showBoxes && (
            <div className="absolute inset-0 pointer-events-none">
              {anomalies.map((anomaly, index) => {
                if (!anomaly.boundingBox) return null;
                const { ymin, xmin, ymax, xmax } = anomaly.boundingBox;
                const isSelected = selectedAnomalyId === anomaly.id;
                const isHovered = hoveredAnomalyId === anomaly.id;
                const colors = getSeverityColor(anomaly.severity);

                // Coordinates are percentages 0-100
                const top = `${ymin}%`;
                const left = `${xmin}%`;
                const width = `${Math.max(xmax - xmin, 4)}%`;
                const height = `${Math.max(ymax - ymin, 4)}%`;

                return (
                  <div
                    key={anomaly.id || index}
                    className={`absolute pointer-events-auto cursor-pointer transition-all duration-150 rounded border-2 ${
                      colors.border
                    } ${colors.bg} ${
                      isSelected || isHovered
                        ? 'ring-4 ring-blue-500/40 shadow-lg shadow-blue-500/20 z-30'
                        : 'hover:border-white z-10'
                    }`}
                    style={{ top, left, width, height }}
                    onClick={() => onSelectAnomaly?.(isSelected ? null : anomaly.id)}
                    onMouseEnter={() => setHoveredAnomalyId(anomaly.id)}
                    onMouseLeave={() => setHoveredAnomalyId(null)}
                  >
                    {/* Anomaly Badge Pill */}
                    <div
                      className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap border shadow-sm ${
                        colors.badge
                      }`}
                    >
                      #{index + 1} {anomaly.confidence}%
                    </div>

                    {/* Popover on hover or selection */}
                    {(isSelected || isHovered) && (
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-left pointer-events-none z-40">
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{anomaly.title}</span>
                          <span className="font-mono text-emerald-400">{anomaly.confidence}%</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          {anomaly.description}
                        </p>
                        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Y:{ymin} X:{xmin}</span>
                          <span>H:{Math.round(ymax - ymin)} W:{Math.round(xmax - xmin)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status & Diagnostic Strip */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            {status === 'PASSED' ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            Status: {status}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>
            Quality Score:{' '}
            <strong className="text-white font-mono tabular-nums">{overallScore}%</strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Click an overlay bounding box to inspect diagnostics
        </div>
      </div>
    </div>
  );
};
