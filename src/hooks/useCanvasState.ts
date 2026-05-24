import { useState, useCallback } from 'react';
import type { Point } from '../utils/math';
import type { Stroke } from '../utils/export';

export function useCanvasState() {
  const [history, setHistory] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  

  const startStroke = useCallback((
    startPoint: Point,
    tool: Stroke['tool'],
    color: string,
    width: number,
    opacity: number,
    symmetryCount: number,
    mirror: boolean,
    diskRadius: number
  ) => {
    let p = startPoint;
    if (tool === 'hyperbolic') {
      const dist = Math.sqrt(p.x * p.x + p.y * p.y);
      if (dist >= diskRadius) {
        p = { x: (p.x / dist) * (diskRadius * 0.99), y: (p.y / dist) * (diskRadius * 0.99) };
      }
    }

    const newStroke: Stroke = {
      id: Math.random().toString(36).substring(2, 9),
      points: [p],
      tool,
      color,
      width,
      opacity,
      symmetryCount,
      mirror
    };

    setActiveStroke(newStroke);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  const updateStroke = useCallback((
    newPoint: Point,
    diskRadius: number
  ) => {
    setActiveStroke((prev) => {
      if (!prev) return null;

      const startPoint = prev.points[0];
      if (!startPoint) return prev;

      // For line, fractal, and hyperbolic tools, we only store start and end points.
      if (prev.tool === 'line' || prev.tool === 'fractal' || prev.tool === 'hyperbolic' || prev.tool === 'paint-dot') {
        let p = newPoint;
        if (prev.tool === 'hyperbolic') {
          const dist = Math.sqrt(p.x * p.x + p.y * p.y);
          if (dist >= diskRadius) {
            p = { x: (p.x / dist) * (diskRadius * 0.99), y: (p.y / dist) * (diskRadius * 0.99) };
          }
        }
        return {
          ...prev,
          points: [startPoint, p]
        };
      } else {
        // Freehand tools: append the new point
        return {
          ...prev,
          points: [...prev.points, newPoint]
        };
      }
    });
  }, []);

  const endStroke = useCallback(() => {
    setActiveStroke((prev) => {
      if (prev && prev.points.length > 0) {
        setHistory((prevHist) => [...prevHist, prev]);
      }
      return null;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prevHist) => {
      if (prevHist.length === 0) return prevHist;
      const newHist = prevHist.slice(0, -1);
      const popped = prevHist[prevHist.length - 1];
      setRedoStack((prevRedo) => [...prevRedo, popped]);
      return newHist;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const newRedo = prevRedo.slice(0, -1);
      const popped = prevRedo[prevRedo.length - 1];
      setHistory((prevHist) => [...prevHist, popped]);
      return newRedo;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
    setActiveStroke(null);
  }, []);

  // Update symmetries of already drawn strokes (Real-time updates)
  const updateAllSymmetries = useCallback((symmetryCount: number, mirror: boolean) => {
    setHistory((prevHist) =>
      prevHist.map((stroke) => ({
        ...stroke,
        symmetryCount,
        mirror
      }))
    );
  }, []);

  return {
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
  };
}
