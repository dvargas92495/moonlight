import { join, keys, map, isEmpty } from "lodash";

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
    `${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}${
      isEmpty(queryParams) ? "" : "?"
    }${join(
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

type SignUpRequest = {
  username: string;
  password: string;
  name: string;
};
export const signUp = (request: SignUpRequest) => apiPost("signup", request);

export const confirmSignUp = (username: string, confirmationCode: string) =>
  apiPost("confirm-signup", {
    username,
    confirmationCode
  });

export const getAvailablity = (userId: number) =>
  apiGet("availability", { userId });

type SaveAvailabilityRequest = {
  userId: number;
  workHoursStart: string;
  workHoursEnd: string;
  workDays: number[];
};

export const saveAvailability = (request: SaveAvailabilityRequest) =>
  apiPost("availability", request);

export const getSpecialistViews = () => apiGet("specialist-views", {});
