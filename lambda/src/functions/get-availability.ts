import { APIGatewayProxyEvent } from "aws-lambda";
import { filter, isEmpty, range, reverse } from "lodash";
import { okResponse, userErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { userId } = event.queryStringParameters;
  const client = connectRdsClient();
  return client
    .query(
      `SELECT * FROM availability
       WHERE user_id=($1)`,
      [userId]
    )
    .then((res) => {
      client.end();
      if (isEmpty(res.rows)) {
        return userErrorResponse("No availability for user set");
      }
      const {
        user_id,
        work_hours_start,
        work_hours_end,
        work_days,
      } = res.rows[0];
      let encodedValue = work_days;
      const decodedWorkDays = filter(range(6, -1, -1), (i) => {
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
        workDays: reverse(decodedWorkDays),
      });
    })
    .catch((e) => userErrorResponse(e.message));
};
