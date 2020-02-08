import React from "react";

type InputProps = {
  onChange: (v: boolean) => void;
  label?: string;
  checked: boolean;
};

const Checkbox = ({ onChange, label, checked }: InputProps) => (
  <>
    {label && <span>{label}</span>}
    <input
      onClick={() => onChange(!checked)}
      type="checkbox"
      checked={checked}
    />
  </>
);

export default Checkbox;
