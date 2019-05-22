# vk-qr
<div align="center">
  <a href="https://github.com/VKCOM/vk-qr">
    <img width="100" height="100" src="https://pp.userapi.com/c851220/v851220335/125ec2/RB-gm_NGv9c.jpg">
  </a>
  <br>
  <br>

  [![npm][npm]][npm-url]
  ![Node](https://img.shields.io/node/v/@vkontakte/vk-qr.svg)
[![NPM](https://img.shields.io/npm/dt/@vkontakte/vk-qr.svg)](https://www.npmjs.com/package/@vkontakte/vk-qr)

</div>

### Usage

```js
import qr from '@vkontakte/vk-qr';
const text = 'TEST';
const options = {
  isShowLogo: true, // show logo in center
  logoData: false, // logo data in base64
  isShowBackground: true, // show qr-background 
  backgroundColor: '#ffffff', // qr-code background color
  foregroundColor: '#000000', // qr-code color
};

const qrSvg = qr.createQR(text, 256, 'qr-code-class', options);

document.body.innerHTML = qrSvg;
```

### Installation

Install via [yarn](https://github.com/yarnpkg/yarn)

	yarn add @vkontakte/vk-qr (--dev)

or npm

	npm install @vkontakte/vk-qr (--save-dev)


### Examples

See [`example`](example/script.js) folder.

### License

The code is available under the [MIT](LICENSE) license.

### Misc

This module was created using [generator-module-boilerplate](https://github.com/duivvv/generator-module-boilerplate).


[npm]: https://img.shields.io/npm/v/@vkontakte/vk-qr.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vk-qr
