import { MODULE_CORNER_RADIUS, TILE_SIZE } from './constants.ts';
import type { Figure } from './figures.ts';

interface SvgPathOptions {
  pixelSize?: number;
  radius?: number;
}

interface Point {
  x: number;
  y: number;
}

interface Edge {
  from: Point;
  to: Point;
}

type CornerRadius = (prev: Point, current: Point, next: Point) => number;

export function figureToSvgPath(figure: Figure, options: SvgPathOptions = {}): string {
  const pixelSize = options.pixelSize ?? TILE_SIZE;
  const radius = options.radius ?? MODULE_CORNER_RADIUS;
  const contours = buildContours(getBoundaryEdges(figure, pixelSize));
  const cornerRadius = createCornerRadiusResolver(figure, pixelSize, radius);

  return contours.map((contour) => contourToRoundedPath(contour, cornerRadius)).join(' ');
}

function hasPixel(pixels: boolean[][], x: number, y: number): boolean {
  return pixels[y]?.[x] ?? false;
}

function getBoundaryEdges(figure: Figure, pixelSize: number): Edge[] {
  const pixels = figure.pixels;
  const height = pixels.length;
  const width = pixels[0]?.length ?? 0;

  const edges: Edge[] = [];

  function px(x: number): number {
    return (figure.x + x) * pixelSize;
  }

  function py(y: number): number {
    return (figure.y + y) * pixelSize;
  }

  // Trace exposed edges with the filled module on their right.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!pixels[y][x]) continue;

      const left = px(x);
      const right = px(x + 1);
      const top = py(y);
      const bottom = py(y + 1);

      if (!hasPixel(pixels, x, y - 1)) {
        edges.push({
          from: { x: left, y: top },
          to: { x: right, y: top },
        });
      }

      if (!hasPixel(pixels, x + 1, y)) {
        edges.push({
          from: { x: right, y: top },
          to: { x: right, y: bottom },
        });
      }

      if (!hasPixel(pixels, x, y + 1)) {
        edges.push({
          from: { x: right, y: bottom },
          to: { x: left, y: bottom },
        });
      }

      if (!hasPixel(pixels, x - 1, y)) {
        edges.push({
          from: { x: left, y: bottom },
          to: { x: left, y: top },
        });
      }
    }
  }

  return edges;
}

function hasFilledCorner(
  pixels: boolean[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
): boolean {
  return (
    hasPixel(pixels, x + dx, y) && hasPixel(pixels, x, y + dy) && hasPixel(pixels, x + dx, y + dy)
  );
}

function createCornerRadiusResolver(
  figure: Figure,
  pixelSize: number,
  radius: number,
): CornerRadius {
  return (prev: Point, current: Point, next: Point): number => {
    if (getTurn(prev, current, next) < 0) {
      const x = Math.round(Math.min(prev.x, current.x, next.x) / pixelSize) - figure.x;
      const y = Math.round(Math.min(prev.y, current.y, next.y) / pixelSize) - figure.y;

      // Each old selector assignment reset the previous match when it failed.
      // Consequently only n_rb could survive the final assignment.
      const topLeft = hasFilledCorner(figure.pixels, x, y, -1, -1);
      const bottomLeft = hasFilledCorner(figure.pixels, x, y, -1, 1);
      const topRight = hasFilledCorner(figure.pixels, x, y, 1, -1);
      const bottomRight = hasFilledCorner(figure.pixels, x, y, 1, 1);
      const roundsBottomRight = bottomRight && (!topRight || (bottomLeft && !topLeft));

      return roundsBottomRight &&
        current.x === (figure.x + (x + 1)) * pixelSize &&
        current.y === (figure.y + (y + 1)) * pixelSize
        ? radius
        : 0;
    }

    return radius;
  };
}

function buildContours(edges: Edge[]): Point[][] {
  const edgeMap = new Map<string, Point[]>();

  for (const edge of edges) {
    const key = pointKey(edge.from);
    const list = edgeMap.get(key);
    if (list) {
      list.push(edge.to);
    } else {
      edgeMap.set(key, [edge.to]);
    }
  }

  const contours: Point[][] = [];

  while (true) {
    const startKey = edgeMap.keys().next().value;
    if (startKey === undefined) break;

    const [x, y] = startKey.split(',').map(Number);
    const start = { x, y };

    const contour: Point[] = [start];
    let current = start;

    while (true) {
      const candidates = edgeMap.get(pointKey(current));

      if (!candidates || candidates.length === 0) {
        throw new Error('Broken contour: edge chain is not closed');
      }

      // At a diagonal touch, keep the filled pixel on the right of the edge.
      // Otherwise two convex corners become concave and a false hole is traced.
      let nextIndex = 0;
      if (candidates.length > 1 && contour.length > 1) {
        const prev = contour[contour.length - 2];
        const rightTurn = candidates.findIndex(
          (candidate) => getTurn(prev, current, candidate) > 0,
        );
        if (rightTurn !== -1) nextIndex = rightTurn;
      }
      const [next] = candidates.splice(nextIndex, 1);
      if (candidates.length === 0) edgeMap.delete(pointKey(current));

      if (samePoint(next, start)) {
        break;
      }

      contour.push(next);
      current = next;
    }

    contours.push(contour);
  }

  return contours;
}

function contourToRoundedPath(contour: Point[], cornerRadius: CornerRadius): string {
  const n = contour.length;

  if (n === 0) return '';

  const commands: string[] = [];

  for (let i = 0; i < n; i++) {
    const prev = contour[(i - 1 + n) % n];
    const current = contour[i];
    const next = contour[(i + 1) % n];

    const incomingLength = distance(current, prev);
    const outgoingLength = distance(current, next);

    const r = Math.min(cornerRadius(prev, current, next), incomingLength / 2, outgoingLength / 2);

    const beforeCorner = moveTowards(current, prev, r);
    const afterCorner = moveTowards(current, next, r);

    commands.push(`${i === 0 ? 'M' : 'L'} ${beforeCorner.x} ${beforeCorner.y}`);

    if (r > 0) {
      commands.push(`Q ${current.x} ${current.y} ${afterCorner.x} ${afterCorner.y}`);
    }
  }

  commands.push('Z');

  return commands.join(' ');
}

function moveTowards(from: Point, to: Point, distanceValue: number): Point {
  const length = distance(from, to);

  if (length === 0) {
    return { ...from };
  }

  const ratio = distanceValue / length;

  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointKey(point: Point): string {
  return `${point.x},${point.y}`;
}

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/** Positive for a right turn in SVG's downward-pointing Y axis. */
function getTurn(prev: Point, current: Point, next: Point): number {
  return (current.x - prev.x) * (next.y - current.y) - (current.y - prev.y) * (next.x - current.x);
}
