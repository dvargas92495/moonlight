import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { map } from "lodash";
import { okResponse, userErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const {
    userId,
    viewUserId,
    startTime,
    endTime
  } = event.queryStringParameters;
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
      `SELECT * FROM events
       WHERE user_id=$1 AND start_time >= $2 AND start_time < $3`,
      [userId, startTime, endTime]
    )
    .then(res => {
      client.end();
      return okResponse(
        map(res.rows, r => {
          const IsReadonly =
            r.user_id != viewUserId && r.created_by != viewUserId;
          return {
            Subject: IsReadonly ? "BUSY" : r.subject,
            StartTime: r.start_time,
            EndTime: r.end_time,
            IsReadonly,
            Id: r.id
          };
        })
      );
    })
    .catch(e => userErrorResponse(e.message));
};
