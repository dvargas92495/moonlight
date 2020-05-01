import {
  cognitoIdentityServiceProvider,
  connectRdsClient,
  UserPoolId,
} from "../layers/aws";
import { userType } from "../layers/enums";
import { find } from "lodash";

export const handler = ({ Username }: { Username: string }) => {
  return cognitoIdentityServiceProvider
    .adminCreateUser({
      UserPoolId,
      Username,
    })
    .promise()
    .then(({ User: { Attributes } }) => {
      const sub = find(Attributes, { Name: "sub" })?.Value;
      const client = connectRdsClient();
      return client
        .query("INSERT INTO users(uuid, type) VALUES ($1, $2) RETURNING id", [
          sub,
          userType.SUPPORT,
        ])
        .then(() => {
          client.end();
          return `Successfully created user ${Username}`;
        });
    })
    .catch((e) => `Failed to create user ${Username}: ${e.message}`);
};
