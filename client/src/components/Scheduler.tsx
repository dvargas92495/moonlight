import React from "react";
import { lastDayOfWeek, subDays, format } from "date-fns";
import { map, range, concat } from "lodash";
import styled from "styled-components";

const Container = styled.div`
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid black;
`;

const ScheduleHeader = styled.div`
  display: flex;
  flex: none;
  border-top: 1px solid gray;
`;

const TimeHeader = styled.div`
  display: flex;
  flex: none;
  min-width: 64px;
`;

const DayHeader = styled.div`
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
  position: relative;
  height: 84px;
`;

const DayCell = styled.div`
  min-width: 84px;
  width: 84px;
  display: flex;
  flex: 1 0 auto;
  border-left: 1px solid gray;
`;

const DayCellValue = styled.h3`
  width: 100%;
  text-align: center;
`;

const DayContent = styled.div`
  flex: 1 1 60%;
  position: relative;
  display: flex;
  overflow: hidden;
`;

const TimeColumn = styled.div`
  flex: none;
  display: flex;
  min-width: 64px;
  flex-direction: column;
`;

const TimeRowHeader = styled.div`
  position: relative;
  height: 48px;
  text-align: right;
  vertical-align: middle;
  width: 100%;
  text-align: center;
  border-top: 1px solid gray;
`;

const HourContainer = styled.div`
  flex: 1 1 auto;
  display: flex;
  position: relative;
`;

const HoursInDayColumn = styled.div`
  min-width: 84px;
  width: 84px;
  display: flex;
  flex: 1 0 auto;
  border-left: 1px solid gray;
  flex-direction: column;
`;

const HourCell = styled.div`
  position: relative;
  height: 48px;
  text-align: right;
  width: 100%;
  border-top: 1px solid gray;
`;

const Scheduler = () => {
  const now = new Date();
  const lastDay = lastDayOfWeek(now, { weekStartsOn: 1 });
  return (
    <Container>
      <header>SCHEDULE</header>
      <ScheduleHeader>
        <TimeHeader>TIME</TimeHeader>
        <DayHeader>
          {map(range(6, -1, -1), index => (
            <DayCell key={index}>
              <DayCellValue>
                {format(subDays(lastDay, index), "EEE MM/dd").toUpperCase()}
              </DayCellValue>
            </DayCell>
          ))}
        </DayHeader>
      </ScheduleHeader>
      <DayContent>
        <TimeColumn>
          {map(["AM", "PM"], (amOrPm, index) =>
            map(concat([12], range(1, 12)), hour => (
              <TimeRowHeader key={index * 12 + hour}>
                {`${hour} ${amOrPm}`}
              </TimeRowHeader>
            ))
          )}
        </TimeColumn>
        <HourContainer>
          {map(range(6, -1, -1), day => (
            <HoursInDayColumn key={day}>
              {map(range(0, 24), hour => (
                <HourCell key={hour + day * 24} />
              ))}
            </HoursInDayColumn>
          ))}
        </HourContainer>
      </DayContent>
    </Container>
  );
};

export default Scheduler;
