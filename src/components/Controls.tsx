import React from 'react';
import { 
  Paintbrush, 
  Sparkles, 
  GitFork, 
  Globe, 
  Eraser, 
  Move, 
  Eye, 
  HelpCircle,
  Spline,
  Droplet
} from 'lucide-react';
import type { Stroke } from '../utils/export';

interface ControlsProps {
  selectedTool: Stroke['tool'] | 'pan';
  setSelectedTool: (tool: Stroke['tool'] | 'pan') => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (width: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  symmetryCount: number;
  setSymmetryCount: (count: number) => void;
  mirror: boolean;
  setMirror: (mirror: boolean) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  bgType: 'solid' | 'radial-gradient';
  setBgType: (type: 'solid' | 'radial-gradient') => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onUpdateHistorySymmetry: (count: number, mirror: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedTool,
  setSelectedTool,
  currentColor,
  setCurrentColor,
  brushWidth,
  setBrushWidth,
  opacity,
  setOpacity,
  symmetryCount,
  setSymmetryCount,
  mirror,
  setMirror,
  bgColor,
  setBgColor,
  bgType,
  setBgType,
  showGrid,
  setShowGrid,
  sidebarOpen,
  onUpdateHistorySymmetry,
}) => {
  const colorPresets = [
    { name: 'White', value: '#ffffff' },
    { name: 'Hot Pink', value: '#ff007f' },
    { name: 'Cyan', value: '#00f0ff' },
    { name: 'Lime', value: '#39ff14' },
    { name: 'Gold', value: '#ffd700' },
    { name: 'Purple', value: '#b026ff' },
    { name: 'Orange', value: '#ff6600' },
    { name: 'Red', value: '#ff2a2a' },
    { name: 'Deep Blue', value: '#1f51ff' },
    { name: 'Coral', value: '#ff7f50' },
    { name: 'Teal', value: '#008080' },
    { name: 'Rainbow', value: 'rainbow' },
  ];

  const bgPresets = [
    { name: 'Space Void', value: '#06060c' },
    { name: 'Midnight', value: '#0a0d1a' },
    { name: 'Abyss Violet', value: '#0f0514' },
    { name: 'Pure Void', value: '#000000' },
  ];

  const handleSymmetryChange = (count: number) => {
    setSymmetryCount(count);
    onUpdateHistorySymmetry(count, mirror);
  };

  const handleMirrorToggle = (val: boolean) => {
    setMirror(val);
    onUpdateHistorySymmetry(symmetryCount, val);
  };

  const symmetryPresets = [6, 8, 12, 16, 24, 32];

  if (!sidebarOpen) return null;

  return (
    <div className={`controls-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>STUDIO CONTROLS</h2>
      </div>

      <div className="sidebar-content">
        {/* Symmetry count */}
        <div className="control-group">
          <div className="control-label-row">
            <span>Symmetry Lines</span>
            <span className="control-value">{symmetryCount}</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              min="2"
              max="64"
              value={symmetryCount}
              onChange={(e) => handleSymmetryChange(parseInt(e.target.value))}
            />
          </div>
          <div className="symmetry-presets">
            {symmetryPresets.map((preset) => (
              <button
                key={preset}
                className={`preset-btn ${symmetryCount === preset ? 'active' : ''}`}
                onClick={() => handleSymmetryChange(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Mirror Reflection */}
        <div className="toggle-row">
          <span className="toggle-label">Mirror Reflection</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={mirror}
              onChange={(e) => handleMirrorToggle(e.target.checked)}
            />
            <span className="slider-switch"></span>
          </label>
        </div>

        {/* Drawing Tools Grid */}
        <div className="control-group">
          <div className="control-label-row">
            <span>Drawing Tools</span>
          </div>
          <div className="tool-grid">
            <button
              className={`tool-btn ${selectedTool === 'brush' ? 'active' : ''}`}
              onClick={() => setSelectedTool('brush')}
              title="Standard Pen Brush"
            >
              <Paintbrush size={18} />
              <span>Brush</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'glow' ? 'active' : ''}`}
              onClick={() => setSelectedTool('glow')}
              title="Neon Glowing Brush"
            >
              <Sparkles size={18} />
              <span>Neon</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'line' ? 'active' : ''}`}
              onClick={() => setSelectedTool('line')}
              title="Symmetric Straight Lines"
            >
              <Spline size={18} />
              <span>Line</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'fractal' ? 'active' : ''}`}
              onClick={() => setSelectedTool('fractal')}
              title="Fractal Branching Brush"
            >
              <GitFork size={18} />
              <span>Fractal</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'hyperbolic' ? 'active' : ''}`}
              onClick={() => setSelectedTool('hyperbolic')}
              title="Poincar? Hyperbolic Disk"
            >
              <Globe size={18} />
              <span>Hyperbolic</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'paint-dot' ? 'active' : ''}`}
              onClick={() => setSelectedTool('paint-dot')}
              title="3D Paint Rock Droplet (Hold to grow)"
            >
              <Droplet size={18} />
              <span>Paint Dot</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setSelectedTool('eraser')}
              title="Composite Eraser"
            >
              <Eraser size={18} />
              <span>Eraser</span>
            </button>
          </div>
          <div style={{ marginTop: '4px' }}>
            <button
              className={`preset-btn ${selectedTool === 'pan' ? 'active' : ''}`}
              style={{ width: '100%', display: 'flex', gap: '8px', padding: '10px 0' }}
              onClick={() => setSelectedTool('pan')}
            >
              <Move size={15} />
              <span>Camera View / Pan Mode</span>
            </button>
          </div>
        </div>

        {/* Brush styling */}
        <div className="control-group">
          <div className="control-label-row">
            <span>Brush Size</span>
            <span className="control-value">{brushWidth}px</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="50"
              value={brushWidth}
              onChange={(e) => setBrushWidth(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="control-group">
          <div className="control-label-row">
            <span>Brush Opacity</span>
            <span className="control-value">{Math.round(opacity * 100)}%</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              min="10"
              max="100"
              value={opacity * 100}
              onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
            />
          </div>
        </div>

        {/* Color Palette */}
        {selectedTool !== 'eraser' && selectedTool !== 'pan' && (
          <div className="control-group">
            <div className="control-label-row">
              <span>Color Palette</span>
            </div>
            <div className="color-picker-grid">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  className={`color-swatch ${preset.value === 'rainbow' ? 'rainbow' : ''} ${
                    currentColor === preset.value ? 'active' : ''
                  }`}
                  style={preset.value !== 'rainbow' ? { backgroundColor: preset.value } : {}}
                  onClick={() => setCurrentColor(preset.value)}
                  title={preset.name}
                  aria-label={preset.name}
                />
              ))}
            </div>

            {currentColor !== 'rainbow' && (
              <div className="color-picker-custom" style={{ marginTop: '8px' }}>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                />
                <span className="color-picker-label">Custom Palette Color</span>
              </div>
            )}
          </div>
        )}

        {/* Background & Guides */}
        <div className="control-group">
          <div className="control-label-row">
            <span>Background & Guidelines</span>
          </div>

          <div className="bg-selector-grid">
            {bgPresets.map((bg) => (
              <button
                key={bg.name}
                className={`bg-select-btn ${bgColor === bg.value ? 'active' : ''}`}
                onClick={() => setBgColor(bg.value)}
              >
                <div 
                  className="bg-preview" 
                  style={{
                    background: bgType === 'solid' 
                      ? bg.value 
                      : `radial-gradient(circle, ${bg.value} 0%, #050508 100%)`
                  }} 
                />
                <span>{bg.name}</span>
              </button>
            ))}
          </div>

          <div className="symmetry-presets" style={{ marginTop: '6px' }}>
            <button
              className={`preset-btn ${bgType === 'solid' ? 'active' : ''}`}
              onClick={() => setBgType('solid')}
            >
              Solid Background
            </button>
            <button
              className={`preset-btn ${bgType === 'radial-gradient' ? 'active' : ''}`}
              onClick={() => setBgType('radial-gradient')}
            >
              Radial Shading
            </button>
          </div>

          <div className="toggle-row" style={{ marginTop: '6px' }}>
            <span className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} /> Show Guide Lines
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              <span className="slider-switch"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="instruction-box">
          <HelpCircle size={18} />
          <div>
            <strong>Interactive Canvas:</strong> Use <strong>Scroll Wheel</strong> or <strong>Pinch</strong> to zoom. 
            Hold <strong>Spacebar</strong> or <strong>Middle Mouse Button</strong> to pan your workspace.
          </div>
        </div>
      </div>
    </div>
  );
};
