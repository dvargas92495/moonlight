import { handler as signInHandler } from "./functions/signIn";

const apiPost = (url: string, body: object) =>
  fetch(`${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    mode: "no-cors"
  }).then(r => r.json());

export const signIn = (username: string, password: string) =>
  signInHandler({
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
