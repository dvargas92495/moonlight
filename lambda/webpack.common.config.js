const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = {
  target: "node",
  externals: ["aws-sdk"],
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    noParse: /opt/,
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: "../client/.env.local",
    }),
    new Dotenv({
      path: "../client/.env",
    }),
    new webpack.IgnorePlugin(/.\/native/),
  ],
};
