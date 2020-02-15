const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

const entries = fs.readdirSync("./src/functions/");
const entry = entries.reduce((acc, e) => {
  acc[e.substring(0, e.length - 3)] = `./src/functions/${e}`;
  return acc;
}, {});

module.exports = {
  entry,
  target: "node",
  mode: "production",
  externals: ["aws-sdk"],
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "build"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    noParse: /opt/,
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new Dotenv({
      path: "../client/.env.local"
    }),
    new Dotenv({
      path: "../client/.env"
    }),
    new webpack.IgnorePlugin(/.\/native/)
  ]
};
