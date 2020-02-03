import JWT from "jsonwebtoken";
import jwkToPem, { JWK } from "jwk-to-pem";
import { find, isEmpty } from "lodash";
import { APIGatewayProxyEvent } from "aws-lambda";
import {
  createSecretHashObj,
  cognitoIdentityServiceProvider,
  region
} from "../layers/cognito";
import { okResponse, userErrorResponse } from "../layers/util";

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

          return okResponse({ uuid: sub });
        });
      }
      return userErrorResponse("Missing IdToken from sign in");
    })
    .catch(e => userErrorResponse(e.message));
};

const getPublicKey = (kid: string) =>
  fetch(`${expectedIss}/.well-known/jwks.json`)
    .then(response => response.json())
    .then(data => find(data.keys, { kid }) as JWK);
