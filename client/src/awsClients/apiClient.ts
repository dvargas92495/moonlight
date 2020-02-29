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

export const apiPost = (url: string, body: object) =>
  fetch(`${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}`, {
    method: "POST",
    body: JSON.stringify(body)
  }).then(handleResponse);

export const getProfile = (userId: number) => apiGet("profile", { userId });

export const getAvailablity = (userId: number) =>
  apiGet("availability", { userId });

export const getSpecialistViews = (userId: number) =>
  apiGet("specialist-views", { userId });

type GetEventsRequest = {
  userId: number;
  viewUserId: number;
  startTime: string;
  endTime: string;
};
export const getEvents = (request: GetEventsRequest) =>
  apiGet("events", request);
