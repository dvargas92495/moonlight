import { APIGatewayProxyEvent } from "aws-lambda";
import { emptyResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const client = connectRdsClient();
  return client
    .query(`DELETE FROM offices WHERE id=$1`, [id])
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch((e) => serverErrorResponse(e.message));
};
