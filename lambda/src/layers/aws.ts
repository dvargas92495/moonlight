import AWS from "aws-sdk";
import { Client, types } from "pg";
import { createHmac } from "crypto";
import axios, { AxiosResponse } from "axios";
import JWT from "jsonwebtoken";
import jwkToPem, { JWK } from "jwk-to-pem";
import { find } from "lodash";

types.setTypeParser(1114, (str) => `${str}Z`); // timestamps to parse correctly in local env -.-
export const ClientId = process.env.REACT_APP_USER_CLIENT_ID || "";
export const region = "us-east-1";
export const envName = process.env.REACT_APP_ENVIRONMENT_NAME || "";
export const domain = `${envName.replace(/-/g, ".")}.com`;
export const origin = process.env.REACT_APP_ORIGIN_DOMAIN || "";
export const UserPoolId = process.env.REACT_APP_USER_POOL_ID || "";

AWS.config = new AWS.Config({ region });

export const createSecretHash = (message: string) =>
  createHmac("SHA256", process.env.REACT_APP_USER_CLIENT_SECRET || "")
    .update(message)
    .digest("base64");

export const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
  { apiVersion: "2016-04-18" }
);

export const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export const ses = new AWS.SES({ apiVersion: "2010-12-01" });

export const connectRdsClient = () => {
  const client = new Client({
    host: process.env.REACT_APP_RDS_MASTER_HOST,
    user: "emdeo",
    password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
    database: "emdeo",
    query_timeout: 10000,
  });
  client.connect();
  return client;
};

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

const expectedIss = `https://cognito-idp.${region}.amazonaws.com/${UserPoolId}`;
export const verify = (token: string, response: AxiosResponse) => {
  const {
    header: { kid },
  } = JWT.decode(token, {
    complete: true,
  }) as DecodeResult;
  return JWT.verify(token, jwkToPem(find(response.data.keys, { kid }) as JWK), {
    algorithms: ["RS256"],
  }) as JwtPayload;
};

export const verifyToken = (idToken: string) =>
  axios.get(`${expectedIss}/.well-known/jwks.json`).then((response) => {
    const { sub, aud, iss, token_use, exp } = verify(idToken, response);

    const expirationDate = new Date(exp * 1000);
    if (expirationDate < new Date()) {
      throw new Error(`Log in has expired on ${expirationDate}`);
    }

    if (aud !== ClientId) {
      throw new Error(
        `Log in returned incorrect audience ${aud}, expected ClientId ${ClientId}`
      );
    }

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
    return sub;
  });
