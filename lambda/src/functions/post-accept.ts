import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { eventId } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query(
      `UPDATE events
       SET subject='Appointment Booked', is_pending=false
       WHERE id=$1
       RETURNING *`,
      [eventId]
    )
    .then((res) => {
      client.end();
      const {
        id,
        user_id,
        created_by,
        subject,
        start_time,
        end_time,
        is_pending,
      } = res.rows[0];
      return okResponse({
        userId: user_id,
        createdBy: created_by,
        Subject: subject,
        StartTime: start_time,
        EndTime: end_time,
        Id: id,
        IsPending: is_pending,
      });
    })
    .catch((e) => userErrorResponse(e.message));
};
