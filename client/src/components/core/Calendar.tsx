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
  startOfWeek,
  addWeeks,
  subYears,
  addYears,
  startOfYear,
  startOfDecade,
  differenceInWeeks,
  addDays,
  endOfDecade,
} from "date-fns";
import Icon from "./Icon";
import { map, range } from "lodash";

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

const Header = styled.div`
  height: 40px;
  padding: 10px 10px 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SwitchView = styled.div`
  cursor: pointer;
  color: ${SECONDARY_BACKGROUND_COLOR};
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
`;

const Content = styled.div`
  user-select: none;
  padding: 10px;
`;

const CalendarCell = styled.span`
  font-size: 13px;
  font-weight: normal;
  height: 30px;
  line-height: 30px;
  width: 30px;
  cursor: pointer;

  &:hover {
    background: ${CONTENT_COLOR};
    border-radius: 100%;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 10px 10px 10px;
  text-align: center;
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

const Footer = ({ onChange }: { onChange: (d: Date) => void }) => (
  <FooterContainer>
    <TodayButton onClick={() => onChange(new Date())}>TODAY</TodayButton>
  </FooterContainer>
);

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
  const end = startOfWeek(endOfMonth(value));
  const numWeeks = differenceInWeeks(end, start) + 1;
  return (
    <ViewContainer>
      <Header>
        <SwitchView onClick={pickYear}>{format(value, "MMMM yyyy")}</SwitchView>
        <div>
          <Icon type={"UP"} onClick={() => setValue(subMonths(value, 1))} />
          <Icon type={"DOWN"} onClick={() => setValue(addMonths(value, 1))} />
        </div>
      </Header>
      <Content>
        <table>
          <thead>
            <tr>
              {map(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], (h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {map(range(numWeeks), (w) => {
              return (
                <tr key={w}>
                  {map(range(7), (d) => {
                    const calendarDate = addDays(addWeeks(start, w), d);
                    return (
                      <td
                        onClick={() => onChange(calendarDate)}
                        key={calendarDate.valueOf()}
                      >
                        <CalendarCell
                          title={format(calendarDate, "EEEE, MMMM d, yyyy")}
                        >
                          {format(calendarDate, "d")}
                        </CalendarCell>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr></tr>
          </tbody>
        </table>
      </Content>
      <Footer onChange={onChange} />
    </ViewContainer>
  );
};

const YearView = ({
  value,
  setValue,
  setCurrentView,
  onChange,
}: {
  value: Date;
  setValue: (d: Date) => void;
  setCurrentView: (v: View) => void;
  onChange: (d: Date) => void;
}) => {
  const pickDecade = useCallback(() => setCurrentView(View.DECADE), [
    setCurrentView,
  ]);
  const start = startOfYear(value);
  return (
    <ViewContainer>
      <Header>
        <SwitchView onClick={pickDecade}>{format(value, "yyyy")}</SwitchView>
        <div>
          <Icon type={"UP"} onClick={() => setValue(subYears(value, 1))} />
          <Icon type={"DOWN"} onClick={() => setValue(addYears(value, 1))} />
        </div>
      </Header>
      <Content>
        <table>
          <tbody>
            {map(range(3), (r) => {
              const offset = 4 * r;
              return (
                <tr key={r}>
                  {map(range(4), (c) => {
                    const calendarDate = addMonths(start, offset + c);
                    return (
                      <td
                        key={calendarDate.valueOf()}
                        onClick={() => {
                          setValue(calendarDate);
                          setCurrentView(View.MONTH);
                        }}
                      >
                        <CalendarCell>
                          {format(calendarDate, "MMM")}
                        </CalendarCell>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Content>
      <Footer onChange={onChange} />
    </ViewContainer>
  );
};

const DecadeView = ({
  value,
  setValue,
  onChange,
  setCurrentView,
}: {
  value: Date;
  setValue: (d: Date) => void;
  onChange: (d: Date) => void;
  setCurrentView: (v: View) => void;
}) => {
  const start = startOfDecade(value);
  const end = endOfDecade(value);
  return (
    <ViewContainer>
      <Header>
        <SwitchView>{`${format(start, "yyyy")} - ${format(
          end,
          "yyyy"
        )}`}</SwitchView>
        <div>
          <Icon type={"UP"} onClick={() => setValue(subYears(value, 10))} />
          <Icon type={"DOWN"} onClick={() => setValue(addYears(value, 10))} />
        </div>
      </Header>
      <Content>
        <table>
          <tbody>
            {map(range(3), (r) => {
              const offset = 4 * r;
              return (
                <tr key={r}>
                  {map(range(4), (c) => {
                    const plusYears = offset + c - 1;
                    const calendarDate = addYears(start, plusYears);
                    if (plusYears < 0 || plusYears > 9) {
                      return <td key={calendarDate.valueOf()} />;
                    }
                    return (
                      <td
                        key={calendarDate.valueOf()}
                        onClick={() => {
                          setValue(calendarDate);
                          setCurrentView(View.YEAR);
                        }}
                      >
                        <CalendarCell>
                          {format(calendarDate, "yyyy")}
                        </CalendarCell>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Content>
      <Footer onChange={onChange} />
    </ViewContainer>
  );
};

const Calendar = React.forwardRef<
  HTMLDivElement,
  {
    value: Date;
    onChange: (val: Date) => void;
    top: number;
    left: number;
  }
>(({ value, onChange, top, left }, ref) => {
  const [calendarValue, setCalendarValue] = useState(value);
  const [currentView, setCurrentView] = useState(View.MONTH);
  return (
    <CalendarContainer top={top} left={left} ref={ref}>
      {currentView === View.MONTH && (
        <MonthView
          onChange={onChange}
          setCurrentView={setCurrentView}
          value={calendarValue}
          setValue={setCalendarValue}
        />
      )}
      {currentView === View.YEAR && (
        <YearView
          onChange={onChange}
          setCurrentView={setCurrentView}
          value={calendarValue}
          setValue={setCalendarValue}
        />
      )}
      {currentView === View.DECADE && (
        <DecadeView
          value={calendarValue}
          setValue={setCalendarValue}
          onChange={onChange}
          setCurrentView={setCurrentView}
        />
      )}
    </CalendarContainer>
  );
});

export default Calendar;
