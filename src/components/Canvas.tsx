import React, { useRef, useEffect, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import type { Point } from '../utils/math';
import { screenToWorld } from '../utils/math';
import type { Stroke } from '../utils/export';
import { renderStrokesToCanvas } from '../utils/export';

interface CanvasProps {
  history: Stroke[];
  activeStroke: Stroke | null;
  startStroke: (
    startPoint: Point,
    tool: Stroke['tool'],
    color: string,
    width: number,
    opacity: number,
    symmetryCount: number,
    mirror: boolean,
    diskRadius: number
  ) => void;
  updateStroke: (newPoint: Point, diskRadius: number) => void;
  endStroke: () => void;
  selectedTool: Stroke['tool'] | 'pan';
  currentColor: string;
  brushWidth: number;
  opacity: number;
  symmetryCount: number;
  mirror: boolean;
  bgColor: string;
  bgType: 'solid' | 'radial-gradient';
  showGrid: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({
  history,
  activeStroke,
  startStroke,
  updateStroke,
  endStroke,
  selectedTool,
  currentColor,
  brushWidth,
  opacity,
  symmetryCount,
  mirror,
  bgColor,
  bgType,
  showGrid,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan and Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);

  // References for panning and touch gestures
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number>(0);
  const touchStartZoomRef = useRef<number>(1);
  const touchStartPanRef = useRef<Point>({ x: 0, y: 0 });

  const diskRadius = 250; // Poincar? disk boundary in world coordinates

  // Combine history and active stroke for drawing
  const allStrokes = React.useMemo(() => {
    if (activeStroke) {
      return [...history, activeStroke];
    }
    return history;
  }, [history, activeStroke]);

  // Adjust canvas size on resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Set canvas display size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Set canvas drawing buffer size (high resolution)
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Draw everything
      draw();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    return () => window.removeEventListener('resize', handleResize);
  }, [allStrokes, zoom, pan, bgColor, bgType, showGrid, symmetryCount, mirror, selectedTool]);

  // Main drawing caller
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr); // scale to match high-resolution buffer

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Render strokes
    renderStrokesToCanvas(ctx, allStrokes, w, h, pan.x, pan.y, zoom, bgColor, bgType);

    // Draw Grid / Symmetry lines if enabled
    if (showGrid) {
      drawSymmetryGrid(ctx, w, h);
    }

    ctx.restore();
  };

  // Draw symmetry guidelines and hyperbolic boundary
  const drawSymmetryGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    // Center-translate and zoom/pan to match the drawing canvas transformations
    ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // 1. Draw Hyperbolic Poincar? Disk boundary if hyperbolic tool is active
    if (selectedTool === 'hyperbolic') {
      ctx.beginPath();
      ctx.arc(0, 0, diskRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 0, 150, 0.4)';
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      ctx.stroke();

      // Outer glow for the disk
      ctx.beginPath();
      ctx.arc(0, 0, diskRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 0, 150, 0.15)';
      ctx.lineWidth = 4 / zoom;
      ctx.stroke();
    }

    // 2. Draw Symmetry Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([6 / zoom, 6 / zoom]);

    const maxDist = Math.max(w, h) * 4 / zoom; // Long line
    const angleStep = (2 * Math.PI) / symmetryCount;

    for (let i = 0; i < symmetryCount; i++) {
      const angle = i * angleStep;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxDist * Math.cos(angle), maxDist * Math.sin(angle));
      ctx.stroke();

      // Draw bisectors for mirror planes if mirror symmetry is active
      if (mirror) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.setLineDash([3 / zoom, 6 / zoom]);
        ctx.beginPath();
        // The reflection plane bisects the sector
        const bisectorAngle = angle + angleStep / 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(maxDist * Math.cos(bisectorAngle), maxDist * Math.sin(bisectorAngle));
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Draw Center Guide Point
    ctx.beginPath();
    ctx.arc(0, 0, 4 / zoom, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    ctx.restore();
  };

  // Re-draw whenever strokes, zoom, pan, symmetry, or grid options change
  useEffect(() => {
    draw();
  }, [allStrokes, zoom, pan, bgColor, bgType, showGrid, symmetryCount, mirror, selectedTool]);

  // Handle Mouse Down
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Middle button or tool 'pan' starts panning
    if (e.button === 1 || selectedTool === 'pan') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      e.preventDefault();
      return;
    }

    // Left click starts drawing
    if (e.button === 0) {
      setIsDrawing(true);
      const worldPt = screenToWorld(x, y, rect.width, rect.height, pan.x, pan.y, zoom);
      startStroke(
        worldPt,
        selectedTool, // Already narrowed by TypeScript because selectedTool !== 'pan'
        currentColor,
        brushWidth,
        opacity,
        symmetryCount,
        mirror,
        diskRadius
      );
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (isDrawing && activeStroke) {
      const worldPt = screenToWorld(x, y, rect.width, rect.height, pan.x, pan.y, zoom);
      updateStroke(worldPt, diskRadius);
    }
  };

  // Handle Mouse Up (unused parameter e removed to fix warning)
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDrawing) {
      setIsDrawing(false);
      endStroke();
    }
  };

  // Zoom centered on cursor
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;

    // Constrain zoom between 0.1x and 50x
    const clampedZoom = Math.max(0.1, Math.min(50, newZoom));

    if (clampedZoom === zoom) return;

    // Adjust pan so the cursor points to the same world location after zoom
    const w = rect.width;
    const h = rect.height;

    // Pointer location in centered space before zoom
    const cx = x - w / 2;
    const cy = y - h / 2;

    const newPan = {
      x: cx - (cx - pan.x) * (clampedZoom / zoom),
      y: cy - (cy - pan.y) * (clampedZoom / zoom),
    };

    setZoom(clampedZoom);
    setPan(newPan);
  };

  // Touch Events for Mobile Panning, Drawing, and Pinch-to-Zoom
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();

    if (e.touches.length === 1) {
      // Single finger touch - either drawing or panning
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (selectedTool === 'pan') {
        setIsPanning(true);
        panStartRef.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
      } else {
        setIsDrawing(true);
        const worldPt = screenToWorld(x, y, rect.width, rect.height, pan.x, pan.y, zoom);
        startStroke(
          worldPt,
          selectedTool,
          currentColor,
          brushWidth,
          opacity,
          symmetryCount,
          mirror,
          diskRadius
        );
      }
    } else if (e.touches.length === 2) {
      // Two fingers touch - Pinch to Zoom + Pan
      setIsDrawing(false);
      setIsPanning(false);

      const t1 = e.touches[0];
      const t2 = e.touches[1];

      // Initial pinch distance
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      touchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);

      // Initial pinch midpoint
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchStartZoomRef.current = zoom;
      touchStartPanRef.current = { ...pan };
      panStartRef.current = { x: midX, y: midY };
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (isPanning) {
        setPan({
          x: touch.clientX - panStartRef.current.x,
          y: touch.clientY - panStartRef.current.y,
        });
      } else if (isDrawing && activeStroke) {
        const worldPt = screenToWorld(x, y, rect.width, rect.height, pan.x, pan.y, zoom);
        updateStroke(worldPt, diskRadius);
      }
    } else if (e.touches.length === 2) {
      // Dual touch: zoom and pan
      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      // Calculate new zoom factor
      const zoomFactor = dist / touchStartDistRef.current;
      const targetZoom = Math.max(0.1, Math.min(50, touchStartZoomRef.current * zoomFactor));

      // Calculate shift from pinch midpoint move
      const deltaPanX = midX - panStartRef.current.x;
      const deltaPanY = midY - panStartRef.current.y;

      // Adjust pan to center the zoom on the pinch center
      const w = rect.width;
      const h = rect.height;

      const cx = midX - rect.left - w / 2;
      const cy = midY - rect.top - h / 2;

      const basePanX = touchStartPanRef.current.x + deltaPanX;
      const basePanY = touchStartPanRef.current.y + deltaPanY;

      const newPanX = cx - (cx - basePanX) * (targetZoom / touchStartZoomRef.current);
      const newPanY = cy - (cy - basePanY) * (targetZoom / touchStartZoomRef.current);

      setZoom(targetZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  // Handle Touch End (unused parameter e removed to fix warning)
  const handleTouchEnd = () => {
    if (isDrawing) {
      setIsDrawing(false);
      endStroke();
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Helper to trigger center/reset view from parent controls
  useEffect(() => {
    (window as any).resetCanvasView = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    return () => {
      delete (window as any).resetCanvasView;
    };
  }, []);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="drawing-canvas"
      />
      {/* Zoom indicator HUD */}
      <div className="zoom-hud">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};
