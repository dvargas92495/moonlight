import React from "react";
import {
  BsTrashFill,
  BsX,
  BsCalendarFill,
  BsChevronUp,
  BsChevronDown,
  BsDownload,
  BsChevronRight,
  BsChevronLeft,
} from "react-icons/bs";
import styled from "styled-components";
import {
  SECONDARY_BACKGROUND_COLOR,
  HALF_OPAQUE,
  CONTENT_COLOR,
} from "../../styles/colors";

export const IconType = {
  DELETE: <BsTrashFill />,
  CANCEL: <BsX />,
  DATE: <BsCalendarFill />,
  UP: <BsChevronUp strokeWidth={3} />,
  DOWN: <BsChevronDown strokeWidth={3} />,
  LEFT: <BsChevronLeft strokeWidth={3} />,
  RIGHT: <BsChevronRight strokeWidth={3} />,
  DOWNLOAD: <BsDownload />,
};

const IconButton = styled.button<{ color: string }>`
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  color: ${(props) => props.color};

  &:hover {
    background: ${(props) =>
      !props.disabled && `${SECONDARY_BACKGROUND_COLOR}${HALF_OPAQUE}`};
    border-radius: 100%;
  }
`;

const Icon = ({
  type,
  color = CONTENT_COLOR,
  onClick,
  disabled = false,
}: {
  type: keyof typeof IconType;
  color?: string;
  onClick: (event: React.MouseEvent) => void;
  disabled?: boolean;
}) => {
  return (
    <IconButton
      type={"button"}
      onClick={onClick}
      color={color}
      disabled={disabled}
    >
      {IconType[type]}
    </IconButton>
  );
};

export default Icon;
