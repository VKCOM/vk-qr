import { QrOptions } from './types';
/**
 * Generates SVG QR code by a text
 * @param text String to encode
 * @param options QR code options
 */
declare function createQR(text: string, options?: QrOptions): string;
/**
 * Legacy interface
 * @deprecated
 * @param text String to encode
 * @param qrSize Size of QR code
 * @param className SVG element class name
 * @param options Options of the QR code
 */
declare function createQR(text: string, qrSize: number, className: string, options?: QrOptions): string;
declare const _default: {
    createQR: typeof createQR;
};
export default _default;
