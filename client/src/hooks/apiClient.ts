import { join, keys, map, isEmpty, reduce, noop } from "lodash";
import { useState, useCallback } from "react";

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

export const useApiPost = (
  url: string,
  onSuccess: (response: any) => void = noop
) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = useCallback(
    request => {
      setLoading(true);
      setError("");
      apiPost(url, request)
        .then(response => {
          setLoading(false);
          onSuccess(response);
        })
        .catch(e => {
          setLoading(false);
          setError(e.message);
        });
    },
    [url, setError, setLoading, onSuccess]
  );
  return {
    error,
    loading,
    handleSubmit
  };
};

export const useApiFormPost = (
  url: string,
  extraProps: object,
  onSuccess: (response: Object) => void
) => {
  const { error, loading, handleSubmit: originalHandler } = useApiPost(
    url,
    onSuccess
  );
  const handleSubmit = useCallback(
    event => {
      const formData = new FormData(event.target);
      const data: { [key: string]: FormDataEntryValue[] } = {};
      formData.forEach((v, k) => {
        if (data[k]) {
          data[k].push(v);
        } else {
          data[k] = [v];
        }
      });
      const request = reduce(
        Object.keys(data),
        (acc, k) => ({
          ...acc,
          [k]: data[k].length === 1 ? data[k][0] : data[k]
        }),
        {}
      );
      originalHandler({
        ...request,
        ...extraProps
      });
      event.preventDefault();
    },
    [extraProps, originalHandler]
  );
  return {
    error,
    loading,
    handleSubmit
  };
};

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
