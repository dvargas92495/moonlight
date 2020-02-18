import React from "react";
import styled from "styled-components";

type InputProps = {
  onChange: (e: string) => void;
  type?: string;
  label: string;
  value: string;
};

const StyledInput = styled.input`
  width: 180px;
  margin-left: 5px;
`;

const Input = ({ onChange, type = "text", label, value }: InputProps) => (
  <div>
    {label && <span>{label}</span>}
    <StyledInput
      onChange={e => onChange(e.target.value)}
      type={type}
      value={value}
    />
  </div>
);

export default Input;
