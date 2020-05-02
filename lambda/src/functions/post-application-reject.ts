import { APIGatewayProxyEvent } from "aws-lambda";
import { userErrorResponse, emptyResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { applicationStatus } from "../layers/enums";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query(
      `UPDATE applications
       SET status=$1
       WHERE username=$2`,
      [applicationStatus.REJECTED, username]
    )
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch((e) => userErrorResponse(e.message));
};
