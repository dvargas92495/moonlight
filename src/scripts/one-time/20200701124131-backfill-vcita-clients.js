const axios = require("axios");
const Client = require("pg").Client;
const client = new Client({
  host: process.env.RDS_MASTER_HOST,
  user: "emdeo",
  password: process.env.TF_VAR_RDS_MASTER_USER_PASSWORD,
  database: "emdeo",
  query_timeout: 10000,
});

axios
  .get("http://api.vcita.biz/platform/v1/clients", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_VCITA_API_TOKEN}`,
    },
  })
  .then((res) => {
    const { clients } = res.data.data;
    let values = "";
    const valuesArr = [];
    clients
      .filter((c) => c.first_name !== "Moonlight Dentist")
      .forEach(({ first_name, last_name, email, id }) => {
        const currentIndex = valuesArr.length;
        values += `($${currentIndex + 1}, $${currentIndex + 2}, $${
          currentIndex + 3
        }, $${currentIndex + 4}), `;
        valuesArr.push(id, first_name || "", last_name || "", email || "");
      });
    values = values.substring(0, values.length - 2);
    client.connect();
    return client.query(
      `INSERT INTO vcita_clients(client_id, first_name, last_name, email) VALUES ${values}`,
      valuesArr
    );
  })
  .then((r) =>
    console.log(`Successfully inserted ${r.rowCount} rows to vcita_clients`)
  )
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
