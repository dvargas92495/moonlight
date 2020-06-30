const fs = require("fs");
const path = require("path");
const Client = require("pg").Client;
const spawnSync = require("child_process").spawnSync;

const scripts = fs.readdirSync(path.join(__dirname, "one-time"));
const client = new Client({
  host: process.env.RDS_MASTER_HOST,
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
        spawnSync("node", [path.join(__dirname, "one-time", s)], {
          stdio: ["inherit", "inherit", "inherit"],
        });
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
