import React, { InputHTMLAttributes, useState, useEffect } from "react";
import styled from "styled-components";

const StyledCheckbox = styled.input`
  cursor: pointer;
`;

const Checkbox = ({
  name,
  label,
  value,
  defaultChecked,
  className,
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
        className={className}
        id={label}
      />
      <label htmlFor={label}>{label}</label>
    </div>
  );
};

export default Checkbox;
