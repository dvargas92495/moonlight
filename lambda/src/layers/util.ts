import { findKey, split, map, join, slice } from "lodash";

export const headers = {
  "Access-Control-Allow-Origin": "*",
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

export const parseFileName = (filename: string) => {
  if (!filename) {
    return { name: "", type: "" };
  }
  const fileParts = split(filename, ".");
  const name =
    fileParts.length === 1
      ? fileParts[0]
      : join(slice(fileParts, 0, fileParts.length - 1), ".");
  const type =
    fileParts.length === 1 ? "" : `.${fileParts[fileParts.length - 1]}`;
  return { name, type };
};
