import AWS from "aws-sdk";
import { Client } from "pg";
import { createHmac } from "crypto";

export const ClientId = process.env.REACT_APP_USER_CLIENT_ID || "";
export const region = "us-east-1";
export const envName = process.env.REACT_APP_ENVIRONMENT_NAME || "";
export const domain = `${envName.replace(/-/g, ".")}.com`;

AWS.config = new AWS.Config({
  region,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY || "",
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "",
});

export const createSecretHash = (message: string) =>
  createHmac("SHA256", process.env.REACT_APP_USER_CLIENT_SECRET || "")
    .update(message)
    .digest("base64");

export const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
  { apiVersion: "2016-04-18" }
);

export const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

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
