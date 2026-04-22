import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2020',
      dts: true,
      externalHelpers: true,
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
    },
  ],
  source: {
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
  },
});
