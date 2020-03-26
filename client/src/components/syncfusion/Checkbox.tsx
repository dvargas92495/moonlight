import React, { InputHTMLAttributes, useState, useEffect } from "react";
import styled from "styled-components";
import {
  CONTENT_COLOR,
  PRIMARY_BACKGROUND_COLOR,
  PRIMARY_COLOR,
} from "../../styles/colors";

const StyledCheckbox = styled.input`
  cursor: pointer;
`;

const Label = styled.span`
  color: ${CONTENT_COLOR};
`;

const Checkbox = ({
  name,
  label,
  value,
  defaultChecked,
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) => {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setChecked(!!defaultChecked);
  }, [defaultChecked, setChecked]);
  return (
    <div>
      <StyledCheckbox
        name={name}
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <Label>{label}</Label>
    </div>
  );
};

export default Checkbox;
