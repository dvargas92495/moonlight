import { Client } from "pg";
import { filter, isEmpty, range, reverse, map } from "lodash";
import { okResponse, userErrorResponse } from "../layers/util";
import { APIGatewayProxyEvent } from "aws-lambda";

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
      `SELECT a.*, CONCAT(p.first_name, ' ', p.last_name) as full_name 
       FROM users u
       INNER JOIN availability a ON u.id = a.user_id
       INNER JOIN profile p ON u.id = p.user_id
       WHERE u.id <> ($1)`,
      [userId]
    )
    .then(res => {
      client.end();
      if (isEmpty(res.rows)) {
        return userErrorResponse("No available specialists");
      }
      const specialists = map(
        res.rows,
        ({
          user_id,
          work_hours_start,
          work_hours_end,
          work_days,
          full_name
        }) => {
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
          return {
            userId: user_id,
            workHoursStart: work_hours_start,
            workHoursEnd: work_hours_end,
            workDays: reverse(decodedWorkDays),
            fullName: full_name
          };
        }
      );
      return okResponse(specialists);
    })
    .catch(e => userErrorResponse(e.message));
};
