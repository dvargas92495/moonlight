const path = require("path");

module.exports = {
  moduleDirectories: ["node_modules", path.join(__dirname, "./src")],
  transform: { "\\.ts$": ["ts-jest"] },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "jest-environment-node",
};
