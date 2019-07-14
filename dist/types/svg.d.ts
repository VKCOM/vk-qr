import { QrCode } from './qr';
import { QrOptions } from './types';
/**
 * Converts QrCode instance to SVG code
 * @param qrCode QrCode instance
 * @param options Convertation options
 */
export declare const convertSegmentsToSvgString: (qrCode: QrCode, options: Required<QrOptions>) => string;
