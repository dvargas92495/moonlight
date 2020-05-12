import { APIGatewayProxyEvent } from "aws-lambda";
import { userErrorResponse, okResponse } from "../layers/util";
import {
  connectRdsClient,
  cognitoIdentityServiceProvider,
  UserPoolId,
} from "../layers/aws";
import { applicationStatus } from "../layers/enums";
import { find } from "lodash";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query("BEGIN")
    .then(() =>
      client.query(
        `UPDATE applications
        SET status=$1
        WHERE username=$2
        RETURNING *`,
        [applicationStatus.ACCEPTED, username]
      )
    )
    .then((res) => {
      const application = res.rows[0];
      return cognitoIdentityServiceProvider
        .adminCreateUser({
          UserPoolId,
          Username: username,
        })
        .promise()
        .then(({ User: { Attributes } }) => {
          const sub = find(Attributes, { Name: "sub" })?.Value;
          return client.query(
            "INSERT INTO users(uuid, type, username) VALUES ($1, $2, $3) RETURNING id",
            [sub, application.type, username]
          );
        })
        .then((user) =>
          client.query(
            "INSERT INTO profile(user_id, first_name, last_name) VALUES ($1, $2, $3) RETURNING *",
            [user.rows[0].id, application.first_name, application.last_name]
          )
        );
    })
    .then(() => client.query("COMMIT"))
    .then(() => {
      client.end();
      return okResponse({ username });
    })
    .catch((e) => userErrorResponse(e.message));
};
