const path=require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath:'',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-native'
      }
    ]
  },
  externals: {
    'leveldown':"require('leveldown')",
    'secp256k1':"require('secp256k1')",
    'bindings':"require('bindings')"
  },
  target: 'node'
};
