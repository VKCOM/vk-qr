import qr from '../dist/es';
const text = 'TEST';

const qrSvg = qr.createQR(text, 256, 256, 'qr-code-class');

document.body.innerHTML = qrSvg;