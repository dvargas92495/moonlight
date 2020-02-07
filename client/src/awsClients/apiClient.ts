import { join, keys, map } from "lodash";

const handleResponse = (r: Response) =>
  r.json().then(b => {
    if (r.ok) {
      return b;
    } else {
      throw new Error(b.message);
    }
  });

const apiGet = (url: string, queryParams: { [key: string]: any }) =>
  fetch(
    `${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}?${join(
      map(keys(queryParams), k => `${k}=${queryParams[k]}`),
      "&"
    )}`
  ).then(handleResponse);

const apiPost = (url: string, body: object) =>
  fetch(`${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}`, {
    method: "POST",
    body: JSON.stringify(body)
  }).then(handleResponse);

export const signIn = (username: string, password: string) =>
  apiPost("signin", {
    username,
    password
  });

export const signUp = (username: string, password: string) =>
  apiPost("signup", {
    username,
    password
  });

export const confirmSignUp = (username: string, confirmationCode: string) =>
  apiPost("confirm-signup", {
    username,
    confirmationCode
  });

export const getAvailablity = (userId: number) =>
  apiGet("availability", { userId });
