import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { emptyResponse, serverErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const client = new Client({
    host: process.env.REACT_APP_RDS_MASTER_HOST,
    user: "moonlight",
    password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
    database: "moonlight",
    query_timeout: 10000,
  });
  client.connect();
  return client
    .query("BEGIN")
    .then(() =>
      client.query(
        `DELETE FROM event_recurrence_rules
       WHERE event_id=$1`,
        [id]
      )
    )
    .then(() =>
      client.query(
        `DELETE FROM patient_event_links
        WHERE event_id=$1`,
        [id]
      )
    )
    .then(() =>
      client.query(
        `DELETE FROM events
      WHERE id=$1`,
        [id]
      )
    )
    .then(() => client.query("COMMIT"))
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch((e) => serverErrorResponse(e.message));
};
