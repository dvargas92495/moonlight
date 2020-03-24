import JWT from "jsonwebtoken";
import jwkToPem, { JWK } from "jwk-to-pem";
import { find, isEmpty } from "lodash";
import { APIGatewayProxyEvent } from "aws-lambda";
import axios from "axios";
import { Client } from "pg";
import {
  createSecretHashObj,
  cognitoIdentityServiceProvider,
  region
} from "../layers/aws";
import { okResponse, userErrorResponse, getFieldByValue } from "../layers/util";
import { userType } from "../layers/enums";

type JwtPayload = {
  sub: string;
  aud: string;
  email_verified: boolean;
  event_id: string;
  token_use: string;
  auth_time: number;
  iss: string;
  "cognito:username": string;
  exp: number;
  iat: number;
  email: string;
};

type DecodeResult = {
  header: {
    kid: string;
    alg: string;
  };
  payload: JwtPayload;
  signature: string;
};

const expectedIss = `https://cognito-idp.${region}.amazonaws.com/${process.env.REACT_APP_USER_POOL_ID}`;

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username: USERNAME, password: PASSWORD } = JSON.parse(event.body);
  const { ClientId, SecretHash: SECRET_HASH } = createSecretHashObj(USERNAME);
  return cognitoIdentityServiceProvider
    .initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId,
      AuthParameters: {
        USERNAME,
        PASSWORD,
        SECRET_HASH
      }
    })
    .promise()
    .then(({ AuthenticationResult }) => {
      const idToken = AuthenticationResult?.IdToken || "";
      if (!isEmpty(idToken)) {
        const {
          header: { kid }
        } = JWT.decode(idToken, {
          complete: true
        }) as DecodeResult;
        return getPublicKey(kid).then(publicKey => {
          const { sub, aud, iss, token_use, exp } = JWT.verify(
            idToken,
            jwkToPem(publicKey),
            {
              algorithms: ["RS256"]
            }
          ) as JwtPayload;

          const expirationDate = new Date(exp * 1000);
          if (expirationDate < new Date()) {
            return userErrorResponse(`Log in has expired on ${expirationDate}`);
          }

          if (aud !== ClientId) {
            return userErrorResponse(
              `Log in returned incorrect audience ${aud}, expected ClientId ${ClientId}`
            );
          }

          if (iss !== expectedIss) {
            return userErrorResponse(
              `Log in returned incorrect iss ${iss}, expected ${expectedIss}`
            );
          }

          if (token_use !== "id") {
            return userErrorResponse(
              `Log in returned incorrect token use ${token_use}, expected id`
            );
          }

          const client = new Client({
            host: process.env.REACT_APP_RDS_MASTER_HOST,
            user: "moonlight",
            password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
            database: "moonlight",
            query_timeout: 10000
          });
          client.connect();
          return client
            .query(
              `SELECT id, type FROM users
               WHERE uuid=($1)`,
              [sub]
            )
            .then(res => {
              client.end();
              const { id, type } = res.rows[0];
              const uType = getFieldByValue(userType, type);
              return okResponse({ id, type: uType });
            });
        });
      }
      return userErrorResponse("Missing IdToken from sign in");
    })
    .catch(e => userErrorResponse(e.message));
};

const getPublicKey = (kid: string) =>
  axios
    .get(`${expectedIss}/.well-known/jwks.json`)
    .then(response => find(response.data.keys, { kid }) as JWK);
