import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createQR } from '../src/index.ts';

it('renders SVG as a block to avoid the inline baseline gap', () => {
  assert.match(createQR('layout'), /<svg\b[^>]*style="display: block"/);
});

it('centers QR within the fixed background frame at different sizes', () => {
  for (const qrSize of [64, 128, 256, 500]) {
    const svg = createQR('layout', { qrSize, isShowBackground: true });
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
    assert.ok(viewBoxMatch);
    const [x, y, extent] = viewBoxMatch[1].split(' ').map(Number);
    const contentSizeMatch = createQR('layout').match(/viewBox="0 0 ([\d.]+)/);
    assert.ok(contentSizeMatch);
    const contentSize = Number(contentSizeMatch[1]);
    const left = (-x / extent) * qrSize;
    const right = ((x + extent - contentSize) / extent) * qrSize;
    assert.ok(Math.abs(left - 20) < 1e-9);
    assert.ok(Math.abs(left - right) < 1e-9);
    assert.equal(x, y);
    assert.ok(!svg.includes('scale('));
    const background = svg.match(/<rect\s+x="([^"]+)"\s+y="([^"]+)"[^>]*rx="([\d.]+)"/);
    assert.ok(background);
    assert.equal(Number(background[1]), x);
    assert.equal(Number(background[2]), y);
    const radius = Number(background[3]);
    assert.ok(Math.abs((radius / extent) * qrSize - Math.min(36, qrSize / 2)) < 1e-9);
  }
});

it('hides QR when the fixed frame fills the image without invalid viewBox values', () => {
  for (const qrSize of [16, 32, 40]) {
    const svg = createQR('layout', { qrSize, isShowBackground: true });
    assert.match(svg, /<g display="none">/);
    assert.ok(!/NaN|Infinity|scale\(/.test(svg));
    assert.match(svg, /viewBox="0 0 \d+ \d+"/);
  }
});
