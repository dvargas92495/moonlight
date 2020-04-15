import React, { useState, useEffect } from "react";
import { FileProps } from "./FileInput";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import { api } from "../../hooks/apiClient";
import styled from "styled-components";
import {
  CONTENT_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  HALF_OPAQUE,
  THREE_QUARTER_OPAQUE,
} from "../../styles/colors";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { TiArrowSortedDown } from "react-icons/ti";
import { map, values, filter } from "lodash";

enum View {
  TODAY,
  DAY,
  WEEK,
  MONTH,
}

type PatientInfo = {
  forms: FileProps[];
  identifiers: { [key: string]: string };
  dateOfBirth: string;
};

type EventObject = {
  Id: number;
  userId: number;
  CreatedBy: number;
  Subject: string;
  IsReadonly: boolean;
  IsPending: boolean;
  Patients: { [id: number]: PatientInfo };
  fullName: string;

  StartTime: Date;
  EndTime: Date;
};

const getScheduleBounds = (currentDate: Date, currentView: View) => {
  switch (currentView) {
    case View.TODAY:
    case View.DAY:
      return {
        startTime: startOfDay(currentDate),
        endTime: endOfDay(currentDate),
      };
    case View.WEEK:
      return {
        startTime: startOfWeek(currentDate),
        endTime: endOfWeek(currentDate),
      };
    case View.MONTH:
      return {
        startTime: startOfMonth(currentDate),
        endTime: endOfMonth(currentDate),
      };
    default:
      throw new Error(`Unknown Current View: ${currentView}`);
  }
};

const Container = styled.div`
  border: 1px solid ${CONTENT_COLOR};
  width: 100%;
  background: white;
`;

const ToolbarContainer = styled.div`
  min-height: 45px;
  padding-bottom: 3px;
  background: ${`${SECONDARY_BACKGROUND_COLOR}${THREE_QUARTER_OPAQUE}`};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${CONTENT_COLOR};
`;

const ToolbarButton = styled.button`
  padding: 8px;
  height: 100%;
  align-self: center;
  background: transparent;
  color: ${CONTENT_COLOR};
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: ${`${SECONDARY_BACKGROUND_COLOR}`};
  }
`;

const ToolbarIcon = styled(ToolbarButton)`
  &:hover {
    border-radius: 100%;
  }
`;

const TimeToolbarButton = styled(ToolbarButton)`
  text-transform: capitalize;
`;

const CalendarTable = styled.table`
  table-layout: fixed;
  width: 100%;
  background: ${`${SECONDARY_BACKGROUND_COLOR}${HALF_OPAQUE}`};
`;

const TimeCell = styled.td`
  max-width: 85px;
`;

const WeekView = () => {
  return (
    <CalendarTable>
      <tbody>
        <tr>
          <TimeCell />
        </tr>
        <tr></tr>
      </tbody>
    </CalendarTable>
  );
};

const Schedule = ({
  userId,
  viewUserId,
}: {
  userId: number;
  viewUserId: number;
}) => {
  const personal = userId === viewUserId;

  const [workHours, setWorkHours] = useState({
    start: "09:00",
    end: "17:00",
    days: [1, 2, 3, 4, 5],
  });
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [dataSource, setDataSource] = useState<EventObject[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(View.WEEK);

  /*
    const actionBegin = useCallback(
      ({ requestType, ...rest }) => {
        switch (requestType) {
          case "eventCreate":
            const { addedRecords } = rest;
            const { Subject, StartTime, EndTime, isWeekly } = addedRecords[0];
            api.post("events", {
              userId,
              createdBy: viewUserId,
              Subject,
              StartTime,
              EndTime,
              isWeekly,
            });
            break;
          case "eventRemove":
            const { deletedRecords, changedRecords } = rest;
            const removedRecords = [...deletedRecords, ...changedRecords];
            const { Id } = removedRecords[0];
            api.delete(`events/${Id}`);
            break;
          default:
            console.log(requestType, rest);
        }
      },
      [userId, viewUserId]
    );
    const navigating = useCallback(
      ({ action, currentDate, currentView }) => {
        if (action === "date") {
          setCurrentDate(currentDate);
        } else if (action === "view") {
          setCurrentView(currentView);
        }
      },
      [setCurrentDate, setCurrentView]
    );
    */

  useEffect(() => {
    const { startTime, endTime } = getScheduleBounds(currentDate, currentView);
    api
      .get("events", {
        params: {
          userId,
          viewUserId,
          startTime: startTime.toJSON(),
          endTime: endTime.toJSON(),
        },
      })
      .then((e) => setDataSource(e.data));
  }, [userId, viewUserId, currentDate, currentView, setDataSource]);

  useEffect(() => {
    api
      .get("availability", { params: { userId } })
      .then((a) =>
        setWorkHours({
          start: a.data.workHoursStart,
          end: a.data.workHoursEnd,
          days: a.data.workDays,
        })
      )
      .finally(() => setLoadingSchedule(false));
  }, [setWorkHours, setLoadingSchedule]);
  return (
    <Container>
      {loadingSchedule ? (
        <div>Loading...</div>
      ) : (
        <>
          <ToolbarContainer>
            <div>
              <ToolbarIcon>
                <BsChevronLeft strokeWidth={3} />
              </ToolbarIcon>
              <ToolbarIcon>
                <BsChevronRight strokeWidth={3} />
              </ToolbarIcon>
              <ToolbarButton>
                {format(currentDate, "MMM dd, yyyy")}
                <TiArrowSortedDown />
              </ToolbarButton>
            </div>
            <div>
              {map(filter(values(View), isNaN), (v) => (
                <TimeToolbarButton
                  key={v as View}
                  onClick={() => setCurrentView(v as View)}
                >
                  {v}
                </TimeToolbarButton>
              ))}
            </div>
          </ToolbarContainer>
          <div>{currentView === View.WEEK && <WeekView />}</div>
        </>
      )}
    </Container>
  );
};

export default Schedule;
