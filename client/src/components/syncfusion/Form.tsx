import React from "react";
import styled from "styled-components";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { useApiFormPost } from "../../hooks/apiClient";
import RequestFeedback from "../RequestFeedback";

const StyledForm = styled.form`
  width: 240px;
  margin: 16px;
`;

type FormProps = {
  label?: string;
  children: React.ReactNode;
  path: string;
  handleResponse: (response: any) => void;
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
  const { error, loading, handleSubmit } = useApiFormPost(
    path,
    extraProps,
    handleResponse
  );
  return (
    <StyledForm onSubmit={handleSubmit} className={className}>
      {children}
      <ButtonComponent isPrimary>{label.toUpperCase()}</ButtonComponent>
      <RequestFeedback error={error} loading={loading} />
    </StyledForm>
  );
};

export default Form;
