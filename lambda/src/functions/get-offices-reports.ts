import { map, groupBy, keys, reduce } from "lodash";
import differenceInHours from "date-fns/differenceInHours";
import format from "date-fns/format";
import addMonths from "date-fns/addMonths";
import startOfMonth from "date-fns/startOfMonth";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
  const client = connectRdsClient();
  const { date } = event.queryStringParameters;
  const startDate = startOfMonth(new Date(date));
  const endDate = addMonths(startDate, 1);
  return client
    .query(
      `SELECT * FROM vcita_appointments WHERE start_time > $1 AND start_time < $2`,
      [startDate, endDate]
    )
    .then((res) => {
      client.end();
      const childData = map(res.rows, (r) => ({
        office: `${format(new Date(r.start_time), "MM/dd hh:mm a")} - ${format(
          new Date(r.end_time),
          "MM/dd hh:mm a"
        )}`,
        totalDue:
          200 * differenceInHours(new Date(r.end_time), new Date(r.start_time)),
        parentOffice: r.client_id,
      }));
      const appointmentsByClient = groupBy(childData, "parentOffice");
      const parentData = map(keys(appointmentsByClient), (k) => {
        const totalDue = reduce(
          appointmentsByClient[k],
          (acc, cur) => cur.totalDue + acc,
          0
        );
        return {
          office: k,
          totalDue,
        };
      });
      return okResponse({
        data: [...parentData, ...childData],
        page: 0,
        totalCount: parentData.length,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
