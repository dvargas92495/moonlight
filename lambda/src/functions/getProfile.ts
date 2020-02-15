import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { isEmpty } from "lodash";
import { okResponse, userErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { userId } = event.queryStringParameters;
  const client = new Client({
    host: process.env.REACT_APP_RDS_MASTER_HOST,
    user: process.env.REACT_APP_RDS_MASTER_USER,
    password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
    database: "moonlight",
    query_timeout: 10000
  });
  client.connect();
  return client
    .query(
      `SELECT * FROM profile
       WHERE user_id=($1)`,
      [userId]
    )
    .then(res => {
      client.end();
      if (isEmpty(res.rows)) {
        return userErrorResponse("No profile for user set");
      }
      const { user_id, first_name, last_name } = res.rows[0];
      return okResponse({
        userId: user_id,
        firstName: first_name,
        lastName: last_name
      });
    })
    .catch(e => userErrorResponse(e.message));
};
