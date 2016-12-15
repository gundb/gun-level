'use strict';

const eslint = exports;

eslint.env = {
  browser: true,
  commonjs: true,
  node: true,
  es6: true,
};

eslint.parserOptions = {
  sourceType: 'module',
};

eslint.extends = [
  'eslint:recommended',
  'llama',
];

eslint.rules = {
  'require-jsdoc': 'off',
};
