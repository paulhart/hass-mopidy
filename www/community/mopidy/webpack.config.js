const path = require('path');

module.exports = {
  entry: './src/mopidy-queue-card.ts',
  output: {
    filename: 'mopidy-queue-card.js',
    path: path.resolve(__dirname, '.'),
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // Home Assistant provides Lit globally, so we don't bundle it
    'lit': 'lit',
    'lit/decorators.js': 'lit/decorators.js',
    'lit/directives/class-map.js': 'lit/directives/class-map.js',
    'lit/directives/style-map.js': 'lit/directives/style-map.js',
  },
  mode: 'production',
};

