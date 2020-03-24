import React, { HTMLAttributes } from "react";
import styled from "styled-components";
import { CONTENT_COLOR } from "../styles/colors";

const LoadingSpan = styled.span`
  color: ${CONTENT_COLOR};
`;

const ErrorSpan = styled.span`
  color: red;
`;

type RequestFeedbackProps = HTMLAttributes<HTMLDivElement> & {
  error: string;
  loading: boolean;
};

const RequestFeedback = ({
  error,
  loading,
  className
}: RequestFeedbackProps) => (
  <div className={className}>
    {loading && <LoadingSpan>Loading...</LoadingSpan>}
    {error && <ErrorSpan>{error}</ErrorSpan>}
  </div>
);

export default RequestFeedback;
