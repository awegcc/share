const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: __dirname + '/upnpCheck.js',
  output: {
    path: __dirname + '/dist',
    filename: 'upnpChecker.js'
  },
  plugins: [
    new UglifyJSPlugin()
  ],
  target: 'node'
};
