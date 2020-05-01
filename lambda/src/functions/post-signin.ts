import { APIGatewayProxyEvent } from "aws-lambda";
import {
  ClientId,
  createSecretHash,
  cognitoIdentityServiceProvider,
  connectRdsClient,
  verifyToken,
} from "../layers/aws";
import { okResponse, userErrorResponse, getFieldByValue } from "../layers/util";
import { userType } from "../layers/enums";
import { isEmpty } from "lodash";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username: USERNAME, password: PASSWORD } = JSON.parse(event.body);
  return cognitoIdentityServiceProvider
    .initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId,
      AuthParameters: {
        USERNAME,
        PASSWORD,
        SECRET_HASH: createSecretHash(USERNAME + ClientId),
      },
    })
    .promise()
    .then(
      ({
        AuthenticationResult,
        ChallengeName,
        ChallengeParameters,
        Session,
      }) => {
        const idToken = AuthenticationResult?.IdToken || "";
        const refreshToken = AuthenticationResult?.RefreshToken || "";
        if (ChallengeName === "NEW_PASSWORD_REQUIRED") {
          return okResponse({
            Session,
          });
        } else if (!isEmpty(idToken)) {
          return verifyToken(idToken).then((sub: string) => {
            const client = connectRdsClient();
            return client
              .query(
                `SELECT id, type FROM users
               WHERE uuid=($1)`,
                [sub]
              )
              .then((res) =>
                client
                  .query(
                    `
             INSERT INTO refresh_tokens (user_id, token) 
             VALUES ($1, $2)
             ON CONFLICT (user_id) 
             DO UPDATE SET token=excluded.token
            `,
                    [res.rows[0].id, refreshToken]
                  )
                  .then(() => res)
              )
              .then((res) => {
                client.end();
                const { id, type } = res.rows[0];
                const uType = getFieldByValue(userType, type);

                return okResponse({
                  id,
                  type: uType,
                  idToken,
                });
              });
          });
        }
        return userErrorResponse("Missing IdToken from sign in");
      }
    )
    .catch((e) => userErrorResponse(e.message));
};
