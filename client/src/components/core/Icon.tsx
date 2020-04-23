import React from "react";
import {
  BsTrashFill,
  BsX,
  BsCalendarFill,
  BsChevronUp,
  BsChevronDown,
} from "react-icons/bs";
import styled from "styled-components";
import {
  CONTENT_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  HALF_OPAQUE,
} from "../../styles/colors";

export const IconType = {
  DELETE: <BsTrashFill />,
  CANCEL: <BsX />,
  DATE: <BsCalendarFill />,
  UP: <BsChevronUp strokeWidth={3} />,
  DOWN: <BsChevronDown strokeWidth={3} />,
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
  return (
    <IconButton type={"button"} onClick={onClick}>
      {IconType[type]}
    </IconButton>
  );
};

export default Icon;