# mini-i18n-webpack-plugin

Embed localization in the bundle.

## Install

```
$ npm install mini-i18n-webpack-plugin
```

```js
// webpack.config.js
const MiniI18nWebpackPlugin = require('mini-i18n-webpack-plugin');
const translations = require('lang.json');

module.exports = {
  plugins: [new MiniI18nWebpackPlugin(translations)],
};
```

## License

[ISC](LICENSE)
