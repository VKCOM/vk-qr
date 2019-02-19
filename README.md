# vk-qr

![Node](https://img.shields.io/node/v/vk-qr.svg?style=flat-square)
[![NPM](https://img.shields.io/npm/v/vk-qr.svg?style=flat-square)](https://www.npmjs.com/package/vk-qr)
[![Travis](https://img.shields.io/travis/vkcom/vk-qr/master.svg?style=flat-square)](https://travis-ci.org/vkcom/vk-qr)
[![David](https://img.shields.io/david/vkcom/vk-qr.svg?style=flat-square)](https://david-dm.org/vkcom/vk-qr)
[![Coverage Status](https://img.shields.io/coveralls/vkcom/vk-qr.svg?style=flat-square)](https://coveralls.io/github/vkcom/vk-qr)
[![NPM](https://img.shields.io/npm/dt/vk-qr.svg?style=flat-square)](https://www.npmjs.com/package/vk-qr)

> this is a description

### Usage

```js
import qrCodeGenerator from 'vk-qr';

```

### Installation

Install via [yarn](https://github.com/yarnpkg/yarn)

	yarn add vk-qr (--dev)

or npm

	npm install vk-qr (--save-dev)


### configuration

You can pass in extra options as a configuration object (➕ required, ➖ optional, ✏️ default).

```js
import qrCodeGenerator from 'vk-qr';

```

➖ **property** ( type ) ` ✏️ default `
<br/> 📝 description
<br/> ❗️ warning
<br/> ℹ️ info
<br/> 💡 example

### methods

#### #name

```js
qrCodeGenerator

```

### Examples

See [`example`](example/script.js) folder or the [runkit](https://runkit.com/vkcom/vk-qr) example.

### Builds

If you don't use a package manager, you can [access `vk-qr` via unpkg (CDN)](https://unpkg.com/vk-qr/), download the source, or point your package manager to the url.

`vk-qr` is compiled as a collection of [CommonJS](http://webpack.github.io/docs/commonjs.html) modules & [ES2015 modules](http://www.2ality.com/2014/0
  -9/es6-modules-final.html) for bundlers that support the `jsnext:main` or `module` field in package.json (Rollup, Webpack 2)

The `vk-qr` package includes precompiled production and development [UMD](https://github.com/umdjs/umd) builds in the [`dist/umd` folder](https://unpkg.com/vk-qr/dist/umd/). They can be used directly without a bundler and are thus compatible with many popular JavaScript module loaders and environments. You can drop a UMD build as a [`<script>` tag](https://unpkg.com/vk-qr) on your page. The UMD builds make `vk-qr` available as a `window.qrCodeGenerator` global variable.

### License

The code is available under the [MIT](LICENSE) license.

### Contributing

We are open to contributions, see [CONTRIBUTING.md](CONTRIBUTING.md) for more info.

### Misc

This module was created using [generator-module-boilerplate](https://github.com/duivvv/generator-module-boilerplate).
