import {
  cognitoIdentityServiceProvider,
  connectRdsClient,
  UserPoolId,
} from "../layers/aws";
import { userType } from "../layers/enums";
import { find } from "lodash";
import { APIGatewayProxyEvent } from "aws-lambda";
import { userErrorResponse, okResponse } from "../layers/util";

export const handler = (event: APIGatewayProxyEvent) => {
  const { username: Username, firstName, lastName, type } = JSON.parse(
    event.body
  );
  const key = type.toUpperCase() as string;
  if (!userType.hasOwnProperty(key)) {
    return userErrorResponse(`Tried to create a user of invalid type ${type}`);
  }
  const inputUserType = userType[key as keyof typeof userType];
  return cognitoIdentityServiceProvider
    .adminCreateUser({
      UserPoolId,
      Username,
      UserAttributes: [
        {
          Name: "email_verified",
          Value: "true",
        },
        {
          Name: "email",
          Value: Username,
        },
      ],
    })
    .promise()
    .then(({ User: { Attributes } }) => {
      const sub = find(Attributes, { Name: "sub" })?.Value;
      const client = connectRdsClient();
      return client
        .query("BEGIN")
        .then(() =>
          client.query(
            "INSERT INTO users(uuid, type, username) VALUES ($1, $2, $3) RETURNING id",
            [sub, inputUserType, Username]
          )
        )
        .then((res) =>
          client.query(
            "INSERT INTO profile(user_id, first_name, last_name) VALUES ($1, $2, $3) RETURNING *",
            [res.rows[0].id, firstName, lastName]
          )
        )
        .then(() => client.query("COMMIT"))
        .then(() => {
          client.end();
          return okResponse({ username: Username });
        });
    })
    .catch((e) => `Failed to create user ${Username}: ${e.message}`);
};
