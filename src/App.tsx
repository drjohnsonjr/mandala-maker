import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from './components/Canvas';
import { Controls } from './components/Controls';
import { TopBar } from './components/TopBar';
import { useCanvasState } from './hooks/useCanvasState';
import type { Stroke } from './utils/export';
import { exportToSVG, renderStrokesToCanvas } from './utils/export';
import { Menu } from 'lucide-react';

export const App: React.FC = () => {
  const {
    history,
    redoStack,
    activeStroke,
    startStroke,
    updateStroke,
    endStroke,
    undo,
    redo,
    clear,
    updateAllSymmetries
  } = useCanvasState();

  // Control options state
  const [selectedTool, setSelectedTool] = useState<Stroke['tool'] | 'pan'>('brush');
  const [currentColor, setCurrentColor] = useState<string>('#ff007f'); // Neon Pink default
  const [brushWidth, setBrushWidth] = useState<number>(3);
  const [opacity, setOpacity] = useState<number>(0.9);
  const [symmetryCount, setSymmetryCount] = useState<number>(8);
  const [mirror, setMirror] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#06060c');
  const [bgType, setBgType] = useState<'solid' | 'radial-gradient'>('radial-gradient');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // References for Spacebar panning shortcut
  const previousToolRef = useRef<Stroke['tool'] | 'pan' | null>(null);
  const spacebarPressedRef = useRef<boolean>(false);

  // Handle keyboard shortcuts (Ctrl+Z, Ctrl+Y, Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      
      // Redo: Ctrl+Y
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // Spacebar: temporarily switch to pan mode
      if (e.key === ' ' && !spacebarPressedRef.current) {
        spacebarPressedRef.current = true;
        previousToolRef.current = selectedTool;
        setSelectedTool('pan');
        // Prevent default spacebar scrolling behavior
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && spacebarPressedRef.current) {
        spacebarPressedRef.current = false;
        if (previousToolRef.current !== null) {
          setSelectedTool(previousToolRef.current);
          previousToolRef.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, selectedTool]);

  // Export to PNG (High Resolution: 2000x2000)
  const handleExportPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw everything at full quality
    renderStrokesToCanvas(
      ctx,
      history,
      canvas.width,
      canvas.height,
      0, // Centered
      0,
      2.5, // High zoom scale for crisp vector elements
      bgColor,
      bgType
    );

    // Trigger download
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `mandala-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  // Export to SVG (Scalable Vector Graphic)
  const handleExportSVG = () => {
    const svgContent = exportToSVG(history, bgColor, bgType, 1000, 1000);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mandala-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetView = () => {
    if ((window as any).resetCanvasView) {
      (window as any).resetCanvasView();
    }
  };

  return (
    <div className="app-container">
      {/* Top Header Control Bar */}
      <TopBar
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={undo}
        onRedo={redo}
        onClear={clear}
        onResetView={handleResetView}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Floating control sidebar toggle tab (visible when collapsed) */}
      {!sidebarOpen && (
        <button 
          className="sidebar-toggle-tab"
          onClick={() => setSidebarOpen(true)}
          title="Show Controls"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Studio Controls Sidebar */}
      <Controls
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        brushWidth={brushWidth}
        setBrushWidth={setBrushWidth}
        opacity={opacity}
        setOpacity={setOpacity}
        symmetryCount={symmetryCount}
        setSymmetryCount={setSymmetryCount}
        mirror={mirror}
        setMirror={setMirror}
        bgColor={bgColor}
        setBgColor={setBgColor}
        bgType={bgType}
        setBgType={setBgType}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onUpdateHistorySymmetry={updateAllSymmetries}
      />

      {/* Full-Screen Interaction Canvas */}
      <Canvas
        history={history}
        activeStroke={activeStroke}
        startStroke={startStroke}
        updateStroke={updateStroke}
        endStroke={endStroke}
        selectedTool={selectedTool}
        currentColor={currentColor}
        brushWidth={brushWidth}
        opacity={opacity}
        symmetryCount={symmetryCount}
        mirror={mirror}
        bgColor={bgColor}
        bgType={bgType}
        showGrid={showGrid}
      />
    </div>
  );
};

export default App;
