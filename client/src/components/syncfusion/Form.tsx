import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { apiPost } from "../../awsClients/apiClient";
import { reduce } from "lodash";

const LoadingSpan = styled.span`
  color: gray;
`;

const ErrorSpan = styled.span`
  color: red;
`;

const StyledForm = styled.form`
  width: 240px;
  margin: 16px;
`;

type FormProps = {
  label?: string;
  children: React.ReactNode;
  path: string;
  handleResponse: (response: Object) => void;
  className?: string;
  extraProps?: object;
};

const Form = ({
  label = "save",
  children,
  path,
  handleResponse,
  className,
  extraProps = {}
}: FormProps) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      setError("");
      apiPost(path, {
        ...request,
        ...extraProps
      })
        .then(handleResponse)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
      event.preventDefault();
    },
    [path, extraProps, handleResponse, setError, setLoading]
  );
  return (
    <StyledForm onSubmit={handleSubmit} className={className}>
      {children}
      <ButtonComponent isPrimary>{label.toUpperCase()}</ButtonComponent>
      {loading && <LoadingSpan>Loading...</LoadingSpan>}
      {error && <ErrorSpan>{error}</ErrorSpan>}
    </StyledForm>
  );
};

export default Form;
