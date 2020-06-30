const Client = require("pg").Client;
const client = new Client({
  host: process.env.RDS_MASTER_HOST,
  user: "emdeo",
  password: process.env.TF_VAR_RDS_MASTER_USER_PASSWORD,
  database: "emdeo",
  query_timeout: 10000,
});
client.connect();
client
  .query(
    "INSERT INTO one_time_scripts(version, name) VALUES ($1, $2), ($3, $4), ($5, $6)",
    [
      "20200405210608",
      "mv-s3-patient-form-state.sh",
      "20200512200404",
      "backfill-username.sh",
      "20200630113355",
      "subscribe-vcita-appointments.sh",
    ]
  )
  .then(() => client.end());
