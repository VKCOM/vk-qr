import qr from '../dist/es';
const text = "TEST";

var segs = qr.QrSegment.makeSegments(text);
var qrSvg = qr.QrCode.encodeSegments(segs, qr.QrCode.Ecc.QUARTILE, 1, 40, -1, true).toSvgString();

console.log(qrSvg);