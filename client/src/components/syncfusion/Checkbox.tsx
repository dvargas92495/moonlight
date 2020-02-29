import React from "react";
import styled from "styled-components";
import { CheckBoxComponent } from "@syncfusion/ej2-react-buttons";

type CheckboxProps = {
  name: string;
  label: string;
  value: string;
  checked: boolean;
};

const Container = styled.div`
  display: inline-block;
`;

const Checkbox = ({ name, label, value, checked }: CheckboxProps) => (
  <Container>
    <CheckBoxComponent
      name={name}
      value={value}
      label={label}
      checked={checked}
    />
  </Container>
);

export default Checkbox;
