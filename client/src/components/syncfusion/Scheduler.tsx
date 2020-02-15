import React, { useCallback, useState, useEffect } from "react";
import { format } from "date-fns";
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

type QuickInfoProps = {
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
  EndTime
}: QuickInfoProps) => (
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

const QuickInfoTemplatesFooter: any = () => (
  <button
    className="e-event-create e-text-ellipsis e-control e-btn e-lib e-flat e-primary"
    title="Save"
  >
    Save
  </button>
);

const Scheduler = ({
  userId,
  viewUserId,
  workHoursStart,
  workHoursEnd,
  workDays
}: SchedulerProps) => {
  const personal = userId === viewUserId;
  const [dataSource, setDataSource] = useState([]);
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
  useEffect(() => {
    getEvents({
      userId,
      viewUserId,
      startTime: new Date(2020, 2, 9),
      endTime: new Date(2020, 2, 16)
    }).then(events => setDataSource(events));
  }, [userId, viewUserId, setDataSource]);
  return (
    <ScheduleComponent
      workHours={{ start: workHoursStart, end: workHoursEnd }}
      workDays={workDays}
      startHour="07:00"
      endHour="19:00"
      quickInfoTemplates={
        personal
          ? {}
          : {
              content: QuickInfoTemplatesContent,
              footer: QuickInfoTemplatesFooter
            }
      }
      actionBegin={actionBegin}
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
