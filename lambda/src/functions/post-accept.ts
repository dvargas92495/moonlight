import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";
import { connectRdsClient, ses, domain } from "../layers/aws";
import { map, filter, find } from "lodash";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { eventId } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query("BEGIN")
    .then(() =>
      client.query(
        `UPDATE events
       SET subject='Appointment Booked', is_pending=false
       WHERE id=$1
       RETURNING *`,
        [eventId]
      )
    )
    .then((res) =>
      client
        .query(
          `
    SELECT u.username, u.id, p.first_name, p.last_name
    FROM users u
    INNER JOIN profile p ON p.user_id = u.id
    WHERE u.id IN ($1, $2)
    `,
          [res.rows[0].user_id, res.rows[0].created_by]
        )
        .then((sel) => ({
          event: res.rows[0],
          users: sel.rows,
        }))
    )
    .then((data) => {
      const {
        id,
        user_id,
        created_by,
        subject,
        start_time,
        end_time,
        is_pending,
      } = data.event;
      const ToAddresses = map(
        filter(data.users, { id: created_by }),
        "username"
      );
      const owner = find(data.users, { id: user_id });
      const Data = `Your event ${subject} was accepted by ${owner.first_name} ${owner.last_name} for ${start_time} to ${end_time}.`;
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
        .promise()
        .then(() => client.query("COMMIT"))
        .then(() => client.end())
        .then(() =>
          okResponse({
            userId: user_id,
            createdBy: created_by,
            Subject: subject,
            StartTime: start_time,
            EndTime: end_time,
            Id: id,
            IsPending: is_pending,
          })
        );
    })

    .catch((e) => userErrorResponse(e.message));
};
