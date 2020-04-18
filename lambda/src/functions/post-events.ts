import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, serverErrorResponse } from "../layers/util";
import { eventFrequency } from "../layers/enums";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const {
    userId,
    createdBy,
    Subject,
    StartTime,
    EndTime,
    isWeekly,
  } = JSON.parse(event.body);
  const IsPending = userId != createdBy;
  const client = connectRdsClient();
  return client.query("BEGIN").then(() =>
    client
      .query(
        `INSERT INTO events(user_id, created_by, subject, start_time, end_time, is_pending)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
        [userId, createdBy, Subject, StartTime, EndTime, IsPending]
      )
      .then((res) => {
        const { id } = res.rows[0];
        if (isWeekly) {
          return client.query(
            `INSERT INTO event_recurrence_rules(event_id, frequency, interval)
           VALUES ($1, $2, $3)
           RETURNING event_id as id, frequency, interval`,
            [id, eventFrequency.WEEKLY, 1]
          );
        }
        return res;
      })
      .then((res) => client.query("COMMIT").then(() => res))
      .then((res) => {
        client.end();
        const { id: Id } = res.rows[0];
        const RecurrenceRule = isWeekly ? "FREQ=WEEKLY;INTERVAL=1" : null;
        return okResponse({
          userId,
          createdBy,
          Subject,
          StartTime,
          EndTime,
          IsPending,
          Id,
          RecurrenceRule,
        });
      })
      .catch((e) => serverErrorResponse(e.message))
  );
};
