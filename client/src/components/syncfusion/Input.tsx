import React from "react";
import styled from "styled-components";
import { CONTENT_COLOR, PRIMARY_COLOR } from "../../styles/colors";

type InputProps = {
  type?: string;
  placeholder: string;
  name?: string;
  defaultValue?: string;
};

const StyledInput = styled.input`
  width: 100%;
  background: transparent;
  border-color: ${CONTENT_COLOR};
  border-width: 0 0 2px;
  border-style: solid;
  color: ${CONTENT_COLOR};
  outline: none;
  padding: 4px 0;
  margin-bottom: 4px;

  &:focus {
    border-color: ${PRIMARY_COLOR};
  }

  ::placeholder {
    opacity: 0.5;
  }
`;

const Input = ({
  type = "text",
  placeholder,
  name,
  defaultValue = "",
}: InputProps) => (
  <div>
    <StyledInput
      type={type}
      placeholder={placeholder}
      name={name}
      defaultValue={defaultValue}
    />
  </div>
);

export default Input;
