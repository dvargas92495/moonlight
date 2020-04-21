import React from "react";
import { BsTrashFill, BsX } from "react-icons/bs";
import styled from "styled-components";
import {
  CONTENT_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  HALF_OPAQUE,
} from "../../styles/colors";

export const IconType = {
  DELETE: <BsTrashFill />,
  CANCEL: <BsX />,
};

const IconButton = styled.button`
  background: transparent;
  color: ${CONTENT_COLOR};
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: ${`${SECONDARY_BACKGROUND_COLOR}${HALF_OPAQUE}`};
    border-radius: 100%;
  }
`;

const Icon = ({
  type,
  onClick,
}: {
  type: keyof typeof IconType;
  onClick: (event: React.MouseEvent) => void;
}) => {
  return <IconButton onClick={onClick}>{IconType[type]}</IconButton>;
};

export default Icon;
