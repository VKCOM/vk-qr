import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createQR } from '../src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const snapshotsDir = join(__dirname, '__svg_snapshots__');

function getSnapshotPath(testName: string): string {
  return join(snapshotsDir, `${testName}.snap.svg`);
}

function ensureSnapshotsDir(): void {
  if (!existsSync(snapshotsDir)) {
    mkdirSync(snapshotsDir, { recursive: true });
  }
}

function normalizeSvg(svg: string): string {
  return svg.replace(/\s+/g, ' ').trim();
}

function assertSvgSnapshot(svg: string, testName: string): void {
  ensureSnapshotsDir();
  const snapshotPath = getSnapshotPath(testName);

  if (existsSync(snapshotPath)) {
    const expectedSvg = readFileSync(snapshotPath, 'utf-8');
    assert.strictEqual(
      normalizeSvg(svg),
      normalizeSvg(expectedSvg),
      `SVG does not match snapshot for "${testName}". Run with UPDATE_SNAPSHOTS=1 to update.`,
    );
  } else {
    writeFileSync(snapshotPath, svg, 'utf-8');
    console.log(`Created new snapshot: ${snapshotPath}`);
  }
}

describe('QR Code generation', () => {
  const shouldUpdate = process.env.UPDATE_SNAPSHOTS === '1';

  it('Simple text encoding without options', () => {
    const svg = createQR('Lorem ipsum dolor sit amet');
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('simple-text-encoding'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'simple-text-encoding');
    }
  });

  it('Another text encoding without options', () => {
    const svg = createQR('Пеп кек');
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('another-text-encoding'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'another-text-encoding');
    }
  });

  it('Generation with custom size', () => {
    const svg = createQR('Lorem ipsum dolor sit amet', { qrSize: 500 });
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('custom-size'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'custom-size');
    }
  });

  it('Generation QR with class name in root element', () => {
    const svg = createQR('Lorem ipsum dolor sit amet', { className: 'pep kek' });
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('with-class-name'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'with-class-name');
    }
  });

  it('Generation QR with showed logo', () => {
    const svg = createQR('Lorem ipsum dolor sit amet', { isShowLogo: true });
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('with-logo'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'with-logo');
    }
  });

  it('Generation QR with custom logo color', () => {
    const svg = createQR('Lorem ipsum dolor sit amet', { isShowLogo: true, logoColor: '#00ff00' });
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('custom-logo-color'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'custom-logo-color');
    }
  });

  it('Generation QR with showed background', () => {
    const svg = createQR('Lorem ipsum dolor sit amet', { isShowBackground: true });
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('with-background'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'with-background');
    }
  });

  it('Generation QR with custom background color', () => {
    const svg = createQR('Lorem ipsum dolor sit amet', {
      isShowBackground: true,
      backgroundColor: '#ff0000',
    });
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('custom-background-color'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'custom-background-color');
    }
  });

  it('Generation QR with custom foreground color', () => {
    const svg = createQR('Lorem ipsum dolor sit amet', { foregroundColor: '#0000ff' });
    if (shouldUpdate) {
      ensureSnapshotsDir();
      writeFileSync(getSnapshotPath('custom-foreground-color'), svg, 'utf-8');
    } else {
      assertSvgSnapshot(svg, 'custom-foreground-color');
    }
  });
});
