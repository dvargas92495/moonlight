import React, { useCallback, useState, Ref } from "react";
import styled from "styled-components";
import Select from "react-select";
import { useApiPost } from "../../hooks/apiClient";
import RequestFeedback from "../RequestFeedback";
import Button from "./Button";
import { map, reduce, find, join, omit, filter } from "lodash";
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
  skip?: boolean;
  onChange?: (value: string) => void;
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
      const data: { [key: string]: FormDataEntryValue[] } = {};
      const errors: string[] = [];
      formData.forEach((v, k) => {
        const field = find(fields, { name: k });
        if (!v && field?.required) {
          errors.push(`Missing Required Field - ${field.placeholder}`);
        } else if (data[k]) {
          data[k].push(v);
        } else {
          data[k] = [v];
        }
      });
      const fieldsRequest = reduce(
        fields,
        (acc, f) => {
          if (f.type === FieldType.CHECKBOX) {
            return { ...acc, [f.name]: formData.has(f.name) };
          } else if (
            f.type === FieldType.PASSWORD ||
            f.type === FieldType.TEXT
          ) {
            return { ...acc, [f.name]: formData.get(f.name) };
          }
          return acc;
        },
        {}
      );
      errors.push(...onValidate(fieldsRequest));
      if (errors.length === 0) {
        setUiError("");
        const omitFieldsFromRequest = map(
          filter(fields, { skip: true }),
          "name"
        );
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
                displayFormat="MM/dd/yyyy"
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
