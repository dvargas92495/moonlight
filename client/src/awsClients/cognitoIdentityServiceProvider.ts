import AWS from "aws-sdk";
import crypto from "crypto";
import JWT from "jsonwebtoken";
import jwkToPem, { JWK } from "jwk-to-pem";
import { find } from "lodash";
import { jwks } from "./awsObjects";

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

const ClientId = "jmq6gj7fkkapcqf8u9i2c9bn7";

const createSecretHash = (username: string) =>
  crypto
    .createHmac("SHA256", "alm159kg846j3g7nc6aab7b5g524e22la2evnji2ceao48dkea2")
    .update(username + ClientId)
    .digest("base64");

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
  region: "us-east-1",
  accessKeyId: "AKIAZLVOUXM6CV6AIX35",
  secretAccessKey: "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"
});

export const signUp = (Username: string, Password: string) => {
  const SecretHash = createSecretHash(Username);
  return cognitoIdentityServiceProvider
    .signUp({
      ClientId,
      SecretHash,
      Password,
      Username
    })
    .promise();
};

export const confirmSignUp = (Username: string, ConfirmationCode: string) => {
  const SecretHash = createSecretHash(Username);
  return cognitoIdentityServiceProvider
    .confirmSignUp({
      ClientId,
      ConfirmationCode,
      Username,
      SecretHash
    })
    .promise();
};

export const signIn = (USERNAME: string, PASSWORD: string) => {
  const SECRET_HASH = createSecretHash(USERNAME);
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
      if (AuthenticationResult) {
        if (AuthenticationResult.IdToken) {
          const {
            header: { kid }
          } = JWT.decode(AuthenticationResult.IdToken, {
            complete: true
          }) as DecodeResult;
          const publicKey = find(jwks.keys, { kid }) as JWK;
          const { sub, aud, iss, token_use, exp } = JWT.verify(
            AuthenticationResult.IdToken,
            jwkToPem(publicKey),
            {
              algorithms: ["RS256"]
            }
          ) as JwtPayload;

          const expirationDate = new Date(exp * 1000);
          if (expirationDate < new Date()) {
            throw new Error(`Log in has expired on ${expirationDate}`);
          }

          if (aud !== ClientId) {
            throw new Error(
              `Log in returned incorrect audience ${aud}, expected ClientId ${ClientId}`
            );
          }

          const expectedIss = `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_QWBKwgoCb`;
          if (iss !== expectedIss) {
            throw new Error(
              `Log in returned incorrect iss ${iss}, expected ${expectedIss}`
            );
          }

          if (token_use !== "id") {
            throw new Error(
              `Log in returned incorrect token use ${token_use}, expected id`
            );
          }

          return { uuid: sub };
        }
      }
      throw new Error("Missing IdToken from sign in");
    });
};
