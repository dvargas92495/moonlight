const fs = require("fs");
const path = require("path");
const common = require("./webpack.common.config");

const functions = fs.readdirSync("./src/functions/");
const jobs = fs.readdirSync("./src/jobs/");
const functionEntry = functions.reduce((acc, e) => {
  acc[e.substring(0, e.length - 3)] = `./src/functions/${e}`;
  return acc;
}, {});
delete functionEntry["__test"];
const entry = jobs.reduce((acc, j) => {
  acc[j.substring(0, j.length - 3)] = `./src/jobs/${j}`;
  return acc;
}, functionEntry);

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
