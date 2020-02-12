import React from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  Month,
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

export type AvailabilityProps = {
  workHoursStart: string;
  workHoursEnd: string;
  workDays: number[];
};

type SchedulerProps = AvailabilityProps & {
  personal?: boolean;
};

const Scheduler = ({
  workHoursStart,
  workHoursEnd,
  workDays,
  personal
}: SchedulerProps) => (
  <ScheduleComponent
    workHours={{ start: workHoursStart, end: workHoursEnd }}
    workDays={workDays}
    startHour="07:00"
    endHour="19:00"
  >
    <Inject services={personal ? [Day, Week, Month] : [Week]} />
  </ScheduleComponent>
);

export default Scheduler;
