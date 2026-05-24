import React, { useState, useRef, useEffect } from 'react';
import { Undo2, Redo2, Trash2, Maximize2, Download, Menu } from 'lucide-react';

interface TopBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onResetView: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onResetView,
  onExportPNG,
  onExportSVG,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="top-bar">
      <button 
        className="action-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Hide Controls" : "Show Controls"}
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      <div className="app-title">
        <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" strokeDasharray="6 6" />
          <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="4" />
          <path d="M 50 0 L 50 100 M 0 50 L 100 50 M 15 15 L 85 85 M 15 85 L 85 15" stroke="currentColor" strokeWidth="3" opacity="0.6" />
          <circle cx="50" cy="50" r="8" fill="var(--accent-neon)" />
        </svg>
        <span>MANDALA</span>
      </div>

      <div className="top-bar-actions">
        <button
          className={`action-btn ${!canUndo ? 'disabled' : ''}`}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 size={18} />
        </button>

        <button
          className={`action-btn ${!canRedo ? 'disabled' : ''}`}
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo2 size={18} />
        </button>

        <button
          className="action-btn"
          onClick={onResetView}
          title="Center / Reset View"
          aria-label="Reset View"
        >
          <Maximize2 size={16} />
        </button>

        <button
          className="action-btn"
          onClick={onClear}
          title="Clear Canvas"
          aria-label="Clear Canvas"
        >
          <Trash2 size={17} style={{ color: 'rgba(255, 100, 100, 0.9)' }} />
        </button>

        <div className="export-btn-container" ref={exportMenuRef}>
          <button
            className="action-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Artwork"
            aria-label="Export Menu"
            style={{ 
              background: 'rgba(0, 240, 255, 0.1)', 
              borderColor: 'rgba(0, 240, 255, 0.2)',
              color: 'var(--accent-cyan)'
            }}
          >
            <Download size={18} />
          </button>

          {showExportMenu && (
            <div className="export-menu">
              <button
                className="export-menu-item"
                onClick={() => {
                  onExportPNG();
                  setShowExportMenu(false);
                }}
              >
                <span>Export PNG</span>
              </button>
              <button
                className="export-menu-item"
                onClick={() => {
                  onExportSVG();
                  setShowExportMenu(false);
                }}
              >
                <span>Export SVG</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
