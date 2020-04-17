import { APIGatewayProxyEvent } from "aws-lambda";
import { emptyResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const client = connectRdsClient();
  return client
    .query("BEGIN")
    .then(() =>
      client.query(
        `DELETE FROM event_recurrence_rules
       WHERE event_id=$1`,
        [id]
      )
    )
    .then(() =>
      client.query(
        `DELETE FROM patient_event_links
        WHERE event_id=$1`,
        [id]
      )
    )
    .then(() =>
      client.query(
        `DELETE FROM events
      WHERE id=$1`,
        [id]
      )
    )
    .then(() => client.query("COMMIT"))
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch((e) => serverErrorResponse(e.message));
};
