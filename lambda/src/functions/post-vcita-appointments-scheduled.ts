import { APIGatewayProxyEvent } from "aws-lambda";
import { serverErrorResponse, emptyResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const {
    data: { appointment_id, start_time, end_time, client_id, staff_id },
  } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query(
      `INSERT INTO vcita_appointments(appointment_id, start_time, end_time, client_id, staff_id)
      VALUES ($1, $2, $3, $4, $5)`,
      [appointment_id, start_time, end_time, client_id, staff_id]
    )
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch((e) => serverErrorResponse(e.message));
};
