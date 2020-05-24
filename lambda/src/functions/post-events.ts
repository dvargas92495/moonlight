import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, serverErrorResponse } from "../layers/util";
import { eventFrequency } from "../layers/enums";
import { connectRdsClient, ses, domain } from "../layers/aws";
import { filter, map, find, isEmpty } from "lodash";

export const handler = async (event: APIGatewayProxyEvent) => {
  const {
    userId,
    createdBy,
    Subject,
    StartTime,
    EndTime,
    patientIds,
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
        if (!isEmpty(patientIds)) {
          const patientValues = map(patientIds, (_, i) => `($1,$${i + 2})`);
          return client
            .query(
              `INSERT INTO patient_event_links(event_id,patient_id)	VALUES ${patientValues.join(
                ", "
              )}`,
              [res.rows[0].id, ...patientIds]
            )
            .then(() => res);
        }
        return res;
      })
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
        const { id: Id } = res.rows[0];
        const RecurrenceRule = isWeekly ? "FREQ=WEEKLY;INTERVAL=1" : null;
        const response = okResponse({
          userId,
          createdBy,
          Subject,
          StartTime,
          EndTime,
          IsPending,
          Id,
          RecurrenceRule,
        });
        if (userId != createdBy) {
          return client
            .query(
              `
            SELECT u.username, u.id, p.first_name, p.last_name
            FROM users u
            INNER JOIN profile p ON p.user_id = u.id
            WHERE u.id IN ($1, $2)
          `,
              [userId, createdBy]
            )
            .then((sel) => {
              client.end();
              const ToAddresses = map(
                filter(sel.rows, { id: userId }),
                "username"
              );
              const creator = find(sel.rows, { id: createdBy });
              const Data = `A new event ${Subject} was created by ${creator.first_name} ${creator.last_name} on your schedule from ${StartTime} to ${EndTime}.`;
              return ses
                .sendEmail({
                  Destination: {
                    ToAddresses,
                  },
                  Message: {
                    Body: {
                      Html: {
                        Charset: "UTF-8",
                        Data,
                      },
                      Text: {
                        Charset: "UTF-8",
                        Data,
                      },
                    },
                    Subject: {
                      Charset: "UTF-8",
                      Data: "New Event Created on Emdeo",
                    },
                  },
                  Source: `no-reply@${domain}`,
                })
                .promise();
            })
            .then(() => response);
        } else {
          client.end();
          return response;
        }
      })
      .catch((e) =>
        client
          .query("ROLLBACK")
          .then(() => client.end())
          .then(() => serverErrorResponse(e.message))
      )
  );
};
