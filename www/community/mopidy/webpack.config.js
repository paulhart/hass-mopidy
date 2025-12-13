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
  // Don't externalize Lit - bundle it with the card
  // Home Assistant doesn't provide Lit as an importable ES module,
  // so we need to bundle it to avoid bare specifier errors in browsers
  externals: {},
  mode: 'production',
};

