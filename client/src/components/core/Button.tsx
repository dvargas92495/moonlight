import React, { ButtonHTMLAttributes } from "react";
import styled from "styled-components";
import {
  SECONDARY_COLOR,
  PRIMARY_BACKGROUND_COLOR,
  CONTENT_COLOR,
  QUARTER_OPAQUE,
} from "../../styles/colors";

const StyledButton = styled.button<{ isPrimary: boolean }>`
  background: ${(props) =>
    props.isPrimary ? PRIMARY_BACKGROUND_COLOR : SECONDARY_COLOR};
  border-color: transparent;
  border: 1px solid
    ${(props) => (props.isPrimary ? PRIMARY_BACKGROUND_COLOR : SECONDARY_COLOR)};
  box-shadow: -2 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  color: ${CONTENT_COLOR};
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px 4px;
  margin: 4px;

  &:hover {
    background: ${(props) =>
        props.isPrimary ? PRIMARY_BACKGROUND_COLOR : SECONDARY_COLOR}
      ${QUARTER_OPAQUE};
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
      0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
  }
`;

const Button = ({
  isPrimary = false,
  type = "submit",
  onClick,
  children,
}: { isPrimary?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <StyledButton isPrimary={isPrimary} type={type} onClick={onClick}>
    {children}
  </StyledButton>
);

export default Button;
