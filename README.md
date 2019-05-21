# vk-qr
<div align="center">
  <a href="https://github.com/VKCOM/vk-qr">
    <img width="100" height="100" src="https://pp.userapi.com/c854128/v854128442/183a0/rtZx2fxUV4w.jpg">
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
const isShowVkLogo = true;
const isShowBackground = true;
const options = {
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
};

const qrSvg = qr.createQR(text, 256, 'qr-code-class', isShowVkLogo, isShowBackground, options);

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
