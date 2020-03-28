import React, { useState } from "react";
import { CalendarComponent } from "@syncfusion/ej2-react-calendars";
import styled from "styled-components";
import { CONTENT_COLOR, PRIMARY_COLOR } from "../../styles/colors";
import { format } from "date-fns";
import Overlay from "./Overlay";

const Container = styled.div`
  border-color: ${CONTENT_COLOR};
  border-width: 0 0 2px;
  border-style: solid;
  padding: 4px 0;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;

  &:focus-within {
    border-color: ${PRIMARY_COLOR};
  }
`;

const DateInput = styled.input`
  background: transparent;
  color: ${CONTENT_COLOR};
  outline: none;
  border-width: 0;
  display: flex;

  ::placeholder {
    opacity: 0.5;
  }
`;

const DateIcon = styled.span`
  &&& {
    margin: 0;
    min-height: 0;
    min-width: 0;
  }
`;

const CalendarContainer = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  z-index: 2000;

  && {
    min-width: 0;
    max-width: 0;
  }
`;

const calculateOffset = (el: HTMLElement | null) => {
  let top = 0;
  let left = 0;
  let currentEl = el;
  while (currentEl) {
    top += currentEl.offsetTop;
    left += currentEl.offsetLeft;
    currentEl = currentEl.parentElement;
  }
  return { top, left };
};

const DatePicker = ({
  placeholder,
  displayFormat,
  name,
}: {
  placeholder: string;
  displayFormat: string;
  name: string;
}) => {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  return (
    <Container>
      <DateInput
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <DateIcon
        className="e-input-group-icon e-date-icon e-icons"
        onClick={(e) => {
          const { top, left } = calculateOffset(
            (e.target as HTMLElement).parentElement
          );
          setTop(top);
          setLeft(left);
          setIsOpen(true);
        }}
      />
      {isOpen && (
        <Overlay isOpen={isOpen} closePortal={() => setIsOpen(false)}>
          <CalendarContainer
            top={top}
            left={left}
            className="e-quick-popup-wrapper"
          >
            <CalendarComponent
              value={new Date(value)}
              change={(e) => {
                if (e?.value) {
                  setValue(format(e?.value, displayFormat));
                  setIsOpen(false);
                }
              }}
            />
          </CalendarContainer>
        </Overlay>
      )}
    </Container>
  );
};

export default DatePicker;
