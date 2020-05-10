import React from "react";
import { BsCalendarFill } from "react-icons/bs";
import { format } from "date-fns";
import styled from "styled-components";

const Container = styled.div`
  margin: 12px 0;
`;

const DateRange = ({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) => {
  return (
    <Container>
      <BsCalendarFill />
      <span>
        {`${format(startTime, "MMMM dd, yyyy hh:mm a")} - ${format(
          endTime,
          "hh:mm a MMMM dd, yyyy"
        )})`}
      </span>
    </Container>
  );
};

export default DateRange;
