import React from "react";

type InputProps = {
  onChange: (e: string) => void;
  type?: string;
  label: string;
  value: string;
};

const Input = ({ onChange, type = "text", label, value }: InputProps) => (
  <div>
    {label && <span>{label}</span>}
    <input onChange={e => onChange(e.target.value)} type={type} value={value} />
  </div>
);

export default Input;
