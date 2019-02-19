# qr-code-generator

![Node](https://img.shields.io/node/v/qr-code-generator.svg?style=flat-square)
[![NPM](https://img.shields.io/npm/v/qr-code-generator.svg?style=flat-square)](https://www.npmjs.com/package/qr-code-generator)
[![Travis](https://img.shields.io/travis/mobyman/qr-code-generator/master.svg?style=flat-square)](https://travis-ci.org/mobyman/qr-code-generator)
[![David](https://img.shields.io/david/mobyman/qr-code-generator.svg?style=flat-square)](https://david-dm.org/mobyman/qr-code-generator)
[![Coverage Status](https://img.shields.io/coveralls/mobyman/qr-code-generator.svg?style=flat-square)](https://coveralls.io/github/mobyman/qr-code-generator)
[![NPM](https://img.shields.io/npm/dt/qr-code-generator.svg?style=flat-square)](https://www.npmjs.com/package/qr-code-generator)

> this is a description

### Usage

```js
import qrCodeGenerator from 'qr-code-generator';

```

### Installation

Install via [yarn](https://github.com/yarnpkg/yarn)

	yarn add qr-code-generator (--dev)

or npm

	npm install qr-code-generator (--save-dev)


### configuration

You can pass in extra options as a configuration object (➕ required, ➖ optional, ✏️ default).

```js
import qrCodeGenerator from 'qr-code-generator';

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

See [`example`](example/script.js) folder or the [runkit](https://runkit.com/mobyman/qr-code-generator) example.

### Builds

If you don't use a package manager, you can [access `qr-code-generator` via unpkg (CDN)](https://unpkg.com/qr-code-generator/), download the source, or point your package manager to the url.

`qr-code-generator` is compiled as a collection of [CommonJS](http://webpack.github.io/docs/commonjs.html) modules & [ES2015 modules](http://www.2ality.com/2014/0
  -9/es6-modules-final.html) for bundlers that support the `jsnext:main` or `module` field in package.json (Rollup, Webpack 2)

The `qr-code-generator` package includes precompiled production and development [UMD](https://github.com/umdjs/umd) builds in the [`dist/umd` folder](https://unpkg.com/qr-code-generator/dist/umd/). They can be used directly without a bundler and are thus compatible with many popular JavaScript module loaders and environments. You can drop a UMD build as a [`<script>` tag](https://unpkg.com/qr-code-generator) on your page. The UMD builds make `qr-code-generator` available as a `window.qrCodeGenerator` global variable.

### License

The code is available under the [MIT](LICENSE) license.

### Contributing

We are open to contributions, see [CONTRIBUTING.md](CONTRIBUTING.md) for more info.

### Misc

This module was created using [generator-module-boilerplate](https://github.com/duivvv/generator-module-boilerplate).
