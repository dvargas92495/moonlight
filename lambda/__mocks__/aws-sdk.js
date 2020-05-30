const AWS = jest.genMockFromModule("aws-sdk");
AWS.Config = function () {};

module.exports = AWS;
