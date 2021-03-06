const path = require("path");

module.exports = {
  moduleDirectories: ["node_modules", path.join(__dirname, "./src")],
  transform: { "\\.ts$": ["ts-jest"] },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "jest-environment-node",
  collectCoverageFrom: ["**/*.ts", "!**/node_modules/**"],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 4,
      lines: 10,
      statements: 10,
    },
  },
};
