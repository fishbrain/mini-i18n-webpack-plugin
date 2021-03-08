const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const {
  toConstantDependency,
} = require('webpack/lib/javascript/JavascriptParserHelpers');

class MiniI18nWebpackPlugin {
  constructor(translations) {
    this.translations = translations;
    this.name = 'MiniI18nWebpackPlugin';
  }

  createHandler(compilation) {
    return (parser) => {
      const { translations, name } = this;
      parser.hooks.call.for('__').tap(name, (expr) => {
        const keyExpr = parser.evaluateExpression(expr.arguments[0]);
        if (!keyExpr.isString()) {
          compilation.errors.push('Translation key must be a string');
          return false;
        }
        const key = keyExpr.asString();
        if (translations && !(key in translations)) {
          compilation.warnings.push(`Missing translation: ${key}`);
        }
        const value = (translations || {})[key] || key;
        return toConstantDependency(parser, JSON.stringify(value))(expr);
      });
    };
  }

  apply(compiler) {
    const { name } = this;
    compiler.hooks.compilation.tap(name, (compilation) => {
      compilation.dependencyTemplates.set(
        ConstDependency,
        new ConstDependency.Template(),
      );
    });
    compiler.hooks.compilation.tap(
      name,
      (compilation, { normalModuleFactory }) => {
        const handler = this.createHandler(compilation);
        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap(name, handler);
        normalModuleFactory.hooks.parser
          .for('javascript/dynamic')
          .tap(name, handler);
        normalModuleFactory.hooks.parser
          .for('javascript/esm')
          .tap(name, handler);
      },
    );
  }
}

module.exports = MiniI18nWebpackPlugin;
