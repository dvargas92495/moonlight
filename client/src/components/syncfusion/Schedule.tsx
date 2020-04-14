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
} from "../../styles/colors";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

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

const getScheduleBounds = (currentDate: Date, currentView: string) => {
  if (currentView === "Day") {
    return {
      startTime: startOfDay(currentDate),
      endTime: endOfDay(currentDate),
    };
  } else if (currentView === "Week") {
    return {
      startTime: startOfWeek(currentDate),
      endTime: endOfWeek(currentDate),
    };
  } else if (currentView === "Month") {
    return {
      startTime: startOfMonth(currentDate),
      endTime: endOfMonth(currentDate),
    };
  } else {
    throw new Error(`Unknown Current View: ${currentView}`);
  }
};

const Container = styled.div`
  border: 1px solid ${CONTENT_COLOR};
  width: 100%;
`;

const ToolbarContainer = styled.div`
  min-height: 45px;
  padding-bottom: 3px;
  background: ${SECONDARY_BACKGROUND_COLOR} ${HALF_OPAQUE};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${CONTENT_COLOR};
`;

const IconContainer = styled.div`
  padding: 8px;
`;

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
  const [currentView, setCurrentView] = useState("Week");

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
  return loadingSchedule ? (
    <div>Loading...</div>
  ) : (
    <Container>
      <ToolbarContainer>
        <div>
          <IconContainer>
            <BsChevronLeft />
          </IconContainer>
          <IconContainer>
            <BsChevronRight />
          </IconContainer>
          <IconContainer>
            <button>{format(currentDate, "MMM dd, yyyy")}</button>
          </IconContainer>
        </div>
        <div>Day</div>
      </ToolbarContainer>
      <div>Table</div>
      {JSON.stringify(workHours)}
    </Container>
  );
};

export default Schedule;
