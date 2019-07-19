module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    indent: 'off',
    'indent-legacy': ['error', 2, { SwitchCase: 1 }],
    'max-len': ['error', 120]
  }
};
