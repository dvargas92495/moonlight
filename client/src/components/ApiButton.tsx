import React, { useCallback, useState } from "react";
import styled from "styled-components";

const LoadingSpan = styled.span`
  color: gray;
`;

const ErrorSpan = styled.span`
  color: red;
`;

type ApiButtonProps = {
  apiCall: () => Promise<void>;
  label?: string;
};

const ApiButton = ({ apiCall, label = "save" }: ApiButtonProps) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const onClick = useCallback(() => {
    setLoading(true);
    setError("");
    apiCall()
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [apiCall, setError, setLoading]);
  return (
    <>
      <button onClick={onClick}>{label.toUpperCase()}</button>
      {loading && <LoadingSpan>Loading...</LoadingSpan>}
      {error && <ErrorSpan>{error}</ErrorSpan>}
    </>
  );
};

export default ApiButton;
