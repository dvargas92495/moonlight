import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { okResponse, userErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { userId, createdBy, Subject, StartTime, EndTime } = JSON.parse(
    event.body
  );
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
      `INSERT INTO events(user_id, created_by, subject, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, createdBy, Subject, StartTime, EndTime]
    )
    .then(res => {
      client.end();
      const {
        user_id,
        created_by,
        subject,
        start_time,
        end_time
      } = res.rows[0];
      return okResponse({
        userId: user_id,
        createdBy: created_by,
        Subject: subject,
        StartTime: start_time,
        EndTime: end_time
      });
    })
    .catch(e => userErrorResponse(e.message));
};
