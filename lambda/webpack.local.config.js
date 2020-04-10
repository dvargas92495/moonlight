const path = require("path");
const common = require("./webpack.common.config");

module.exports = {
  ...common,
  entry: "./src/index.ts",
  mode: "development",
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "local"),
    filename: "index.js",
  },
};
