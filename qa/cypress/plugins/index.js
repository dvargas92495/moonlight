const webpack = require("@cypress/webpack-preprocessor");
const webpackOptions = require("../webpack.config.js");

module.exports = (on, config) => {
  on("file:preprocessor", webpack({ webpackOptions }));
  require("@cypress/code-coverage/task")(on, config);
  return config;
};
