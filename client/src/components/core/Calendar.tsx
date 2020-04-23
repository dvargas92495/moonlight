import React, { useState, useCallback } from "react";
import styled from "styled-components";
import {
  CONTENT_COLOR,
  QUARTER_OPAQUE,
  SECONDARY_BACKGROUND_COLOR,
} from "../../styles/colors";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  startOfWeek,
} from "date-fns";
import Icon from "./Icon";
import { map } from "lodash";

enum View {
  MONTH,
  YEAR,
  DECADE,
}

const CalendarContainer = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  z-index: 2000;
  background: white;
`;

const ViewContainer = styled.div`
  background: ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
`;

const MonthHeader = styled.div`
  height: 40px;
  padding: 10px 10px 0 10px;
`;

const PickYear = styled.div`
  cursor: pointer;
  color: ${SECONDARY_BACKGROUND_COLOR};
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
`;

const MonthContent = styled.div`
  user-select: none;
`;

const MonthFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 10px 10px 10px;
  text-align: center;
  width: 100%;
`;

const TodayButton = styled.button`
  padding: 8px;
  height: 100%;
  align-self: center;
  background: transparent;
  color: ${SECONDARY_BACKGROUND_COLOR};
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: ${`${CONTENT_COLOR}`};
  }
`;

const MonthView = ({
  value,
  setValue,
  onChange,
  setCurrentView,
}: {
  value: Date;
  setValue: (val: Date) => void;
  onChange: (val: Date) => void;
  setCurrentView: (v: View) => void;
}) => {
  const pickYear = useCallback(() => setCurrentView(View.YEAR), [
    setCurrentView,
  ]);
  const start = startOfWeek(startOfMonth(value));
  const end = endOfWeek(endOfMonth(value));
  return (
    <ViewContainer>
      <MonthHeader>
        <PickYear onClick={pickYear}>{format(value, "MMMM yyyy")}</PickYear>
        <Icon type={"UP"} onClick={() => setValue(subMonths(value, 1))} />
        <Icon type={"DOWN"} onClick={() => setValue(addMonths(value, 1))} />
      </MonthHeader>
      <MonthContent>
        <table>
          <thead>
            <tr>
              {map(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], (h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span title="Sunday, March 29, 2020">29</span>
              </td>
            </tr>
          </tbody>
        </table>
      </MonthContent>
      <MonthFooter>
        <TodayButton onClick={() => onChange(new Date())}></TodayButton>
      </MonthFooter>
    </ViewContainer>
  );
};

const YearHeader = styled.div`
  height: 40px;
`;

const YearContent = styled.div``;

const YearView = () => <div />;

const DecadeView = () => <div />;

const Calendar = ({
  value,
  onChange,
  top,
  left,
}: {
  value: Date;
  onChange: (val: Date) => void;
  top: number;
  left: number;
}) => {
  const [calendarValue, setCalendarValue] = useState(value);
  const [currentView, setCurrentView] = useState(View.MONTH);
  return (
    <CalendarContainer top={top} left={left}>
      {currentView === View.MONTH && (
        <MonthView
          onChange={onChange}
          setCurrentView={setCurrentView}
          value={calendarValue}
          setValue={setCalendarValue}
        />
      )}
      {currentView === View.YEAR && <YearView />}
      {currentView === View.DECADE && <DecadeView />}
    </CalendarContainer>
  );
};

export default Calendar;
