<div align="center">

[<img width="150" height="150" src="https://pp.userapi.com/c851220/v851220335/125ec2/RB-gm_NGv9c.jpg">](https://github.com/VKCOM/vk-qr)

[![npm][npm-shield]][npm-url] [![NPM][npm-downloads-shield]][npm-url] [![Build Status](https://travis-ci.org/VKCOM/vk-qr.svg?branch=master)](https://travis-ci.org/VKCOM/vk-qr)

</div>

# VK-QR

JavaScript library for generating SVG code of VK-style QR codes.

## Usage

Install via yarn

```
yarn add @vkontakte/vk-qr
```

or npm

```
npm install @vkontakte/vk-qr
```

And use in your code

```js
import vkQr from '@vkontakte/vk-qr';

// Returns SVG code of generated 256x256 QR code with VK logo
const qrSvg = vkQr.createQR('Text to encode', {
  qrSize: 256,
  isShowLogo: true
});
```

## API Reference

### Syntax

```js
generatedSvgCode = vkQr.createQR(text[, qrOptions]);
```

### Parameters

- `text` _required_
  String to generate a QR code

- `options` _optional_
  An options object containing any custom settings that you want to apply to the generated QR code. The possible options are:

  - `qrSize`: Size of QR code.
    Default is 128

  - `className`: Class name of root SVG element

  - `isShowLogo`: Show VK logo in center of QR code
    Default is false

  - `isShowBackground`: Show QR background. Default is false

  - `backgroundColor`: QR code background HEX color. Works if `isShowBackground` is enabled. Default is "#ffffff"

  - `foregroundColor`: QR code HEX color

  - `logoColor`: Color of logo. Default is "#4680c2"

  - `logoData`: Reference to logo as a reference IRI

  - `suffix`: SVG elements id postfix
  
  - `ecc`: ECC level in range [0-3] (0 - low, 3 - high)

### Return value

A string with SVG code.

## License

The code is available under the [MIT](LICENSE) license.

[npm-shield]: https://img.shields.io/npm/v/@vkontakte/vk-qr.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vk-qr
[npm-downloads-shield]: https://img.shields.io/npm/dt/@vkontakte/vk-qr.svg
