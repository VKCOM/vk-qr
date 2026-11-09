import type { QrCode } from './qr.ts';
import type { RequiredQrOptions } from './types.ts';
import { extractFigures, isFinderPattern } from './figures.ts';
import { figureToSvgPath } from './svg-path.ts';
import {
  FINDER_PATTERN_SIZE,
  TILE_SIZE,
  SMALL_QR_SIZE,
  FINDER_CORNER_RADIUS,
  BACKGROUND_PADDING,
  BACKGROUND_RADIUS,
} from './constants.ts';

export const INC_TILE_SIZE = TILE_SIZE;

interface BackgroundLayout {
  size: number;
  padding: number;
  radius: number;
  hideQr: boolean;
}

/** Converts a QR module matrix to SVG. */
export function convertSegmentsToSvgString(qrCode: QrCode, options: RequiredQrOptions): string {
  if (typeof options.qrSize !== 'number') {
    throw new Error('Size should be a number');
  }

  if (typeof options.className !== 'string') {
    throw new Error('Classname should be a string');
  }

  const background = getBackgroundLayout(qrCode.size, options);
  const parts = renderFinderPatterns(qrCode.size, options);
  if (options.isShowLogo) parts.push(renderLogo(qrCode.size, options));

  return `
  <svg
    version="1.1"
    viewBox="${-background.padding} ${-background.padding} ${background.size} ${background.size}"
    width="${options.qrSize}px"
    height="${options.qrSize}px"
    style="display: block"
    ${options.className ? `class="${options.className}"` : ''}
    xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    ${renderDefinitions(options)}

    ${renderBackground(background, options)}

    <g${background.hideQr ? ' display="none"' : ''}>
    ${renderModules(qrCode, options)}
      ${parts.join('\n')}
    </g>

  </svg>`;
}

function getVisibleModules(qrCode: QrCode, isShowLogo: boolean): boolean[][] {
  if (!isShowLogo) return qrCode.modules;

  // Clear the logo area before tracing contours so transparent logos retain
  // their quiet zone and neighboring modules do not connect through it.
  const logoAreaSize = qrCode.size <= SMALL_QR_SIZE ? FINDER_PATTERN_SIZE : FINDER_PATTERN_SIZE + 2;
  const logoAreaStart = (qrCode.size - logoAreaSize) / 2;
  return qrCode.modules.map((row, y) =>
    row.map(
      (pixel, x) =>
        pixel &&
        !(
          x >= logoAreaStart &&
          x < logoAreaStart + logoAreaSize &&
          y >= logoAreaStart &&
          y < logoAreaStart + logoAreaSize
        ),
    ),
  );
}

function renderModules(qrCode: QrCode, options: RequiredQrOptions): string {
  return extractFigures(getVisibleModules(qrCode, options.isShowLogo))
    .filter((figure) => !isFinderPattern(figure, qrCode.size))
    .map(
      (figure) => `
      <path
        d="${figureToSvgPath(figure)}"
        fill="${options.foregroundColor}"
        fill-rule="evenodd"
      />`,
    )
    .join('');
}

function renderFinderPatterns(size: number, options: RequiredQrOptions): string[] {
  const pointPosition = (size - FINDER_PATTERN_SIZE) * TILE_SIZE;
  return [
    `<use fill-rule="evenodd" transform="translate(0,0)" xlink:href="#point-${options.suffix}"/>`,
    `<use fill-rule="evenodd" transform="translate(${pointPosition},0)" xlink:href="#point-${options.suffix}"/>`,
    `<use fill-rule="evenodd" transform="translate(0,${pointPosition})" xlink:href="#point-${options.suffix}"/>`,
  ];
}

function renderLogo(size: number, options: RequiredQrOptions): string {
  let scale = '';
  let position =
    ((size - FINDER_PATTERN_SIZE * 3) / 2) * TILE_SIZE + TILE_SIZE * FINDER_PATTERN_SIZE - 10;
  if (size <= SMALL_QR_SIZE) {
    scale = 'scale(0.85)';
    position += 50;
  }

  if (!options.logoData) {
    return `
        <use style="width: 750px; height: 750px;" width="750" height="750"
          fill="none"
          fill-rule="evenodd"
          transform="translate(${position},${position}) ${scale}" xlink:href="#vk_logo-${options.suffix}"
        />
      `;
  }

  return `
        <image
          preserveAspectRatio="xMidYMid slice" clip-path="url(#logo-mask-${options.suffix})"
          style="width: 750px; height: 750px;" width="750" height="750"
          transform="translate(${position},${position}) ${scale}"
          xlink:href="${options.logoData}"
        />
      `;
}

function getBackgroundLayout(size: number, options: RequiredQrOptions): BackgroundLayout {
  const contentSize = TILE_SIZE * size;
  if (!options.isShowBackground) {
    return { size: contentSize, padding: 0, radius: 0, hideQr: false };
  }

  const frameWidth = Math.min(BACKGROUND_PADDING, options.qrSize / 2);
  const contentWidth = options.qrSize - frameWidth * 2;
  const hideQr = contentWidth <= 0;
  const backgroundSize = hideQr ? contentSize : (contentSize * options.qrSize) / contentWidth;
  const padding = (backgroundSize - contentSize) / 2;
  const radius =
    (Math.min(BACKGROUND_RADIUS, options.qrSize / 2) / options.qrSize) * backgroundSize;

  return { size: backgroundSize, padding, radius, hideQr };
}

function renderBackground(layout: BackgroundLayout, options: RequiredQrOptions): string {
  if (!options.isShowBackground) return '';

  const { size, padding, radius } = layout;
  return `
      <rect
        x="${-padding}"
        y="${-padding}"
        width="${size}"
        height="${size}"
        rx="${radius}"
        fill="${options.backgroundColor}"
      />`;
}

function renderDefinitions(options: RequiredQrOptions): string {
  return `<defs>
      <g
        id="point-${options.suffix}"
        fill="${options.foregroundColor}"
      >
        <rect width="300" height="300" x="200" y="200" rx="${FINDER_CORNER_RADIUS}" />
        <rect width="600" height="600" x="50" y="50" rx="${FINDER_CORNER_RADIUS * 2}" stroke-width="100" fill="none" stroke="${options.foregroundColor}" />
      </g>
      <g id="vk_logo-${options.suffix}">
        <path
          fill="${options.logoColor}"
          d="M83.3334 363.333C83.3334 231.34 83.3334 165.343 124.338 124.338C165.343 83.3333 231.34 \
             83.3333 363.333 83.3333H386.667C518.66 83.3333 584.657 83.3333 625.662 124.338C666.667 165.343 \
             666.667 231.34 666.667 363.333V386.667C666.667 518.66 666.667 584.657 625.662 625.662C584.657 \
             666.667 518.66 666.667 386.667 666.667H363.333C231.34 666.667 165.343 666.667 124.338 625.662C83.3334 \
             584.657 83.3334 518.66 83.3334 386.667V363.333Z"
        />
        <path
          fill="#FFF"
          d="M394.907 508.681C263.293 508.681 183.442 417.365 180.313 265.625H246.972C249.05 377.09 \
             299.763 424.323 338.638 434.036V265.625H402.519V361.82C440.016 357.664 479.264 313.909 \
             492.456 265.625H555.333C545.27 325 502.543 368.754 472.353 386.803C502.566 401.395 551.177 \
             439.593 569.926 508.681H500.815C486.222 462.498 450.476 426.728 402.542 421.872V508.681H394.907Z"
        />
      </g>
      <clipPath id="logo-mask-${options.suffix}">
        <rect x="0" y="0" width="750" height="750" />
      </clipPath>
    </defs>`;
}
