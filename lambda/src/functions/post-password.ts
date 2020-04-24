import { isEmpty } from "lodash";
import { APIGatewayProxyEvent } from "aws-lambda";
import axios from "axios";
import {
  ClientId,
  createSecretHash,
  cognitoIdentityServiceProvider,
  connectRdsClient,
  verifyToken,
} from "../layers/aws";
import { okResponse, userErrorResponse, getFieldByValue } from "../layers/util";
import { userType } from "../layers/enums";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username: USERNAME, password: NEW_PASSWORD, Session } = JSON.parse(
    event.body
  );
  return cognitoIdentityServiceProvider
    .respondToAuthChallenge({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ClientId,
      Session,
      ChallengeResponses: {
        USERNAME,
        NEW_PASSWORD,
        SECRET_HASH: createSecretHash(USERNAME + ClientId),
      },
    })
    .promise()
    .then(({ AuthenticationResult }) => {
      const idToken = AuthenticationResult?.IdToken || "";
      const refreshToken = AuthenticationResult?.RefreshToken || "";
      if (!isEmpty(idToken)) {
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
    })
    .catch((e) => userErrorResponse(e.message));
};
