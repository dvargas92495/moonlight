import { map, sortBy, find, get } from "lodash";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { specialists } from "../layers/specialists";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (e: APIGatewayProxyEvent) => {
  const { id } = e.pathParameters;
  const client = connectRdsClient();
  return client
    .query(
      `SELECT r.* FROM office_rates r
    INNER JOIN (SELECT MAX(updated_date_utc) as updated_date_utc, specialist_id FROM office_rates WHERE office_id = $1 GROUP BY specialist_id) latest 
    ON latest.updated_date_utc = r.updated_date_utc AND latest.specialist_id = r.specialist_id
    WHERE r.office_id = $1`,
      [id]
    )
    .then((res) => {
      client.end();
      return okResponse({
        data: sortBy(
          map(res.rows, (r) => ({
            specialist: get(
              find(specialists, { id: r.specialist_id }),
              "title"
            ),
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
