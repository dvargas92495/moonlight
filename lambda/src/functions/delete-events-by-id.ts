import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { userErrorResponse, emptyResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const client = new Client({
    host: process.env.REACT_APP_RDS_MASTER_HOST,
    user: "moonlight",
    password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
    database: "moonlight",
    query_timeout: 10000
  });
  client.connect();
  return client
    .query(
      `DELETE FROM events
       WHERE id=$1`,
      [id]
    )
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch(e => userErrorResponse(e.message));
};
