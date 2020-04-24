import React, { useCallback, useState, Ref } from "react";
import styled from "styled-components";
import Select from "react-select";
import { useApiPost } from "../../hooks/apiClient";
import RequestFeedback from "../RequestFeedback";
import Button from "./Button";
import { map, reduce, find, join } from "lodash";
import Input from "./Input";
import Checkbox from "./Checkbox";
import DatePicker from "./DatePicker";

interface StyledFormExtendProps {
  readonly width: number;
}

const StyledForm = styled.form<StyledFormExtendProps>`
  width: ${(props) => props.width}px;
  margin: 16px;
`;

export enum FieldType {
  TEXT,
  PASSWORD,
  CHECKBOX,
  DROPDOWN,
  DATE,
}

export type Field = {
  placeholder: string;
  name: string;
  type: FieldType;
  required?: boolean;
  values?: string[];
  ref?: Ref<HTMLDivElement>;
};

type FormProps = {
  label?: string;
  children?: React.ReactNode;
  path: string;
  handleResponse: (response: any) => void;
  className?: string;
  extraProps?: object;
  fields?: Field[];
  width?: number;
};

const Form = ({
  label = "save",
  children,
  path,
  handleResponse,
  className,
  extraProps = {},
  fields = [],
  width = 240,
}: FormProps) => {
  const [uiError, setUiError] = useState("");
  const { error, loading, handleSubmit } = useApiPost(path, handleResponse);
  const onSubmit = useCallback(
    (event) => {
      const formData = new FormData(event.target);
      const data: { [key: string]: FormDataEntryValue[] } = {};
      const errors: string[] = [];
      formData.forEach((v, k) => {
        const field = find(fields, { name: k });
        if (!v && field?.required) {
          errors.push(field.placeholder);
        } else if (data[k]) {
          data[k].push(v);
        } else {
          data[k] = [v];
        }
      });
      if (errors.length === 0) {
        setUiError("");
        const request = reduce(
          Object.keys(data),
          (acc, k) => ({
            ...acc,
            [k]: data[k].length === 1 ? data[k][0] : data[k],
          }),
          {}
        );
        handleSubmit({
          ...request,
          ...extraProps,
        });
      } else {
        setUiError(`Missing Required Fields: ${join(errors, ", ")}`);
      }
      event.preventDefault();
    },
    [extraProps, handleSubmit, setUiError, fields]
  );
  return (
    <StyledForm onSubmit={onSubmit} className={className} width={width}>
      {map(fields, (field) => {
        switch (field.type) {
          case FieldType.TEXT:
            return (
              <Input
                placeholder={field.placeholder}
                name={field.name}
                key={field.name}
              />
            );
          case FieldType.PASSWORD:
            return (
              <Input
                placeholder={field.placeholder}
                name={field.name}
                type={"password"}
                key={field.name}
              />
            );
          case FieldType.CHECKBOX:
            return (
              <Checkbox
                label={field.placeholder}
                name={field.name}
                key={field.name}
              />
            );
          case FieldType.DROPDOWN:
            return (
              <Select
                placeholder={field.placeholder}
                options={map(field.values, (v) => ({ label: v, value: v }))}
                name={field.name}
                key={field.name}
              />
            );
          case FieldType.DATE:
            return (
              <DatePicker
                placeholder={field.placeholder}
                displayFormat="yyyy/MM/dd"
                name={field.name}
                key={field.name}
                ref={field.ref}
              />
            );
        }
      })}
      {children}
      <Button isPrimary>{label.toUpperCase()}</Button>
      <RequestFeedback error={error || uiError} loading={loading} />
    </StyledForm>
  );
};

export default Form;
