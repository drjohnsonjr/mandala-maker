import React, { useState } from 'react';
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
  Droplet,
  Compass,
  Sliders,
  Palette,
  Layers,
  Info
} from 'lucide-react';
import type { Stroke } from '../utils/export';

interface ColorPalette {
  name: string;
  colors: string[];
}

interface PaletteCategory {
  category: string;
  palettes: ColorPalette[];
}

const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    category: 'Nature',
    palettes: [
      { name: 'Forest', colors: ['#2d5a27', '#4a7c59', '#68a357', '#8fc0a9', '#d4a373', '#e9c46a'] },
      { name: 'Ocean', colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#ffd700'] },
      { name: 'Desert', colors: ['#e76f51', '#f4a261', '#e9c46a', '#2a9d8f', '#264653', '#8e9aaf'] },
      { name: 'Sky', colors: ['#1d3557', '#457b9d', '#a8dadc', '#f1faee', '#e63946', '#ffb703'] },
      { name: 'Sunset', colors: ['#3d0c11', '#800020', '#d11a2a', '#e65c00', '#f9d976', '#4a00e0'] },
      { name: 'Earth Tones', colors: ['#6b705c', '#a5a58d', '#b7b7a4', '#ffe8d6', '#ddbea9', '#cb997e'] },
    ]
  },
  {
    category: 'Seasonal',
    palettes: [
      { name: 'Spring Pastels', colors: ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea', '#ffc6ff'] },
      { name: 'Summer Brights', colors: ['#ff007f', '#ff5e00', '#ffea00', '#00f0ff', '#39ff14', '#b026ff'] },
      { name: 'Autumn Rusts', colors: ['#800f2f', '#a71e34', '#c93c43', '#e76f51', '#f4a261', '#582f0e'] },
      { name: 'Winter Cools', colors: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#ade8f4'] },
    ]
  },
  {
    category: 'Emotional',
    palettes: [
      { name: 'Calm/Serene', colors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'] },
      { name: 'Energetic', colors: ['#ff0055', '#ff5000', '#ffcc00', '#33cc33', '#0099ff', '#ff00ff'] },
      { name: 'Luxury', colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd', '#ffd700'] },
    ]
  },
  {
    category: 'Stylistic Eras',
    palettes: [
      { name: 'Retro/Vintage', colors: ['#e07a5f', '#f4f1de', '#3d405b', '#81b29a', '#f2cc8f', '#f11a7b'] },
      { name: 'Neon/Cyberpunk', colors: ['#00f0ff', '#ff007f', '#39ff14', '#ffd700', '#b026ff', '#ff5e00'] },
      { name: 'Bauhaus', colors: ['#dd2c00', '#0d47a1', '#ffeb3b', '#212121', '#eceff1', '#78909c'] },
      { name: 'Mid-Century', colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#a8dadc'] },
    ]
  },
  {
    category: 'Brand/Functional',
    palettes: [
      { name: 'Minimal Neutrals', colors: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d'] },
      { name: 'Corporate Blues', colors: ['#0a192f', '#172a45', '#3066be', '#b4c5e4', '#fbfff1', '#091540'] },
      { name: 'Fintech Greens', colors: ['#004b23', '#007200', '#38b000', '#70e000', '#9ef01a', '#ccff33'] },
      { name: 'Dark Mode', colors: ['#121214', '#1a1a1e', '#2a2a32', '#3e3e4a', '#00f0ff', '#ff007f'] },
    ]
  }
];

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
  activePaletteColors: string[];
  setActivePaletteColors: (colors: string[]) => void;
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
  activePaletteColors,
  setActivePaletteColors,
}) => {
  const [activeTab, setActiveTab] = useState<'symmetry' | 'tools' | 'brush' | 'colors' | 'canvas' | 'about'>('tools');
  const [selectedCategory, setSelectedCategory] = useState<string>('Nature');
  const [selectedPaletteName, setSelectedPaletteName] = useState<string>('Forest');
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([]);

  // Initialize activePaletteColors on mount if empty
  React.useEffect(() => {
    if (activePaletteColors.length === 0) {
      setActivePaletteColors(['#2d5a27', '#4a7c59', '#68a357', '#8fc0a9', '#d4a373', '#e9c46a']);
    }
  }, [activePaletteColors, setActivePaletteColors]);

  const selectPalette = (category: string, name: string, colors: string[]) => {
    setSelectedCategory(category);
    setSelectedPaletteName(name);
    setActivePaletteColors(colors);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 8, 8);

        const imgData = ctx.getImageData(0, 0, 8, 8).data;
        const hexColors: string[] = [];

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];
          if (a < 100) continue;

          const hex = '#' + [r, g, b].map(x => {
            const h = x.toString(16);
            return h.length === 1 ? '0' + h : h;
          }).join('');

          if (!hexColors.includes(hex)) {
            hexColors.push(hex);
          }
        }

        const colors = hexColors.slice(0, 6);
        if (colors.length > 0) {
          const customName = `Photo ${customPalettes.length + 1}`;
          const newPalette: ColorPalette = { name: customName, colors };
          setCustomPalettes(prev => [...prev, newPalette]);
          setSelectedCategory('Custom (Photo)');
          setSelectedPaletteName(customName);
          setActivePaletteColors(colors);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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

      <div className="sidebar-tabs-container">
        {/* Left Side: Vertical Tab Strip */}
        <div className="vertical-tab-strip">
          <button
            className={`tab-btn ${activeTab === 'symmetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('symmetry')}
            title="Symmetry Settings"
          >
            <Compass size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
            title="Drawing Tools"
          >
            <Paintbrush size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === 'brush' ? 'active' : ''}`}
            onClick={() => setActiveTab('brush')}
            title="Brush Settings"
          >
            <Sliders size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
            title="Color Palette"
          >
            <Palette size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === 'canvas' ? 'active' : ''}`}
            onClick={() => setActiveTab('canvas')}
            title="Background & Guides"
          >
            <Layers size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
            title="About this App"
          >
            <Info size={20} />
          </button>
        </div>

        {/* Right Side: Tab Content Pane */}
        <div className="tab-content-pane">
          <div className="sidebar-content fade-in" key={activeTab}>
            {activeTab === 'symmetry' && (
              <>
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
              </>
            )}

            {activeTab === 'tools' && (
              <>
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
                      title="Poincaré Hyperbolic Disk"
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
              </>
            )}

            {activeTab === 'brush' && (
              <>
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
              </>
            )}

            {activeTab === 'colors' && (
              <>
                {/* Color Palette */}
                {selectedTool !== 'eraser' && selectedTool !== 'pan' ? (
                  <>
                    {/* Category Selector */}
                    <div className="control-group">
                      <label className="control-label-row">
                        <span>Palette Category</span>
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setSelectedCategory(cat);
                          if (cat === 'Custom (Photo)') {
                            if (customPalettes.length > 0) {
                              setSelectedPaletteName(customPalettes[0].name);
                              setActivePaletteColors(customPalettes[0].colors);
                            }
                          } else {
                            const catObj = PALETTE_CATEGORIES.find(c => c.category === cat);
                            if (catObj && catObj.palettes.length > 0) {
                              setSelectedPaletteName(catObj.palettes[0].name);
                              setActivePaletteColors(catObj.palettes[0].colors);
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--glass-border)',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {PALETTE_CATEGORIES.map(c => (
                          <option key={c.category} value={c.category} style={{ background: '#0a0d1a', color: 'white' }}>
                            {c.category}
                          </option>
                        ))}
                        <option value="Custom (Photo)" style={{ background: '#0a0d1a', color: 'white' }}>
                          Custom (Photo)
                        </option>
                      </select>
                    </div>

                    {/* Palette Selector */}
                    <div className="control-group">
                      <label className="control-label-row">
                        <span>Select Palette</span>
                      </label>
                      <div 
                        className="bg-selector-grid"
                        style={{
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          maxHeight: '90px',
                          overflowY: 'auto',
                          border: '1px solid rgba(255,255,255,0.05)',
                          padding: '4px',
                          borderRadius: '10px',
                          background: 'rgba(0,0,0,0.15)'
                        }}
                      >
                        {selectedCategory === 'Custom (Photo)' ? (
                          customPalettes.length > 0 ? (
                            customPalettes.map(p => (
                              <button
                                key={p.name}
                                className={`preset-btn ${selectedPaletteName === p.name ? 'active' : ''}`}
                                onClick={() => selectPalette('Custom (Photo)', p.name, p.colors)}
                                style={{ padding: '6px', fontSize: '0.8rem' }}
                              >
                                {p.name}
                              </button>
                            ))
                          ) : (
                            <div style={{ gridColumn: 'span 2', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center', padding: '10px 0' }}>
                              No photo uploaded yet.
                            </div>
                          )
                        ) : (
                          (PALETTE_CATEGORIES.find(c => c.category === selectedCategory)?.palettes || []).map(p => (
                            <button
                              key={p.name}
                              className={`preset-btn ${selectedPaletteName === p.name ? 'active' : ''}`}
                              onClick={() => selectPalette(selectedCategory, p.name, p.colors)}
                              style={{ padding: '6px', fontSize: '0.8rem' }}
                            >
                              {p.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Photo Palette Extractor */}
                    <div className="control-group">
                      <label className="control-label-row">
                        <span>Extract from Photo</span>
                      </label>
                      <label 
                        className="preset-btn"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '8px',
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          gap: '6px'
                        }}
                      >
                        <Layers size={14} />
                        <span>Upload Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Palette Swatches */}
                    <div className="control-group">
                      <label className="control-label-row">
                        <span>Active Palette Swatches</span>
                      </label>
                      <div 
                        className="color-picker-grid"
                        style={{
                          gridTemplateColumns: 'repeat(6, 1fr)',
                          gap: '8px'
                        }}
                      >
                        {activePaletteColors.map((color, idx) => (
                          <button
                            key={idx}
                            className={`color-swatch ${currentColor === color ? 'active' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setCurrentColor(color)}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Rainbow & Custom Colors */}
                    <div className="control-group" style={{ marginTop: '4px' }}>
                      <button
                        className={`preset-btn ${currentColor === 'rainbow' ? 'active' : ''}`}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px 0',
                          background: currentColor === 'rainbow' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.03)',
                          color: currentColor === 'rainbow' ? '#000' : '#fff',
                          fontWeight: currentColor === 'rainbow' ? 'bold' : 'normal'
                        }}
                        onClick={() => setCurrentColor('rainbow')}
                      >
                        <Sparkles size={16} />
                        <span>Rainbow (Active Palette)</span>
                      </button>
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
                  </>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                    Colors are disabled while using Eraser or Camera View.
                  </div>
                )}
              </>
            )}

            {activeTab === 'canvas' && (
              <>
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
              </>
            )}

            {activeTab === 'about' && (
              <div className="about-section">
                <div className="about-card">
                  <div className="about-title">Mandala Studio</div>
                  <p>
                    Welcome to a meditative drawing space designed for creating complex symmetrical geometry.
                  </p>
                  <p style={{ marginTop: '8px' }}>
                    This application was inspired by the delicate art of <span className="about-highlight">mandala painted rocks</span>, combining organic squeezing-droplet physics with mathematical reflection axes.
                  </p>
                  <div className="about-credit">
                    Created with 🤍 by an AI collaborator using <span className="about-highlight">Antigravity</span> powered by the <span className="about-highlight">Gemini 3.5 Flash</span> language model.
                  </div>
                </div>
                
                <div className="instruction-box" style={{ marginTop: '4px' }}>
                  <HelpCircle size={18} />
                  <div>
                    <strong>Instructions:</strong> Use your mouse or fingers to draw. Adjust symmetry and tools on the fly—the system updates your history dynamically!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab !== 'about' && (
        <div className="sidebar-footer">
          <div className="instruction-box">
            <HelpCircle size={18} />
            <div>
              <strong>Interactive Canvas:</strong> Use <strong>Scroll Wheel</strong> or <strong>Pinch</strong> to zoom. Hold <strong>Spacebar</strong> or <strong>Middle Mouse Button</strong> to pan your workspace.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
