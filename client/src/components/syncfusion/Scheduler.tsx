import React from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject
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

type SchedulerProps = {
  workHoursStart: string;
  workHoursEnd: string;
  workDays: number[];
};

const Scheduler = ({
  workHoursStart,
  workHoursEnd,
  workDays
}: SchedulerProps) => (
  <ScheduleComponent
    workHours={{ start: workHoursStart, end: workHoursEnd }}
    workDays={workDays}
    startHour="07:00"
    endHour="19:00"
  >
    <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
  </ScheduleComponent>
);

export default Scheduler;
