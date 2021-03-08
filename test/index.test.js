/* eslint-env mocha */
const assert = require('assert');
const { join } = require('path');
const webpack = require('webpack');
const MiniI18nWebpackPlugin = require('..');

const process = (testCase, output, ...args) =>
  new Promise((resolve, reject) => {
    webpack(
      {
        mode: 'none',
        entry: join(__dirname, 'cases', `${testCase}.js`),
        output: {
          path: join(__dirname, 'dist'),
          filename: `${output}.out.js`,
          libraryTarget: 'commonjs2',
        },
        plugins: [new MiniI18nWebpackPlugin(...args)],
      },
      (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats);
        }
      },
    );
  });

const requireCaseBundle = (key) =>
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(join(__dirname, 'dist', `${key}.out.js`));

describe('MiniI18nWebpackPlugin', () => {
  it('translates', async () => {
    await process('translate', 'translation', { key: 'value' });
    const exports = requireCaseBundle('translation');
    assert.strictEqual(exports, 'value');
  });

  it('does not do anything if there are no translation calls', async () => {
    await process('no_translation', 'noop', { key: 'value' });
    const exports = requireCaseBundle('noop');
    assert.strictEqual(exports, 'string');
  });

  it('creates an error if provided invalid argument', async () => {
    const stats = await process('invalid_argument', 'invalid_argument', {
      key: 'value',
    });
    assert.deepStrictEqual(stats.compilation.errors, [
      'Translation key must be a string',
    ]);
  });

  it('defaults to key when no translations are given', async () => {
    await process('translate', 'no_translations_given');
    const exports = requireCaseBundle('no_translations_given');
    assert.strictEqual(exports, 'key');
  });

  it('defaults to key and warns that translation is missing when translation does not exist', async () => {
    const stats = await process('translate', 'missing_translation', {});
    const exports = requireCaseBundle('missing_translation');
    assert.deepStrictEqual(stats.compilation.warnings, [
      'Missing translation: key',
    ]);
    assert.strictEqual(exports, 'key');
  });
});
