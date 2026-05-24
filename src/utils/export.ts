import { getSymmetricPoints, generateFractalBranching, interpolateHyperbolicGeodesic } from './math';
import type { Point } from './math';

export interface Stroke {
  id: string;
  points: Point[];
  tool: 'brush' | 'glow' | 'line' | 'fractal' | 'hyperbolic' | 'eraser';
  color: string;
  width: number;
  opacity: number;
  symmetryCount: number;
  mirror: boolean;
}

// Render the vector stroke history to a given 2D Canvas context
export function renderStrokesToCanvas(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  width: number,
  height: number,
  panX: number,
  panY: number,
  zoom: number,
  bgColor: string,
  bgType: 'solid' | 'radial-gradient'
) {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.save();
  if (bgType === 'solid') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      10,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.5
    );
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#020204'); // Dark edge
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();

  // Draw strokes
  ctx.save();
  ctx.translate(width / 2 + panX, height / 2 + panY);
  ctx.scale(zoom, zoom);

  const diskRadius = 250; // Poincar? disk boundary

  strokes.forEach((stroke) => {
    if (stroke.points.length === 0) return;

    ctx.save();
    ctx.globalAlpha = stroke.opacity;

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
    }

    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'glow' && stroke.color !== 'rainbow') {
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = stroke.width * 2.5;
    }

    const symmetryCount = stroke.symmetryCount;
    const mirror = stroke.mirror;
    const drawPoints = stroke.points;

    if (stroke.tool === 'line') {
      const pStart = drawPoints[0];
      const pEnd = drawPoints[drawPoints.length - 1];

      const symmetricStarts = getSymmetricPoints(pStart, symmetryCount, mirror);
      const symmetricEnds = getSymmetricPoints(pEnd, symmetryCount, mirror);

      for (let s = 0; s < symmetricStarts.length; s++) {
        if (stroke.color === 'rainbow') {
          ctx.strokeStyle = `hsl(${(s * (360 / symmetricStarts.length)) % 360}, 100%, 55%)`;
        }
        ctx.beginPath();
        ctx.moveTo(symmetricStarts[s].x, symmetricStarts[s].y);
        ctx.lineTo(symmetricEnds[s].x, symmetricEnds[s].y);
        ctx.stroke();
      }
    } else if (stroke.tool === 'fractal') {
      const pStart = drawPoints[0];
      const pEnd = drawPoints[drawPoints.length - 1];
      // Generate a detailed recursive tree structure (depth = 5)
      const branches = generateFractalBranching(pStart, pEnd, stroke.width, 5);
      
      branches.forEach((branch) => {
        const symStarts = getSymmetricPoints(branch.p1, symmetryCount, mirror);
        const symEnds = getSymmetricPoints(branch.p2, symmetryCount, mirror);

        ctx.lineWidth = branch.width;
        for (let s = 0; s < symStarts.length; s++) {
          if (stroke.color === 'rainbow') {
            ctx.strokeStyle = `hsl(${(s * (360 / symStarts.length) + branch.width * 15) % 360}, 100%, 55%)`;
          }
          ctx.beginPath();
          ctx.moveTo(symStarts[s].x, symStarts[s].y);
          ctx.lineTo(symEnds[s].x, symEnds[s].y);
          ctx.stroke();
        }
      });
    } else if (stroke.tool === 'hyperbolic') {
      const pStart = drawPoints[0];
      const pEnd = drawPoints[drawPoints.length - 1];
      // Interpolate points smoothly along the Poincar? geodesic curve
      const geodesicPoints = interpolateHyperbolicGeodesic(pStart, pEnd, diskRadius, 35);

      const symmetricPaths: Point[][] = Array.from({ length: symmetryCount * (mirror ? 2 : 1) }, () => []);

      for (let pIdx = 0; pIdx < geodesicPoints.length; pIdx++) {
        const syms = getSymmetricPoints(geodesicPoints[pIdx], symmetryCount, mirror);
        for (let s = 0; s < syms.length; s++) {
          symmetricPaths[s].push(syms[s]);
        }
      }

      symmetricPaths.forEach((pathPoints) => {
        if (pathPoints.length < 2) return;
        
        if (stroke.color === 'rainbow') {
          for (let i = 0; i < pathPoints.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(pathPoints[i].x, pathPoints[i].y);
            ctx.lineTo(pathPoints[i + 1].x, pathPoints[i + 1].y);
            ctx.strokeStyle = `hsl(${(i * 4.5) % 360}, 100%, 55%)`;
            
            if (stroke.tool === 'glow') {
              ctx.shadowColor = `hsl(${(i * 4.5) % 360}, 100%, 55%)`;
              ctx.shadowBlur = stroke.width * 2.5;
            }
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
          for (let i = 1; i < pathPoints.length; i++) {
            ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          }
          ctx.stroke();
        }
      });
    } else {
      // Freehand pen, glow brush, or eraser
      const symmetricPaths: Point[][] = Array.from({ length: symmetryCount * (mirror ? 2 : 1) }, () => []);

      for (let pIdx = 0; pIdx < drawPoints.length; pIdx++) {
        const syms = getSymmetricPoints(drawPoints[pIdx], symmetryCount, mirror);
        for (let s = 0; s < syms.length; s++) {
          symmetricPaths[s].push(syms[s]);
        }
      }

      symmetricPaths.forEach((pathPoints) => {
        if (pathPoints.length < 2) return;
        
        if (stroke.color === 'rainbow') {
          for (let i = 0; i < pathPoints.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(pathPoints[i].x, pathPoints[i].y);
            ctx.lineTo(pathPoints[i + 1].x, pathPoints[i + 1].y);
            ctx.strokeStyle = `hsl(${(i * 3.5) % 360}, 100%, 55%)`;
            
            if (stroke.tool === 'glow') {
              ctx.shadowColor = `hsl(${(i * 3.5) % 360}, 100%, 55%)`;
              ctx.shadowBlur = stroke.width * 2.5;
            }
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
          for (let i = 1; i < pathPoints.length; i++) {
            ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          }
          ctx.stroke();
        }
      });
    }

    ctx.restore();
  });

  ctx.restore();
}

// Generate an SVG string from stroke history
export function exportToSVG(
  strokes: Stroke[],
  bgColor: string,
  bgType: 'solid' | 'radial-gradient',
  canvasWidth = 1000,
  canvasHeight = 1000
): string {
  const halfW = canvasWidth / 2;
  const halfH = canvasHeight / 2;
  const diskRadius = 250; // Poincar? disk radius

  let bgSVG = '';
  if (bgType === 'solid') {
    bgSVG = `<rect x="-${halfW}" y="-${halfH}" width="${canvasWidth}" height="${canvasHeight}" fill="${bgColor}" />`;
  } else {
    bgSVG = `
    <defs>
      <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="${bgColor}" />
        <stop offset="100%" stop-color="#020204" />
      </radialGradient>
    </defs>
    <rect x="-${halfW}" y="-${halfH}" width="${canvasWidth}" height="${canvasHeight}" fill="url(#bg-grad)" />`;
  }

  const glowFilter = `
    <filter id="svg-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>`;

  const hasErasers = strokes.some((s) => s.tool === 'eraser');
  let maskDef = '';
  let maskAttr = '';

  if (hasErasers) {
    maskDef = `<mask id="eraser-mask">
      <rect x="-${halfW}" y="-${halfH}" width="${canvasWidth}" height="${canvasHeight}" fill="white" />`;

    strokes.forEach((stroke) => {
      if (stroke.tool !== 'eraser') return;
      
      const drawPoints = stroke.points;
      if (drawPoints.length === 0) return;

      const symPaths: Point[][] = Array.from({ length: stroke.symmetryCount * (stroke.mirror ? 2 : 1) }, () => []);
      for (let pIdx = 0; pIdx < drawPoints.length; pIdx++) {
        const syms = getSymmetricPoints(drawPoints[pIdx], stroke.symmetryCount, stroke.mirror);
        for (let s = 0; s < syms.length; s++) {
          symPaths[s].push(syms[s]);
        }
      }

      symPaths.forEach((path) => {
        if (path.length < 2) return;
        let d = `M ${path[0].x.toFixed(1)} ${path[0].y.toFixed(1)}`;
        for (let i = 1; i < path.length; i++) {
          d += ` L ${path[i].x.toFixed(1)} ${path[i].y.toFixed(1)}`;
        }
        maskDef += `\n      <path d="${d}" fill="none" stroke="black" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${stroke.opacity}" />`;
      });
    });

    maskDef += `\n    </mask>`;
    maskAttr = ' mask="url(#eraser-mask)"';
  }

  let drawingElements = `<g${maskAttr}>`;

  strokes.forEach((stroke) => {
    if (stroke.tool === 'eraser') return;
    if (stroke.points.length === 0) return;

    const filterStr = stroke.tool === 'glow' ? ' filter="url(#svg-glow)"' : '';
    const opacityStr = stroke.opacity !== 1 ? ` opacity="${stroke.opacity}"` : '';
    const baseAttrs = `fill="none" stroke="${stroke.color}" stroke-linecap="round" stroke-linejoin="round"${filterStr}${opacityStr}`;

    const drawPoints = stroke.points;

    if (stroke.tool === 'line') {
      const pStart = drawPoints[0];
      const pEnd = drawPoints[drawPoints.length - 1];

      const symStarts = getSymmetricPoints(pStart, stroke.symmetryCount, stroke.mirror);
      const symEnds = getSymmetricPoints(pEnd, stroke.symmetryCount, stroke.mirror);

      for (let s = 0; s < symStarts.length; s++) {
        const colorVal = stroke.color === 'rainbow' 
          ? `hsl(${(s * (360 / symStarts.length)) % 360}, 100%, 55%)` 
          : stroke.color;
        drawingElements += `\n      <line x1="${symStarts[s].x.toFixed(1)}" y1="${symStarts[s].y.toFixed(1)}" x2="${symEnds[s].x.toFixed(1)}" y2="${symEnds[s].y.toFixed(1)}" stroke-width="${stroke.width}" fill="none" stroke="${colorVal}" stroke-linecap="round" stroke-linejoin="round"${filterStr}${opacityStr} />`;
      }
    } else if (stroke.tool === 'fractal') {
      const pStart = drawPoints[0];
      const pEnd = drawPoints[drawPoints.length - 1];
      const branches = generateFractalBranching(pStart, pEnd, stroke.width, 5);
      
      branches.forEach((branch) => {
        const symStarts = getSymmetricPoints(branch.p1, stroke.symmetryCount, stroke.mirror);
        const symEnds = getSymmetricPoints(branch.p2, stroke.symmetryCount, stroke.mirror);

        for (let s = 0; s < symStarts.length; s++) {
          const colorVal = stroke.color === 'rainbow' 
            ? `hsl(${(s * (360 / symStarts.length) + branch.width * 15) % 360}, 100%, 55%)` 
            : stroke.color;
          drawingElements += `\n      <line x1="${symStarts[s].x.toFixed(1)}" y1="${symStarts[s].y.toFixed(1)}" x2="${symEnds[s].x.toFixed(1)}" y2="${symEnds[s].y.toFixed(1)}" stroke-width="${branch.width.toFixed(1)}" fill="none" stroke="${colorVal}" stroke-linecap="round" stroke-linejoin="round"${filterStr}${opacityStr} />`;
        }
      });
    } else if (stroke.tool === 'hyperbolic') {
      const pStart = drawPoints[0];
      const pEnd = drawPoints[drawPoints.length - 1];
      const geodesicPoints = interpolateHyperbolicGeodesic(pStart, pEnd, diskRadius, 35);

      const symPaths: Point[][] = Array.from({ length: stroke.symmetryCount * (stroke.mirror ? 2 : 1) }, () => []);
      for (let pIdx = 0; pIdx < geodesicPoints.length; pIdx++) {
        const syms = getSymmetricPoints(geodesicPoints[pIdx], stroke.symmetryCount, stroke.mirror);
        for (let s = 0; s < syms.length; s++) {
          symPaths[s].push(syms[s]);
        }
      }

      symPaths.forEach((path) => {
        if (path.length < 2) return;
        
        if (stroke.color === 'rainbow') {
          for (let i = 0; i < path.length - 1; i++) {
            const colorVal = `hsl(${(i * 4.5) % 360}, 100%, 55%)`;
            drawingElements += `\n      <line x1="${path[i].x.toFixed(1)}" y1="${path[i].y.toFixed(1)}" x2="${path[i+1].x.toFixed(1)}" y2="${path[i+1].y.toFixed(1)}" stroke-width="${stroke.width}" fill="none" stroke="${colorVal}" stroke-linecap="round" stroke-linejoin="round"${filterStr}${opacityStr} />`;
          }
        } else {
          let d = `M ${path[0].x.toFixed(1)} ${path[0].y.toFixed(1)}`;
          for (let i = 1; i < path.length; i++) {
            d += ` L ${path[i].x.toFixed(1)} ${path[i].y.toFixed(1)}`;
          }
          drawingElements += `\n      <path d="${d}" stroke-width="${stroke.width}" ${baseAttrs} />`;
        }
      });
    } else {
      const symPaths: Point[][] = Array.from({ length: stroke.symmetryCount * (stroke.mirror ? 2 : 1) }, () => []);
      for (let pIdx = 0; pIdx < drawPoints.length; pIdx++) {
        const syms = getSymmetricPoints(drawPoints[pIdx], stroke.symmetryCount, stroke.mirror);
        for (let s = 0; s < syms.length; s++) {
          symPaths[s].push(syms[s]);
        }
      }

      symPaths.forEach((path) => {
        if (path.length < 2) return;
        
        if (stroke.color === 'rainbow') {
          for (let i = 0; i < path.length - 1; i++) {
            const colorVal = `hsl(${(i * 3.5) % 360}, 100%, 55%)`;
            drawingElements += `\n      <line x1="${path[i].x.toFixed(1)}" y1="${path[i].y.toFixed(1)}" x2="${path[i+1].x.toFixed(1)}" y2="${path[i+1].y.toFixed(1)}" stroke-width="${stroke.width}" fill="none" stroke="${colorVal}" stroke-linecap="round" stroke-linejoin="round"${filterStr}${opacityStr} />`;
          }
        } else {
          let d = `M ${path[0].x.toFixed(1)} ${path[0].y.toFixed(1)}`;
          for (let i = 1; i < path.length; i++) {
            d += ` L ${path[i].x.toFixed(1)} ${path[i].y.toFixed(1)}`;
          }
          drawingElements += `\n      <path d="${d}" stroke-width="${stroke.width}" ${baseAttrs} />`;
        }
      });
    }
  });

  drawingElements += '\n    </g>';

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-${halfW} -${halfH} ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}">
  <defs>
    ${glowFilter}
    ${maskDef}
  </defs>
  ${bgSVG}
  ${drawingElements}
</svg>`;
}
