import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const { specialistId, rate, updatedBy } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query(
      `INSERT INTO office_rates(office_id, specialist_id, rate, updated_by, updated_date_utc)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [id, specialistId, rate, updatedBy, new Date()]
    )
    .then((res) => {
      client.end();
      const {
        office_id,
        specialist_id,
        rate,
        updated_by,
        updated_date_utc,
      } = res.rows[0];
      return okResponse({
        id: office_id,
        specialistId: specialist_id,
        rate,
        updatedBy: updated_by,
        updatedDateUtc: updated_date_utc,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
