import { FINDER_PATTERN_SIZE } from './constants.ts';

/** A connected group of modules stored in its smallest bounding box. */
export interface Figure {
  x: number;
  y: number;
  pixels: boolean[][];
}

export function isFinderPattern(figure: Figure, size: number): boolean {
  const { x, y, pixels } = figure;
  const width = pixels[0]?.length ?? 0;
  const height = pixels.length;
  const right = x + width - 1;
  const bottom = y + height - 1;

  const finderRegions: Array<[number, number, number, number]> = [
    [0, 0, FINDER_PATTERN_SIZE - 1, FINDER_PATTERN_SIZE - 1],
    [size - FINDER_PATTERN_SIZE, 0, size - 1, FINDER_PATTERN_SIZE - 1],
    [0, size - FINDER_PATTERN_SIZE, FINDER_PATTERN_SIZE - 1, size - 1],
  ];

  for (const [rx1, ry1, rx2, ry2] of finderRegions) {
    if (x >= rx1 && y >= ry1 && right <= rx2 && bottom <= ry2) {
      return true;
    }
  }

  return false;
}

export function extractFigures(image: boolean[][]): Figure[] {
  const height = image.length;
  const width = image[0]?.length ?? 0;

  const visited: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));

  const figures: Figure[] = [];

  const directions = [
    [0, -1], // up
    [1, 0], // right
    [0, 1], // down
    [-1, 0], // left
  ];

  function isInside(x: number, y: number): boolean {
    return y >= 0 && y < height && x >= 0 && x < width;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y][x]) continue;
      if (!image[y][x]) continue;

      const cells: Array<[number, number]> = [[x, y]];

      visited[y][x] = true;

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;

      for (let head = 0; head < cells.length; head++) {
        const [cx, cy] = cells[head];

        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        for (const [dx, dy] of directions) {
          const nx = cx + dx;
          const ny = cy + dy;

          if (!isInside(nx, ny)) continue;
          if (visited[ny][nx]) continue;
          if (!image[ny][nx]) continue;

          visited[ny][nx] = true;
          cells.push([nx, ny]);
        }
      }

      const figureWidth = maxX - minX + 1;
      const figureHeight = maxY - minY + 1;

      const pixels: boolean[][] = Array.from({ length: figureHeight }, () =>
        Array(figureWidth).fill(false),
      );

      for (const [cellX, cellY] of cells) {
        pixels[cellY - minY][cellX - minX] = true;
      }

      figures.push({
        x: minX,
        y: minY,
        pixels,
      });
    }
  }

  return figures;
}
