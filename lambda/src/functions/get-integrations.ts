import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { map, keyBy, mapValues } from "lodash";

export const handler = async (e: APIGatewayProxyEvent) => {
  const client = connectRdsClient();
  return client
    .query(`SELECT first_name as value, client_id as key FROM vcita_clients`)
    .then((res) => {
      client.end();
      return okResponse({
        vcitaClients: mapValues(keyBy(res.rows, "key"), (r) => r.value),
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
