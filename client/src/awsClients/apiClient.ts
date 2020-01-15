import { handler as signInHandler } from "./functions/signIn";
import { handler as signUpHandler } from "./functions/signUp";
import { handler as confirmSignUpHandler } from "./functions/confirmSignUp";

/*
const apiPost = (url: string, body: object) =>
  fetch(`/api/${url}`, {
    method: "POST",
    body: JSON.stringify(body)
  }).then(r => r.json());
*/

export const signIn = (username: string, password: string) =>
  signInHandler({
    username,
    password
  });

export const signUp = (username: string, password: string) =>
  signUpHandler({
    username,
    password
  });

export const confirmSignUp = (username: string, confirmationCode: string) =>
  confirmSignUpHandler({
    username,
    confirmationCode
  });
