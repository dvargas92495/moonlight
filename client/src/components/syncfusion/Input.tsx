import React from "react";
import styled from "styled-components";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-inputs/styles/material.css";

type InputProps = {
  type?: string;
  placeholder: string;
  name?: string;
  defaultValue?: string;
};

const StyledInput = styled.input`
  width: 180px;
  margin-left: 5px;
`;

const Input = ({
  type = "text",
  placeholder,
  name,
  defaultValue = ""
}: InputProps) => (
  <div>
    <StyledInput
      type={type}
      placeholder={placeholder}
      name={name}
      className="e-input e-field"
      defaultValue={defaultValue}
    />
  </div>
);

export default Input;
