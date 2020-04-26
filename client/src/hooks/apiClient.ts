import axios from "axios";
import { noop } from "lodash";
import { useState, useCallback } from "react";

const authorizationToken = localStorage.getItem("Authorization");

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_GATEWAY_INVOKE_URL,
  headers: authorizationToken
    ? {
        Authorization: authorizationToken,
      }
    : {},
});

export const setAuth = (idToken: string) => {
  localStorage.setItem("Authorization", idToken);
  api.defaults.headers.common["Authorization"] = idToken;
};

export const clearAuth = () => {
  localStorage.removeItem("Authorization");
  api.defaults.headers.common["Authorization"] = null;
};

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
        return apiMethod(request)
          .then((response) => {
            setLoading(false);
            onSuccess(response.data);
          })
          .catch((e) => {
            setLoading(false);
            setError(e.response?.data?.message || e.message);
          });
      },
    }),
    [apiMethod, error, loading, setError, setLoading]
  );
  return callback;
};

export const useApiPost = (url: string, onSuccess?: (response: any) => void) =>
  useApi((request) => api.post(url, request))(onSuccess);

export const useApiDelete = (
  url: string,
  onSuccess?: (response: any) => void
) => useApi((request) => api.delete(`${url}/${request}`))(onSuccess);

export const getProfile = (userId: number) =>
  api.get("profile", { params: { userId } }).then((s) => s.data);

export const getAvailablity = (userId: number) =>
  api.get("availability", { params: { userId } }).then((s) => s.data);

export const getSpecialistViews = (userId: number) =>
  api.get("specialist-views", { params: { userId } }).then((s) => s.data);

type GetEventsRequest = {
  userId: number;
  viewUserId: number;
  startTime: string;
  endTime: string;
};
export const getEvents = (params: GetEventsRequest) =>
  api.get("events", { params }).then((s) => s.data);

export default api;
