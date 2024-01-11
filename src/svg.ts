import { QrCode } from './qr';
import { QrOptions } from './types';

const MULTI = 1;
const QR_BORDER = 7;
const TILE_SIZE = 96 * MULTI;
export const INC_TILE_SIZE = 96 * MULTI;
const SMALL_QR_SIZE = 25;

/**
 * Returns the color of the module (pixel) at the given coordinates, which is false
 * for white or true for black. The top left corner has the coordinates (x=0, y=0).
 * If the given coordinates are out of bounds, then false (white) is returned.
 */
const getPixel = (x: number, y: number, size: number, modules: boolean[][], isLogoShowed: boolean) => {
  if (x < QR_BORDER && y < QR_BORDER) {
    return false;
  }

  if (x >= size - QR_BORDER && y < QR_BORDER) {
    return false;
  }

  if (x < QR_BORDER && y >= size - QR_BORDER) {
    return false;
  }

  if (isLogoShowed) {
    let imageTiles = QR_BORDER + 2;
    if (size <= SMALL_QR_SIZE) {
      imageTiles--;
    }

    let paddingTiles = (size - QR_BORDER * 2 - imageTiles) / 2 - 1;
    if (size <= SMALL_QR_SIZE) {
      paddingTiles++;
    }

    if (
      x > QR_BORDER + paddingTiles &&
      x < size - QR_BORDER - paddingTiles - 1 &&
      y > QR_BORDER + paddingTiles &&
      y < size - QR_BORDER - paddingTiles - 1
    ) {
      return false;
    }

    return 0 <= x && x < size && 0 <= y && y < size && modules[y][x];
  }

  return modules[y] && modules[y][x];
};

const getNeighbors = (x: number, y: number, size: number, modules: boolean[][], isLogoShowed = true) => ({
  l: getPixel(x - 1, y, size, modules, isLogoShowed),
  r: getPixel(x + 1, y, size, modules, isLogoShowed),
  t: getPixel(x, y - 1, size, modules, isLogoShowed),
  b: getPixel(x, y + 1, size, modules, isLogoShowed),
  current: getPixel(x, y, size, modules, isLogoShowed)
});

/**
 * Converts QrCode instance to SVG code
 * @param qrCode QrCode instance
 * @param options Convertation options
 */
export const convertSegmentsToSvgString = (qrCode: QrCode, options: Required<QrOptions>): string => {
  if (typeof options.qrSize !== 'number') {
    throw new Error('Size should be a number');
  }

  if (typeof options.className !== 'string') {
    throw new Error('Classname should be a string');
  }

  const _2 = 2 * MULTI;
  const _12_7 = 12.7 * MULTI;
  const _12_8 = 12.8 * MULTI;
  const _14_7 = 14.7 * MULTI;
  const _14_8 = 14.8 * MULTI;
  const _15_9 = 15.9 * MULTI;
  const _28_6 = 28.6 * MULTI;
  const _30_5 = 30.5 * MULTI;
  const _84_7 = 84.7776815 * MULTI;
  const _87_3 = 87.3 * MULTI;
  const _71_4 = 71.4 * MULTI;
  const _42_9 = 42.9 * MULTI;
  const _87_2 = 87.2 * MULTI;
  const _85_2 = 85.2 * MULTI;
  const _85_3 = 85.3 * MULTI;
  const _69_5 = 69.5 * MULTI;
  const _98 = 98 * MULTI;
  const _100 = 100 * MULTI;

  const parts = [];
  let leftPadding = 0;
  let topPadding = 0;
  let xCoord = 0;
  let yCoord = 0;

  for (let y = 0; y < qrCode.size; y++) {
    leftPadding = 0;
    for (let x = 0; x < qrCode.size; x++) {
      xCoord = x + leftPadding;
      leftPadding += TILE_SIZE;
      yCoord = y + topPadding;

      const neighbors = getNeighbors(x, y, qrCode.size, qrCode.modules, options.isShowLogo);

      let path = '';
      let selector = '';

      if (neighbors.current) {
        selector = !selector && !neighbors.l && !neighbors.r && !neighbors.t && !neighbors.b ? 'empty' : '';
        selector = (!selector && neighbors.l && neighbors.r) || (neighbors.t && neighbors.b) ? 'rect' : '';
        if (!selector) {
          selector += neighbors.l ? 'l' : neighbors.r ? 'r' : '';
          selector += neighbors.t ? 't' : neighbors.b ? 'b' : '';
          if (!selector) {
            selector = 'empty';
          }
        }
      } else {
        selector =
          !selector &&
          neighbors.l &&
          neighbors.t &&
          getPixel(x - 1, y - 1, qrCode.size, qrCode.modules, options.isShowLogo)
            ? 'n_lt'
            : '';
        selector =
          !selector &&
          neighbors.l &&
          neighbors.b &&
          getPixel(x - 1, y + 1, qrCode.size, qrCode.modules, options.isShowLogo)
            ? 'n_lb'
            : '';
        selector =
          !selector &&
          neighbors.r &&
          neighbors.t &&
          getPixel(x + 1, y - 1, qrCode.size, qrCode.modules, options.isShowLogo)
            ? 'n_rt'
            : '';
        selector =
          !selector &&
          neighbors.r &&
          neighbors.b &&
          getPixel(x + 1, y + 1, qrCode.size, qrCode.modules, options.isShowLogo)
            ? 'n_rb'
            : '';
      }

      if (!selector) {
        continue;
      }
      path = `<use xlink:href="#${selector}-${options.suffix}"/>`;
      parts.push(`<g transform="translate(${xCoord},${yCoord})">${path}</g>`);
    }
    topPadding += TILE_SIZE;
  }

  let scale = '';
  let position = ((qrCode.size - QR_BORDER * 3) / 2) * TILE_SIZE + TILE_SIZE * QR_BORDER - 10;
  if (qrCode.size <= SMALL_QR_SIZE) {
    scale = 'scale(0.85)';
    position += 50;
  }

  const pointPosition = (qrCode.size - QR_BORDER) * options.incTileSize;
  parts.push(`<use fill-rule="evenodd" transform="translate(0,0)" xlink:href="#point-${options.suffix}"/>`);
  parts.push(
    `<use fill-rule="evenodd" transform="translate(${pointPosition},0)" xlink:href="#point-${options.suffix}"/>`
  );
  parts.push(
    `<use fill-rule="evenodd" transform="translate(0,${pointPosition})" xlink:href="#point-${options.suffix}"/>`
  );

  if (options.isShowLogo) {
    if (!options.logoData) {
      parts.push(`
        <use style="width: 750px; height: 750px;" width="750" height="750"
          fill="none"
          fill-rule="evenodd"
          transform="translate(${position},${position}) ${scale}" xlink:href="#vk_logo-${options.suffix}"
        />
      `);
    } else {
      parts.push(`
        <image
          preserveAspectRatio="xMidYMid slice" clip-path="url(#logo-mask-${options.suffix})"
          style="width: 750px; height: 750px;" width="750" height="750"
          transform="translate(${position},${position}) ${scale}"
          xlink:href="${options.logoData}"
        />
      `);
    }
  }

  const backgroundSize = 99 * qrCode.size;
  let qrBackground = '';
  let qrTransform = 'translate(0,0)';

  if (options.isShowBackground) {
    const qrScale = (options.qrSize - 20 * 2) / options.qrSize; // 0.756972112
    const padding = (backgroundSize / options.qrSize) * 21;
    const radius = Math.ceil(backgroundSize / (options.qrSize / 36)); // 7.11111111 = 256px/36px radius

    qrBackground = `
      <rect
        x="0"
        width="${backgroundSize}"
        height="${backgroundSize}"
        rx="${radius}"
        fill="${options.backgroundColor}"
      />`;
    qrTransform = `translate(${padding}, ${padding}) scale(${qrScale})`;
  }

  // eslint-disable-next-line
  const oneSide = `M0,0 L66,0 C${_84_7},-3.44940413e-15 ${_100},15.2223185 ${_100},34 L${_100},66 C${_100},${_84_7} \
${_84_7},${_100} 66,${_100} L0,${_100} L0,0 Z`;
  const twoSides = `M0,0 L${_100},0 L${_100},66 C${_100},${_84_7} ${_84_7},${_100} 66,${_100} L0,${_100} L0,0 Z`;

  return `
  <svg
    version="1.1"
    viewBox="0 0 ${backgroundSize} ${backgroundSize}"
    width="${options.qrSize}px"
    height="${options.qrSize}px"
    ${options.className ? `class="${options.className}"` : ''}
    xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <rect id="rect-${options.suffix}" width="100" height="100" fill="${options.foregroundColor}"/>
      <path
        id="empty-${options.suffix}"
        d="M0,${_28_6}v${_42_9}C0,${_87_3},${_12_8},${_100},${_28_6},${_100}h${_42_9}c${_15_9},0,${_28_6}-${_12_8},\
${_28_6}-${_28_6}V${_28_6}C${_100},${_12_7},${_87_2},0,${_71_4},0H${_28_6} C${_12_8},0,0,${_12_8},0,${_28_6}z"
        fill="${options.foregroundColor}"
      />
      <path id="b-${options.suffix}" d="${oneSide}" transform="rotate(-90 50 50)" fill="${options.foregroundColor}"/>
      <path id="r-${options.suffix}" d="${oneSide}" transform="rotate(-180 50 50)" fill="${options.foregroundColor}"/>
      <path id="l-${options.suffix}" d="${oneSide}" fill="${options.foregroundColor}"/>
      <path id="t-${options.suffix}" d="${oneSide}" transform="rotate(90 50 50)" fill="${options.foregroundColor}"/>
      <path id="l-${options.suffix}" d="${twoSides}" transform="rotate(-90 50 50)" fill="${options.foregroundColor}"/>
      <path id="lt-${options.suffix}" d="${twoSides}" fill="${options.foregroundColor}"/>
      <path id="lb-${options.suffix}" d="${twoSides}" transform="rotate(-90 50 50)" fill="${options.foregroundColor}"/>
      <path id="rb-${options.suffix}" d="${twoSides}" transform="rotate(-180 50 50)" fill="${options.foregroundColor}"/>
      <path id="rt-${options.suffix}" d="${twoSides}" transform="rotate(90 50 50)" fill="${options.foregroundColor}"/>
      <path
        id="n_lt-${options.suffix}"
        d="M${_30_5},${_2}V0H0v${_30_5}h${_2}C${_2},${_14_7},${_14_8},${_2},${_30_5},${_2}z"
        fill="${options.foregroundColor}"
      />
      <path
        id="n_lb-${options.suffix}"
        d="M${_2},${_69_5}H0V${_100}h${_30_5}v-${_2}C${_14_7},${_98},${_2},${_85_2},${_2},${_69_5}z"
        fill="${options.foregroundColor}"
      />
      <path
        id="n_rt-${options.suffix}"
        d="M${_98},${_30_5}h${_2}V0H${_69_5}v${_2}C${_85_3},${_2},${_98},${_14_8},${_98},${_30_5}z"
        fill="${options.foregroundColor}"
      />
      <path id="n_rb-${options.suffix}"
        d="M${_69_5},${_98}v${_2}H${_100}V${_69_5}h-${_2}C${_98},${_85_3},${_85_2},${_98},${_69_5},${_98}z"
        fill="${options.foregroundColor}"
      />
      <path
        id="point-${options.suffix}"
        fill="${options.foregroundColor}"
        d="M600.001786,457.329333 L600.001786,242.658167 C600.001786,147.372368 587.039517,124.122784 \
581.464617,118.535383 C575.877216,112.960483 552.627632,99.9982143 457.329333,99.9982143 \
L242.670667,99.9982143 C147.372368,99.9982143 124.122784,112.960483 118.547883,118.535383 \
C112.972983,124.122784 99.9982143,147.372368 99.9982143,242.658167 L99.9982143,457.329333 \
C99.9982143,552.627632 112.972983,575.877216 118.547883,581.464617 C124.122784,587.027017 \
147.372368,600.001786 242.670667,600.001786 L457.329333,600.001786 C552.627632,600.001786 \
575.877216,587.027017 581.464617,581.464617 C587.039517,575.877216 600.001786,552.627632 \
600.001786,457.329333 Z M457.329333,0 C653.338333,0 700,46.6616668 700,242.658167 C700,438.667167 \
700,261.332833 700,457.329333 C700,653.338333 653.338333,700 457.329333,700 C261.332833,700 438.667167,700 \
242.670667,700 C46.6616668,700 0,653.338333 0,457.329333 C0,261.332833 0,352.118712 0,242.658167 \
C0,46.6616668 46.6616668,0 242.670667,0 C438.667167,0 261.332833,0 457.329333,0 Z M395.996667,200 \
C480.004166,200 500,220.008332 500,303.990835 C500,387.998334 500,312.001666 500,395.996667 \
C500,479.991668 480.004166,500 395.996667,500 C312.001666,500 387.998334,500 304.003333,500 C220.008332,500 \
200,479.991668 200,395.996667 C200,312.001666 200,350.906061 200,303.990835 C200,220.008332 220.008332,200 \
304.003333,200 C387.998334,200 312.001666,200 395.996667,200 Z"
      />
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
    </defs>

    ${qrBackground}

    <g transform="${qrTransform}">
      ${parts.join('\n')}
    </g>
  </svg>`;
};
