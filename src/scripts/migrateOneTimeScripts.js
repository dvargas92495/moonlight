const fs = require("fs");
const path = require("path");
const Client = require("pg").Client;
const spawnSync = require("child_process").spawnSync;
const AWS = require("aws-sdk");

const scripts = fs.readdirSync(path.join(__dirname, "one-time"));
AWS.config = new AWS.Config({ region: process.env.AWS_DEFAULT_REGION });
const rds = new AWS.RDS({ version: "2014-10-31" });

rds
  .describeDBInstances({
    DBInstanceIdentifier: process.env.TF_WORKSPACE.replace(
      "moonlight-health",
      "emdeo"
    ),
  })
  .promise()
  .then((response) => {
    const host = response.DBInstances[0].Endpoint.Address;
    const client = new Client({
      host,
      user: "emdeo",
      password: process.env.TF_VAR_RDS_MASTER_USER_PASSWORD,
      database: "emdeo",
      query_timeout: 10000,
    });
    client.connect();
    client.query("SELECT * FROM one_time_scripts").then((res) => {
      const executed = new Set(res.rows.map((r) => `${r.version}-${r.name}`));
      return Promise.all(
        scripts
          .filter((s) => s.endsWith(".js"))
          .filter((s) => !executed.has(s))
          .map((s) => {
            console.log(`Running one time script: ${s}`);
            const cmd = spawnSync(
              "node",
              [path.join(__dirname, "one-time", s)],
              {
                stdio: ["inherit", "inherit", "inherit"],
                env: {
                  ...process.env,
                  RDS_MASTER_HOST: host,
                  ENV_NAME: process.env.TF_WORKSPACE.replace(
                    "moonlight-health",
                    "emdeo"
                  ),
                },
              }
            );
            if (cmd.status != 0) {
              process.exit(1);
            }
            const version = s.substring(0, 14);
            const name = s.substring(15);
            return client.query(
              "INSERT INTO one_time_scripts(version, name) VALUES ($1, $2)",
              [version, name]
            );
          })
      )
        .then(() => client.end())
        .then(() => console.log("Finished migrating scripts!"));
    });
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
