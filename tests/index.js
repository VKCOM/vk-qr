const qr = require('../dist/cjs');
const xmlJs = require('xml-js');
const { convert } = require('convert-svg-to-png');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { toMatchSnapshot } = require('jest-snapshot');

expect.extend({
  toMatchImageSnapshot,
  toMatchXmlSnapshot(xml) {
    return toMatchSnapshot.call(this, JSON.stringify(xmlJs.xml2js(xml), null, 2), 'toMatchXmlSnapshot');
  }
});

test('Simple text encoding without options', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet');
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Another text encoding without options', async () => {
  const svg = qr.createQR('Пеп кек');
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Generation with custom size', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet', { qrSize: 500 });
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Generation QR with class name in root element', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet', { className: 'pep kek' });
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Generation QR with showed logo', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet', { isShowLogo: true });
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Generation QR with custom logo color', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet', { isShowLogo: true, logoColor: '#00ff00' });
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Generation QR with showed background', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet', { isShowBackground: true });
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Generation QR with custom background color', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet', { isShowBackground: true, backgroundColor: '#ff0000' });
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});

test('Generation QR with custom foreground color', async () => {
  const svg = qr.createQR('Lorem ipsum dolor sit amet', { foregroundColor: '#0000ff' });
  const png = await convert(svg, {
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  expect(svg).toMatchXmlSnapshot();
  expect(png).toMatchImageSnapshot();
});
