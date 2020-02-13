import React from "react";
import styled from "styled-components";

type InputProps = {
  onChange: (v: boolean) => void;
  label?: string;
  checked: boolean;
};

const Container = styled.div`
  display: inline-block;
`;

const Checkbox = ({ onChange, label, checked }: InputProps) => (
  <Container>
    {label && <span>{label}</span>}
    <input
      onClick={() => onChange(!checked)}
      type="checkbox"
      checked={checked}
    />
  </Container>
);

export default Checkbox;
