const spawnSync = require("child_process").spawnSync;
const getRestApi = require("../awsHelpers").getRestApi;

getRestApi()
  .then((restApiId) => {
    const target_url = `https://${restApiId}.execute-api.us-east-1.amazonaws.com/production/vcita/clients/created`;
    const data = JSON.stringify({
      event: "client/created",
      target_url,
    });
    console.log(target_url);

    const curl = (url) =>
      spawnSync(
        "curl",
        [
          "--location",
          "--request",
          "POST",
          url,
          "--header",
          `authorization: Bearer ${process.env.REACT_APP_VCITA_API_TOKEN}`,
          "--header",
          "content-type: application/json",
          "--data",
          data,
        ],
        {
          stdio: ["inherit", "inherit", "inherit"],
        }
      );

    curl("http://api.vcita.biz/platform/v1/webhook/unsubscribe");
    console.log("");
    curl("http://api.vcita.biz/platform/v1/webhook/subscribe");
    console.log("");
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
