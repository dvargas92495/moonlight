const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: {
    signUp: "./src/functions/signUp.ts",
    confirmSignUp: "./src/functions/confirmSignUp.ts",
    signIn: "./src/functions/signIn.ts",
    getAvailability: "./src/functions/getAvailability.ts",
    putAvailability: "./src/functions/putAvailability.ts",
    getSpecialistViews: "./src/functions/getSpecialistViews.ts"
  },
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
