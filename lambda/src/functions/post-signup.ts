import {
  ClientId,
  createSecretHash,
  cognitoIdentityServiceProvider,
  connectRdsClient,
} from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";
import { userType } from "../layers/enums";

export const handler = async (event: APIGatewayProxyEvent) => {
  const {
    username: Username,
    password: Password,
    firstName,
    lastName,
    type,
  } = JSON.parse(event.body);
  const key = type.toUpperCase() as string;
  if (!userType.hasOwnProperty(key)) {
    return userErrorResponse(`Tried to create a user of invalid type ${type}`);
  }
  const inputUserType = userType[key as keyof typeof userType];
  return cognitoIdentityServiceProvider
    .signUp({
      SecretHash: createSecretHash(Username + ClientId),
      ClientId,
      Password,
      Username,
    })
    .promise()
    .then(({ UserConfirmed, UserSub }) => {
      if (UserConfirmed) {
        return userErrorResponse("User email is already confirmed");
      } else {
        const client = connectRdsClient();
        return client
          .query("BEGIN")
          .then(() =>
            client.query(
              "INSERT INTO users(uuid, type) VALUES ($1, $2) RETURNING id",
              [UserSub, inputUserType]
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
      }
    })
    .catch((e) => userErrorResponse(e.message));
};
