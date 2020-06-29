import { map, sortBy } from "lodash";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (e: APIGatewayProxyEvent) => {
  const { id } = e.pathParameters;
  const client = connectRdsClient();
  return client
    .query(
      `SELECT r.specialist_id, r.rate, r.updated_date_utc, CONCAT(p.first_name, ' ', p.last_name) as updated_by  FROM office_rates r
    INNER JOIN (SELECT MAX(updated_date_utc) as updated_date_utc, specialist_id FROM office_rates WHERE office_id = $1 GROUP BY specialist_id) latest 
    ON latest.updated_date_utc = r.updated_date_utc AND latest.specialist_id = r.specialist_id
    LEFT JOIN profile p ON p.user_id = r.updated_by
    WHERE r.office_id = $1`,
      [id]
    )
    .then((res) => {
      client.end();
      return okResponse({
        data: sortBy(
          map(res.rows, (r) => ({
            specialistId: r.specialist_id,
            rate: r.rate,
            updatedBy: r.updated_by,
            updatedDateUtc: r.updated_date_utc,
          })),
          "specialist"
        ),
        page: 0,
        totalCount: res.rows.length,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
