import AWS from "aws-sdk";
import { createHmac } from "crypto";

const ClientId = process.env.REACT_APP_USER_CLIENT_ID || "";
export const region = "us-east-1";
export const envName = process.env.REACT_APP_ENVIRONMENT_NAME || "";

AWS.config = new AWS.Config({
  region,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY || "",
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "",
});

export const createSecretHashObj = (username: string) => ({
  ClientId,
  SecretHash: createHmac(
    "SHA256",
    process.env.REACT_APP_USER_CLIENT_SECRET || ""
  )
    .update(username + ClientId)
    .digest("base64"),
});

export const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
  { apiVersion: "2016-04-18" }
);

export const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
