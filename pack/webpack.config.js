
const path=require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    //noParse: /levelup\.js$/
  },
  externals: {
    'leveldown':"require('leveldown')",
    'bindings':"require(''bindings'')"
  },
  target: 'node'
};
