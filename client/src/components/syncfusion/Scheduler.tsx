import React, { useCallback, useState, useEffect } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from "date-fns";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import {
  ScheduleComponent,
  Day,
  Week,
  Month,
  Inject,
  ViewsDirective,
  ViewDirective
} from "@syncfusion/ej2-react-schedule";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-calendars/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-react-schedule/styles/material.css";
import { createEvent, getEvents } from "../../awsClients/apiClient";
import { map } from "lodash";

type QuickInfoProps = {
  elementType: string;
};

type QuickInfoTemplatesContentProps = QuickInfoProps & {
  StartTime: Date;
  EndTime: Date;
};

export type AvailabilityProps = {
  userId: number;
  workHoursStart: string;
  workHoursEnd: string;
  workDays: number[];
};

type SchedulerProps = AvailabilityProps & {
  viewUserId: number;
};

/**
 * Syncfusion has a weird issue with type casting and Quick info templates
 */
const QuickInfoTemplatesContent: any = ({
  StartTime,
  EndTime,
  elementType
}: QuickInfoTemplatesContentProps) =>
  elementType === "cell" && (
    <>
      <div>TYPE</div>
      <DropDownListComponent
        dataSource={[
          { text: "Request Booking", value: "REQUEST_BOOKING" },
          { text: "Other", value: "OTHER" }
        ]}
        name="Subject"
        className="e-field"
      />
      <div className="e-date-time">
        <div className="e-date-time-icon e-icons" />
        <div>{`${format(StartTime, "MMMM dd, yyyy")} (${format(
          StartTime,
          "HH:mm"
        )} - ${format(EndTime, "HH:mm")})`}</div>
      </div>
    </>
  );

const QuickInfoTemplatesFooter: any = ({ elementType }: QuickInfoProps) =>
  elementType === "cell" && (
    <button
      className="e-event-create e-text-ellipsis e-control e-btn e-lib e-flat e-primary"
      title="Save"
    >
      Save
    </button>
  );

const getScheduleBounds = (currentDate: Date, currentView: string) => {
  if (currentView === "Day") {
    return {
      startTime: startOfDay(currentDate),
      endTime: endOfDay(currentDate)
    };
  } else if (currentView === "Week") {
    return {
      startTime: startOfWeek(currentDate),
      endTime: endOfWeek(currentDate)
    };
  } else if (currentView === "Month") {
    return {
      startTime: startOfMonth(currentDate),
      endTime: endOfMonth(currentDate)
    };
  } else {
    throw new Error(`Unknown Current View: ${currentView}`);
  }
};

const Scheduler = ({
  userId,
  viewUserId,
  workHoursStart,
  workHoursEnd,
  workDays
}: SchedulerProps) => {
  const personal = userId === viewUserId;
  const [dataSource, setDataSource] = useState<Object[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("Week");
  const actionBegin = useCallback(
    ({ requestType, ...rest }) => {
      switch (requestType) {
        case "eventCreate":
          const { addedRecords } = rest;
          const { Subject, StartTime, EndTime } = addedRecords[0];
          createEvent({
            userId,
            createdBy: viewUserId,
            Subject,
            StartTime,
            EndTime
          });
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
  useEffect(() => {
    const { startTime, endTime } = getScheduleBounds(currentDate, currentView);
    getEvents({
      userId,
      viewUserId,
      startTime: startTime.toJSON(),
      endTime: endTime.toJSON()
    }).then(events =>
      setDataSource(map(events, e => ({ ...e, IsReadonly: e.isReadonly })))
    );
  }, [userId, viewUserId, currentDate, currentView, setDataSource]);
  return (
    <ScheduleComponent
      workHours={{ start: workHoursStart, end: workHoursEnd }}
      workDays={workDays}
      startHour="06:00"
      endHour="21:00"
      height="100%"
      timeScale={{ slotCount: 1 }}
      quickInfoTemplates={
        personal
          ? {}
          : {
              content: QuickInfoTemplatesContent,
              footer: QuickInfoTemplatesFooter
            }
      }
      actionBegin={actionBegin}
      navigating={navigating}
      eventSettings={{ dataSource }}
    >
      <ViewsDirective>
        {personal && <ViewDirective option="Day" />}
        <ViewDirective option="Week" />
        {personal && <ViewDirective option="Month" />}
      </ViewsDirective>
      <Inject services={personal ? [Day, Week, Month] : [Week]} />
    </ScheduleComponent>
  );
};

export default Scheduler;
