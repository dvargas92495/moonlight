import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { userId, firstName, lastName } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query(
      `INSERT INTO profile(user_id, first_name, last_name)
                VALUES ($1, $2, $3) 
                ON CONFLICT (user_id) 
                DO UPDATE SET first_name=excluded.first_name, last_name=excluded.last_name
                RETURNING *`,
      [userId, firstName, lastName]
    )
    .then((res) => {
      client.end();
      const { user_id, first_name, last_name } = res.rows[0];
      return okResponse({
        userId: user_id,
        firstName: first_name,
        lastName: last_name,
      });
    })
    .catch((e) => userErrorResponse(e.message));
};
