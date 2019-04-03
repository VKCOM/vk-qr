# vk-qr
<div align="center">
  <a href="https://github.com/VKCOM">
    <img width="100" height="100" src="https://avatars3.githubusercontent.com/u/1478241?s=200&v=4">
  </a>
  <br>
  <br>

  [![npm][npm]][npm-url]
  ![Node](https://img.shields.io/node/v/vk-qr.svg?style=flat-square)
[![NPM](https://img.shields.io/npm/v/vk-qr.svg?style=flat-square)](https://www.npmjs.com/package/vk-qr)
[![NPM](https://img.shields.io/npm/dt/vk-qr.svg?style=flat-square)](https://www.npmjs.com/package/vk-qr)

</div>

### Usage

```js
import qrCodeGenerator from 'vk-qr';
const text = 'TEST';

const qrSvg = qr.createQR(text, 256, 256, 'qr-code-class');

document.body.innerHTML = qrSvg;
```

### Installation

Install via [yarn](https://github.com/yarnpkg/yarn)

	yarn add vk-qr (--dev)

or npm

	npm install vk-qr (--save-dev)


### Examples

See [`example`](example/script.js) folder.

### License

The code is available under the [MIT](LICENSE) license.

### Misc

This module was created using [generator-module-boilerplate](https://github.com/duivvv/generator-module-boilerplate).


[npm]: https://img.shields.io/npm/v/@vkontakte/vk-qr.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vk-qr