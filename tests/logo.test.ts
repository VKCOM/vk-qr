import assert from 'node:assert/strict';
import { it } from 'node:test';
import { figureToSvgPath } from '../src/svg-path.ts';
import { QrCode, QrCodeEcc } from '../src/qr.ts';
import { convertSegmentsToSvgString } from '../src/svg.ts';
import type { RequiredQrOptions } from '../src/types.ts';

it('clears the logo quiet zone before tracing modules without changing the QR matrix', () => {
  for (const version of [1, 2, 3, 10]) {
    const qrCode = QrCode.encodeSegments([], QrCodeEcc.HIGH, version, version);
    const areaSize = version <= 2 ? 7 : 9;
    const start = (qrCode.size - areaSize) / 2;
    const end = start + areaSize;
    // A solid logo area connected to one module just outside it.
    qrCode.modules.forEach((row, y) => {
      row.forEach((_, x) => {
        row[x] = x >= start && x < end && y >= start && y < end;
      });
    });
    qrCode.modules[start][start - 1] = true;
    const original = qrCode.modules.map((row) => [...row]);

    for (const logoData of [null, 'data:image/svg+xml,%3Csvg/%3E']) {
      const options: RequiredQrOptions = {
        qrSize: 128,
        className: '',
        isShowLogo: true,
        isShowBackground: false,
        backgroundColor: '#ffffff',
        foregroundColor: '#000000',
        logoColor: '#07f',
        suffix: '0',
        logoData,
        ecc: 3,
        incTileSize: 100,
      };
      const svg = convertSegmentsToSvgString(qrCode, options);
      const paths = [...svg.split('</defs>')[1].matchAll(/<path\s+d="([^"]+)"/g)];
      assert.deepEqual(
        paths.map((match) => match[1]),
        [figureToSvgPath({ x: start - 1, y: start, pixels: [[true]] })],
        `version=${version}, customLogo=${logoData !== null}`,
      );
      assert.deepEqual(qrCode.modules, original);
      const withoutLogo = convertSegmentsToSvgString(qrCode, { ...options, isShowLogo: false });
      assert.notEqual(svg.split('</defs>')[1], withoutLogo.split('</defs>')[1]);
    }
  }
});
