import axios from "axios";
import { reduce, noop } from "lodash";
import { useState, useCallback } from "react";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_GATEWAY_INVOKE_URL
});

const useApi = (apiMethod: (request: any) => Promise<any>) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const callback = useCallback(
    (onSuccess: (response: any) => void = noop) => ({
      error,
      loading,
      handleSubmit: (request: any) => {
        setLoading(true);
        setError("");
        apiMethod(request)
          .then(response => {
            setLoading(false);
            onSuccess(response.data);
          })
          .catch(e => {
            setLoading(false);
            setError(e.response?.data?.message || e.message);
          });
      }
    }),
    [apiMethod, error, loading, setError, setLoading]
  );
  return callback;
};

export const useApiPost = (url: string, onSuccess?: (response: any) => void) =>
  useApi(request => api.post(url, request))(onSuccess);

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

export const useApiDelete = (
  url: string,
  onSuccess?: (response: any) => void
) => useApi(request => api.delete(`${url}/${request}`))(onSuccess);

export const getProfile = (userId: number) =>
  api.get("profile", { params: { userId } }).then(s => s.data);

export const getAvailablity = (userId: number) =>
  api.get("availability", { params: { userId } }).then(s => s.data);

export const getSpecialistViews = (userId: number) =>
  api.get("specialist-views", { params: { userId } }).then(s => s.data);

type GetEventsRequest = {
  userId: number;
  viewUserId: number;
  startTime: string;
  endTime: string;
};
export const getEvents = (params: GetEventsRequest) =>
  api.get("events", { params }).then(s => s.data);

export default api;
