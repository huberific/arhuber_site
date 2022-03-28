const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  externalsPresets: {
      node: true
  },
  // The entry point file described above
  entry: './src/public/js/habitTracker.js',
  // The location of the build folder described above
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'habitTracker.bundle.js'
  },
    mode: 'production'
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  // devtool: 'eval-source-map',
};
