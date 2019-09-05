import { convertSegmentsToSvgString } from './svg';
import { QrSegment, QrCode } from './qr';
import { QrOptions } from './types';
import Ecc = QrCode.Ecc;

/** Default width and height of QR code */
const DEFAULT_SIZE = 128;

/** Default background color of QR code*/
const BACKGROUND_COLOR_DEFAULT = '#ffffff';

/** Default foreground color */
const FOREGROUND_COLOR_DEFAULT = '#000000';

/** Default logo color */
const LOGO_COLOR_DEFAULT = '#4680c2';

/**
 * Generates SVG QR code by a text
 * @param text String to encode
 * @param options QR code options
 */
function createQR(text: string, options?: QrOptions): string;

/**
 * Legacy interface
 * @deprecated
 * @param text String to encode
 * @param qrSize Size of QR code
 * @param className SVG element class name
 * @param options Options of the QR code
 */
function createQR(text: string, qrSize: number, className: string, options?: QrOptions): string;

/**
 * Implementation
 */
function createQR(
  text: string,
  qrSizeOrOptions?: number | QrOptions,
  classNameLegacy?: string,
  legacyOptions?: QrOptions
): string {
  if (typeof text !== 'string') {
    throw new TypeError('Enter text for encoding');
  }

  // Legacy interface resolve
  const options: QrOptions = {
    ...(typeof qrSizeOrOptions === 'object' && qrSizeOrOptions !== null ? qrSizeOrOptions : {}),
    ...(typeof legacyOptions === 'object' && legacyOptions !== null ? legacyOptions : {}),
    qrSize:
      typeof qrSizeOrOptions === 'object' && qrSizeOrOptions !== null && typeof qrSizeOrOptions.qrSize === 'number'
        ? qrSizeOrOptions.qrSize
        : (qrSizeOrOptions as number),
    className:
      typeof qrSizeOrOptions === 'object' && qrSizeOrOptions !== null && typeof qrSizeOrOptions.className === 'string'
        ? qrSizeOrOptions.className
        : classNameLegacy
  };

  // ECC levels mapping
  const eccLevels = [
    QrCode.Ecc.LOW,
    QrCode.Ecc.MEDIUM,
    QrCode.Ecc.QUARTILE,
    QrCode.Ecc.HIGH
  ];

  // Fallback undefined options
  const fallbackOptions: Required<QrOptions> = {
    qrSize: typeof options.qrSize === 'number' ? options.qrSize : DEFAULT_SIZE,
    className: typeof options.className === 'string' ? options.className : classNameLegacy || '',
    isShowLogo: !!options.isShowLogo || false,
    isShowBackground: !!options.isShowBackground || false,
    foregroundColor: typeof options.foregroundColor === 'string' ? options.foregroundColor : FOREGROUND_COLOR_DEFAULT,
    backgroundColor: typeof options.backgroundColor === 'string' ? options.backgroundColor : BACKGROUND_COLOR_DEFAULT,
    logoColor: typeof options.logoColor === 'string' ? options.logoColor : LOGO_COLOR_DEFAULT,
    suffix: options.suffix ? options.suffix.toString() : '0',
    logoData: typeof options.logoData === 'string' ? options.logoData : null,
    ecc: (typeof options.ecc === 'number' && eccLevels[options.ecc] ? options.ecc : 3),
  };

  // Code generation
  const segments: QrSegment[] = QrSegment.makeSegments(text);
  const qrCode: QrCode = QrCode.encodeSegments(segments, eccLevels[fallbackOptions.ecc], 1, 40, -1, true);
  const svgCode = convertSegmentsToSvgString(qrCode, fallbackOptions);

  return svgCode;
}

export default {
  createQR
};
