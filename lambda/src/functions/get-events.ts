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
  const viewUserIdInt = parseInt(viewUserId);
  const userIdInt = parseInt(userId);
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
      `SELECT * FROM events
       WHERE user_id=$1 AND start_time >= $2 AND start_time < $3 AND (NOT is_pending OR created_by=$4 OR user_id=$4)`,
      [userIdInt, startTime, endTime, viewUserIdInt]
    )
    .then(res => {
      client.end();
      return okResponse(
        map(res.rows, r => {
          const IsReadonly =
            r.user_id != viewUserIdInt && r.created_by != viewUserIdInt;
          return {
            Subject: IsReadonly ? "BUSY" : r.subject,
            StartTime: r.start_time,
            EndTime: r.end_time,
            IsReadonly,
            Id: r.id,
            IsPending: r.is_pending
          };
        })
      );
    })
    .catch(e => userErrorResponse(e.message));
};