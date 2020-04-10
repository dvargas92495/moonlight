const fs = require("fs");
const path = require("path");
const common = require("./webpack.common.config");

const entries = fs.readdirSync("./src/functions/");
const entry = entries.reduce((acc, e) => {
  acc[e.substring(0, e.length - 3)] = `./src/functions/${e}`;
  return acc;
}, {});

module.exports = {
  ...common,
  entry,
  mode: "production",
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "build"),
    filename: "[name].js",
  },
};
