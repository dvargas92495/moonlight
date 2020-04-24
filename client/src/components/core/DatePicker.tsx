import React, { useState } from "react";
import styled from "styled-components";
import { CONTENT_COLOR, PRIMARY_COLOR } from "../../styles/colors";
import { format } from "date-fns";
import Overlay from "./Overlay";
import Icon from "./Icon";
import Calendar from "./Calendar";

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

const DatePicker = React.forwardRef<
  HTMLDivElement,
  {
    placeholder: string;
    displayFormat: string;
    name: string;
  }
>(({ placeholder, displayFormat, name }, ref) => {
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
      <Icon
        type={"DATE"}
        onClick={(e) => {
          const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
          setTop(x);
          setLeft(y);
          setIsOpen(true);
        }}
      />
      <Overlay isOpen={isOpen} closePortal={() => setIsOpen(false)}>
        <Calendar
          top={top}
          left={left}
          ref={ref}
          value={value === "" ? new Date() : new Date(value)}
          onChange={(v) => {
            if (v) {
              setValue(format(v, displayFormat));
              setIsOpen(false);
            }
          }}
        />
      </Overlay>
    </Container>
  );
});

export default DatePicker;
