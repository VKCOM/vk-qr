import assert from 'node:assert/strict';
import { it } from 'node:test';
import { figureToSvgPath } from '../src/svg-path.ts';

it('rounds both convex corners at the diagonal touch in the selected figure', () => {
  const path = figureToSvgPath({
    x: 28,
    y: 29,
    pixels: [
      [false, false, true, true],
      [false, true, true, false],
      [true, false, true, false],
      [true, true, true, true],
    ],
  });

  assert.equal(path.match(/Q 2900 3100 /g)?.length, 2);
  assert.equal(path.match(/M /g)?.length, 1);
  assert.ok(!path.includes('Q 3000 3100 '));
});

it('keeps previously square corners around an empty tile sharp', () => {
  const path = figureToSvgPath({
    x: 2,
    y: 3,
    pixels: [
      [true, true, true],
      [true, false, true],
      [true, true, true],
    ],
  });

  for (const corner of ['300 400', '300 500', '400 400', '400 500']) {
    assert.match(path, new RegExp(`[ML] ${corner}(?: |$)`));
    assert.ok(!path.includes(`Q ${corner} `));
  }
  assert.match(path, /Q 200 300 /);
});

it('keeps the top-left inner corner sharp', () => {
  const path = figureToSvgPath({
    x: 0,
    y: 0,
    pixels: [
      [true, true],
      [true, false],
    ],
  });

  assert.ok(!path.includes('Q 100 100 '));
});

it('matches the legacy empty-tile selector for every neighborhood', () => {
  const neighbors = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ];

  for (let mask = 0; mask < 256; mask++) {
    const pixels = Array.from({ length: 3 }, () => Array<boolean>(3).fill(false));
    neighbors.forEach(([x, y], i) => {
      pixels[y][x] = !!(mask & (1 << i));
    });
    const path = figureToSvgPath({ x: 2, y: 3, pixels });
    const l = pixels[1][0],
      r = pixels[1][2],
      t = pixels[0][1],
      b = pixels[2][1];

    // Original assignments, including their reset on a failed condition.
    let selector = l && t && pixels[0][0] ? 'n_lt' : '';
    selector = !selector && l && b && pixels[2][0] ? 'n_lb' : '';
    selector = !selector && r && t && pixels[0][2] ? 'n_rt' : '';
    selector = !selector && r && b && pixels[2][2] ? 'n_rb' : '';

    for (const [dx, dy] of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]) {
      if (!pixels[1][1 + dx] || !pixels[1 + dy][1] || !pixels[1 + dy][1 + dx]) continue;
      const x = (3 + (dx > 0 ? 1 : 0)) * 100;
      const y = (4 + (dy > 0 ? 1 : 0)) * 100;
      assert.equal(
        path.includes(`Q ${x} ${y} `),
        selector === 'n_rb' && dx === 1 && dy === 1,
        `mask=${mask}, corner=${dx},${dy}`,
      );
    }
  }
});
