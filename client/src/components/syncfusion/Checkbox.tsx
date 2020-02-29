import React from "react";
import { CheckBoxComponent } from "@syncfusion/ej2-react-buttons";

type CheckboxProps = {
  name: string;
  label: string;
  value: string;
  checked: boolean;
};

const Checkbox = ({ name, label, value, checked }: CheckboxProps) => (
  <div>
    <CheckBoxComponent
      name={name}
      value={value}
      label={label}
      checked={checked}
    />
  </div>
);

export default Checkbox;
