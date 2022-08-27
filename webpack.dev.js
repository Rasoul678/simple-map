const webpackCommon = require('./webpack.common');
const path = require('path');

module.exports = {
  ...webpackCommon,
  devtool: "inline-source-map",
  mode: "development",
  devServer: {
    static: path.join(__dirname, 'public'),
    port: 4030,
    hot: true,
    open: true
  },
};