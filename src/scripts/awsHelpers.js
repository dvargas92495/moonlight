const AWS = require("aws-sdk");

AWS.config = new AWS.Config({ region: process.env.AWS_DEFAULT_REGION });

const apig = new AWS.APIGateway({ version: "2015-07-09" });
module.exports.getRestApi = () =>
  apig
    .getRestApis()
    .promise()
    .then((response) => {
      const item = response.items.find((i) => i.name === process.env.ENV_NAME);
      return item.id;
    });
