import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { filter, range, reduce, reverse } from "lodash";
import { okResponse, userErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { userId, workHoursStart, workHoursEnd, workDays } = JSON.parse(
    event.body
  );
  const encodedWorkDays = reduce(
    workDays,
    (t, i: string) => t + Math.pow(2, parseInt(i)),
    0
  );
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
      `INSERT INTO availability(user_id, work_hours_start, work_hours_end, work_days)
                VALUES ($1, $2, $3, $4) 
                ON CONFLICT (user_id) 
                DO UPDATE SET work_hours_start=excluded.work_hours_start, work_hours_end=excluded.work_hours_end, work_days=excluded.work_days
                RETURNING *`,
      [userId, workHoursStart, workHoursEnd, encodedWorkDays]
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
