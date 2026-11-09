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

it('keeps custom background padding and radius in output pixels at different QR sizes', () => {
  const contentSizeMatch = createQR('layout').match(/viewBox="0 0 ([\d.]+)/);
  assert.ok(contentSizeMatch);
  const contentSize = Number(contentSizeMatch[1]);

  for (const qrSize of [64, 128, 256, 500]) {
    for (const [backgroundPadding, backgroundRadius] of [
      [0, 0],
      [0, 12],
      [8, 0],
      [8, 12],
      [24, 500],
    ]) {
      const svg = createQR('layout', {
        qrSize,
        isShowBackground: true,
        backgroundPadding,
        backgroundRadius,
      });
      const viewBox = svg.match(/viewBox="([^"]+)"/);
      const background = svg.match(
        /<rect\s+x="([^"]+)"\s+y="([^"]+)"\s+width="([^"]+)"\s+height="([^"]+)"\s+rx="([^"]+)"/,
      );
      assert.ok(viewBox);
      assert.ok(background);
      const [x, y, width, height] = viewBox[1].split(' ').map(Number);
      const scale = qrSize / width;
      const margins = [-x, -y, x + width - contentSize, y + height - contentSize];
      for (const margin of margins) {
        assert.ok(Math.abs(margin * scale - backgroundPadding) < 1e-9);
      }
      assert.deepEqual(background.slice(1, 5).map(Number), [x, y, width, height]);
      const radius = Number(background[5]) * scale;
      assert.ok(Math.abs(radius - Math.min(backgroundRadius, qrSize / 2)) < 1e-9);
      assert.doesNotMatch(svg, /<g display="none">|NaN|Infinity/);
    }
  }
});

it('uses defaults for omitted, negative and non-finite background dimensions', () => {
  for (const value of [undefined, -1, NaN, Infinity, -Infinity]) {
    assert.equal(
      createQR('layout', {
        isShowBackground: true,
        backgroundPadding: value,
        backgroundRadius: 12,
      }),
      createQR('layout', { isShowBackground: true, backgroundRadius: 12 }),
    );
    assert.equal(
      createQR('layout', {
        isShowBackground: true,
        backgroundPadding: 8,
        backgroundRadius: value,
      }),
      createQR('layout', { isShowBackground: true, backgroundPadding: 8 }),
    );
  }
});

it('hides QR when custom padding fills or exceeds the image', () => {
  for (const backgroundPadding of [64, 100, 500]) {
    const svg = createQR('layout', { isShowBackground: true, backgroundPadding });
    assert.match(svg, /<g display="none">/);
    assert.match(svg, /viewBox="0 0 \d+ \d+"/);
    assert.doesNotMatch(svg, /NaN|Infinity/);
  }
});

it('ignores background dimensions when the background is hidden', () => {
  assert.equal(
    createQR('layout', { backgroundPadding: 500, backgroundRadius: 0 }),
    createQR('layout'),
  );
});

it('supports custom background dimensions through the legacy interface', () => {
  const options = { isShowBackground: true, backgroundPadding: 8, backgroundRadius: 12 };
  assert.equal(
    createQR('layout', 256, 'qr', options),
    createQR('layout', { ...options, qrSize: 256, className: 'qr' }),
  );
});
