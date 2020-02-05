const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: {
    signUp: "./src/functions/signUp.ts",
    confirmSignUp: "./src/functions/confirmSignUp.ts",
    signIn: "./src/functions/signIn.ts"
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
    })
  ]
};
