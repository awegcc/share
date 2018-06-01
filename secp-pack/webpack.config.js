const path=require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath:'',
    filename: 'bundle.js'
  },
  module: {
  },
  externals: {
    'secp256k1':"require('secp256k1')"
  },
  target: 'node'
};
