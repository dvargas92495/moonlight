import {
  map,
  sortBy,
  groupBy,
  mapValues,
  maxBy,
  flatten,
  values,
} from "lodash";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (e: APIGatewayProxyEvent) => {
  const { id } = e.pathParameters;
  const client = connectRdsClient();
  return client
    .query(
      `SELECT r.specialist_id, r.rate, r.updated_date_utc, CONCAT(p.first_name, ' ', p.last_name) as updated_by FROM office_rates r
    LEFT JOIN profile p ON p.user_id = r.updated_by
    WHERE r.office_id = $1`,
      [id]
    )
    .then((res) => {
      client.end();
      const ratesBySpecialist = mapValues(
        groupBy(res.rows, "specialist_id"),
        (rs) => {
          const latestDate = maxBy(rs, "updated_date_utc").updated_date_utc;
          return map(rs, (r) => ({
            specialistId: r.specialist_id,
            rate: r.rate,
            updatedBy: r.updated_by,
            updatedDateUtc: r.updated_date_utc,
            latestDate,
          }));
        }
      );
      const data = flatten(values(ratesBySpecialist));
      return okResponse({
        data,
        page: 0,
        totalCount: res.rows.length,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
