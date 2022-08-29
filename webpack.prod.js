const path = require("path");
const webpackCommon = require("./webpack.common");

module.exports = {
  ...webpackCommon,
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  mode: "production",
};
