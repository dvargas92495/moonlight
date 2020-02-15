import React, { useCallback, useState } from "react";
import styled from "styled-components";

const LoadingSpan = styled.span`
  color: gray;
`;

const ErrorSpan = styled.span`
  color: red;
`;

type SaveButtonProps = {
  apiCall: () => Promise<void>;
};

const SaveButton = ({ apiCall }: SaveButtonProps) => {
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
      <button onClick={onClick}>SAVE</button>
      {loading && <LoadingSpan>Loading...</LoadingSpan>}
      {error && <ErrorSpan>{error}</ErrorSpan>}
    </>
  );
};

export default SaveButton;
