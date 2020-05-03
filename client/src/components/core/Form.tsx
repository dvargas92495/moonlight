import React, { useCallback, useState, Ref } from "react";
import styled from "styled-components";
import Select from "react-select";
import { useApiPost } from "../../hooks/apiClient";
import RequestFeedback from "../RequestFeedback";
import Button from "./Button";
import { map, reduce, join, omit, filter } from "lodash";
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
  TIME,
  CHECKBOXES,
}

export type Field = {
  placeholder: string;
  name: string;
  type: FieldType;
  required?: boolean;
  values?: string[];
  ref?: Ref<HTMLDivElement>;
  skip?: boolean;
  onChange?: (value: string) => void;
  defaultValue?: string;
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
  onValidate?: (data: any) => string[];
};

const Form = ({
  label = "save",
  children,
  path,
  handleResponse,
  className,
  extraProps = {},
  fields = [],
  onValidate = () => [],
  width = 240,
}: FormProps) => {
  const [uiError, setUiError] = useState("");
  const { error, loading, handleSubmit } = useApiPost(path, handleResponse);
  const onSubmit = useCallback(
    (event) => {
      const formData = new FormData(event.target);
      const fieldsRequest = reduce(
        fields,
        (acc, f) => {
          if (f.type === FieldType.CHECKBOX) {
            return { ...acc, [f.name]: formData.has(f.name) };
          } else if (
            f.type === FieldType.PASSWORD ||
            f.type === FieldType.TEXT ||
            f.type === FieldType.TIME ||
            f.type === FieldType.DATE ||
            f.type === FieldType.DROPDOWN
          ) {
            return { ...acc, [f.name]: formData.get(f.name) };
          } else if (f.type === FieldType.CHECKBOXES) {
            return { ...acc, [f.name]: formData.getAll(f.name) };
          }
          return acc;
        },
        {}
      ) as { [key: string]: string | string[] | boolean };
      const errors = map(
        filter(fields, (f) => f.required && !fieldsRequest[f.name]) as Field[],
        (f: Field) => `Missing Required Field - ${f.placeholder}`
      );
      errors.push(...onValidate(fieldsRequest));
      if (errors.length === 0) {
        setUiError("");
        const omitFieldsFromRequest = map(
          filter(fields, { skip: true }),
          "name"
        );
        handleSubmit({
          ...extraProps,
          ...omit(fieldsRequest, omitFieldsFromRequest),
        });
      } else {
        setUiError(join(errors, ", "));
      }
      event.preventDefault();
    },
    [extraProps, handleSubmit, setUiError, fields, onValidate]
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
                onChange={(e) =>
                  field.onChange && field.onChange(e.target.value)
                }
                defaultValue={field.defaultValue}
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
          case FieldType.CHECKBOXES:
            const defaultValues = JSON.parse(field.defaultValue || "[]");
            return (
              <div key={field.name}>
                {map(field.values, (d, i) => (
                  <Checkbox
                    label={d}
                    key={i}
                    name={field.name}
                    value={i.toString()}
                    defaultChecked={defaultValues[i]}
                  />
                ))}
              </div>
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
                displayFormat="MM/dd/yyyy"
                name={field.name}
                key={field.name}
                ref={field.ref}
              />
            );
          case FieldType.TIME:
            return (
              <Input
                type={"time"}
                placeholder={field.placeholder}
                name={field.name}
                key={field.name}
                defaultValue={field.defaultValue}
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
