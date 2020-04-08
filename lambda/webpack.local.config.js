const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/index.ts",
  target: "node",
  mode: "development",
  externals: ["aws-sdk"],
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "local"),
    filename: "index.js",
  },
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
