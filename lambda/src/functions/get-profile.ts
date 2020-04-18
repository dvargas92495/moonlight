import { APIGatewayProxyEvent } from "aws-lambda";
import { isEmpty } from "lodash";
import { okResponse, userErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { userId } = event.queryStringParameters;
  const client = connectRdsClient();
  return client
    .query(
      `SELECT * FROM profile
       WHERE user_id=($1)`,
      [userId]
    )
    .then((res) => {
      client.end();
      if (isEmpty(res.rows)) {
        return userErrorResponse("No profile for user set");
      }
      const { user_id, first_name, last_name } = res.rows[0];
      return okResponse({
        userId: user_id,
        firstName: first_name,
        lastName: last_name,
      });
    })
    .catch((e) => userErrorResponse(e.message));
};
