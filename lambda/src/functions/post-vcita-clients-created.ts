import { APIGatewayProxyEvent } from "aws-lambda";
import { serverErrorResponse, emptyResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const {
    data: { client_id, first_name = "", last_name = "", email = "" },
  } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query(
      `INSERT INTO vcita_clients(client_id, first_name, last_name, email)
      VALUES ($1, $2, $3, $4)`,
      [client_id, first_name, last_name, email]
    )
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch((e) => serverErrorResponse(e.message));
};
