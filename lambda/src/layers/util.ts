import { findKey, split, map, join } from "lodash";
import { domain } from "./aws";

export const headers = {
  "Access-Control-Allow-Origin": domain,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

type dbEnum = {
  [key: string]: number;
};

export const okResponse = (body: object) => ({
  statusCode: 200,
  body: JSON.stringify(body),
  headers,
});

export const emptyResponse = () => ({
  statusCode: 204,
  headers,
});

export const userErrorResponse = (message: string) => ({
  statusCode: 400,
  body: JSON.stringify({ message }),
  headers,
});

export const serverErrorResponse = (message: string) => ({
  statusCode: 500,
  body: JSON.stringify({ message }),
  headers,
});

export const getFieldByValue = (e: dbEnum, v: number) => {
  const key = findKey(e, (val) => val === v);
  const keyParts = split(key, "_");
  const keyCamelParts = map(keyParts, (k, i) =>
    i === 0
      ? k.toLowerCase()
      : `${k.substring(0, 1)}${k.substring(1).toLowerCase()}`
  );
  return join(keyCamelParts, "");
};
