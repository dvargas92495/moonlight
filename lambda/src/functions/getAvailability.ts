import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { filter, range, reduce, reverse } from "lodash";
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
      `SELECT * FROM availability
       WHERE user_id=($1)`,
      [userId]
    )
    .then(res => {
      client.end();
      const {
        user_id,
        work_hours_start,
        work_hours_end,
        work_days
      } = res.rows[0];
      let encodedValue = work_days;
      const decodedWorkDays = filter(range(6, -1, -1), i => {
        const powerOf2 = Math.pow(2, i);
        if (encodedValue >= powerOf2) {
          encodedValue -= powerOf2;
          return true;
        } else {
          return false;
        }
      });
      return okResponse({
        userId: user_id,
        workHoursStart: work_hours_start,
        workHoursEnd: work_hours_end,
        workDays: reverse(decodedWorkDays)
      });
    })
    .catch(e => userErrorResponse(e.message));
};
