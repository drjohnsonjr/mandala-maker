export interface Point {
  x: number;
  y: number;
}

// Convert screen coordinates to world coordinates (centered at mandala center)
export function screenToWorld(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  panX: number,
  panY: number,
  zoom: number
): Point {
  return {
    x: (screenX - width / 2 - panX) / zoom,
    y: (screenY - height / 2 - panY) / zoom,
  };
}

// Convert world coordinates back to screen coordinates
export function worldToScreen(
  worldX: number,
  worldY: number,
  width: number,
  height: number,
  panX: number,
  panY: number,
  zoom: number
): Point {
  return {
    x: worldX * zoom + panX + width / 2,
    y: worldY * zoom + panY + height / 2,
  };
}

// Rotate point around origin (0, 0) by angle in radians
export function rotatePoint(p: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  };
}

// Generate all symmetric versions of a point
export function getSymmetricPoints(
  p: Point,
  symmetryCount: number,
  mirror: boolean
): Point[] {
  const points: Point[] = [];
  const angleStep = (2 * Math.PI) / symmetryCount;

  for (let i = 0; i < symmetryCount; i++) {
    const angle = i * angleStep;
    
    // Rotational point
    const rotPoint = rotatePoint(p, angle);
    points.push(rotPoint);

    // Mirror point: reflect across the X-axis (y -> -y) before rotating
    if (mirror) {
      const mirrored: Point = { x: p.x, y: -p.y };
      const rotMirrored = rotatePoint(mirrored, angle);
      points.push(rotMirrored);
    }
  }

  return points;
}

// M?bius transformation to map point z to origin using parameter a
// phi_a(z) = (z - a) / (1 - conj(a)*z)
function mobius(z: Point, a: Point): Point {
  const x = z.x;
  const y = z.y;
  const ax = a.x;
  const ay = a.y;

  // u + i*v = 1 - conj(a)*z
  // conj(a)*z = (ax - i*ay)*(x + i*y) = (ax*x + ay*y) + i*(ax*y - ay*x)
  const u = 1 - (ax * x + ay * y);
  const v = ay * x - ax * y;
  const denom = u * u + v * v;

  if (denom < 1e-9) return { x, y };

  // Numerator: z - a = (x - ax) + i*(y - ay)
  const numX = x - ax;
  const numY = y - ay;

  // division: (numX + i*numY) / (u + i*v) = (numX + i*numY) * (u - i*v) / denom
  return {
    x: (numX * u + numY * v) / denom,
    y: (numY * u - numX * v) / denom,
  };
}

// Interpolate points along a hyperbolic geodesic in the Poincar? disk model
// diskRadius defines the physical boundary of the disk in world coordinates
export function interpolateHyperbolicGeodesic(
  p1: Point,
  p2: Point,
  diskRadius: number,
  steps = 15
): Point[] {
  // Normalize coordinates relative to the unit disk
  const n1 = { x: p1.x / diskRadius, y: p1.y / diskRadius };
  const n2 = { x: p2.x / diskRadius, y: p2.y / diskRadius };

  // Constrain points to be strictly inside the unit disk
  const d1 = n1.x * n1.x + n1.y * n1.y;
  const d2 = n2.x * n2.x + n2.y * n2.y;

  const clampToDisk = (p: Point, distSq: number): Point => {
    if (distSq >= 0.999) {
      const dist = Math.sqrt(distSq);
      return { x: (p.x / dist) * 0.99, y: (p.y / dist) * 0.99 };
    }
    return p;
  };

  const c1 = clampToDisk(n1, d1);
  const c2 = clampToDisk(n2, d2);

  // M?bius transform c2 by mapping c1 to the origin
  // In this mapped space, the geodesic from 0 to c2' is a straight line
  const c2Prime = mobius(c2, c1);

  const points: Point[] = [];
  
  // Interpolate along the straight line in the transformed space
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const zPrime = { x: c2Prime.x * t, y: c2Prime.y * t };
    
    // Map back to the original Poincar? disk coordinates using mobius(z', -c1)
    const negC1 = { x: -c1.x, y: -c1.y };
    const z = mobius(zPrime, negC1);
    
    // Denormalize back to world coordinates
    points.push({ x: z.x * diskRadius, y: z.y * diskRadius });
  }

  return points;
}

// Generate fractal branching segments from a single line segment
// Returns a list of segments, where each segment is a tuple of two Points
export interface Segment {
  p1: Point;
  p2: Point;
  width: number;
}

export function generateFractalBranching(
  p1: Point,
  p2: Point,
  initialWidth: number,
  maxDepth = 3,
  branchAngle = Math.PI / 6, // 30 degrees
  branchScale = 0.65
): Segment[] {
  const segments: Segment[] = [];

  function recurse(
    start: Point,
    end: Point,
    width: number,
    depth: number
  ) {
    segments.push({ p1: start, p2: end, width });

    if (depth >= maxDepth) return;

    // Calculate length and direction vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 2) return; // Stop if segments get too small

    const baseAngle = Math.atan2(dy, dx);
    const newLength = length * branchScale;
    const newWidth = width * 0.7;

    // Left branch
    const leftAngle = baseAngle - branchAngle;
    const leftEnd = {
      x: end.x + Math.cos(leftAngle) * newLength,
      y: end.y + Math.sin(leftAngle) * newLength,
    };
    recurse(end, leftEnd, newWidth, depth + 1);

    // Right branch
    const rightAngle = baseAngle + branchAngle;
    const rightEnd = {
      x: end.x + Math.cos(rightAngle) * newLength,
      y: end.y + Math.sin(rightAngle) * newLength,
    };
    recurse(end, rightEnd, newWidth, depth + 1);
  }

  recurse(p1, p2, initialWidth, 0);
  return segments;
}
