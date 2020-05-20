import React, { useState, useEffect, useCallback, ReactInstance } from "react";
import Paper from "@material-ui/core/Paper";
import {
  ViewState,
  AppointmentModel,
  EditingState,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler as DXScheduler,
  DayView,
  Appointments,
  WeekView,
  MonthView,
  ViewSwitcher,
  Toolbar,
  AllDayPanel,
  DateNavigator,
  AppointmentForm,
  EditRecurrenceMenu,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDay,
  getHours,
} from "date-fns";
import api from "../../hooks/apiClient";
import { map, reject, split, includes, omit, noop } from "lodash";
import { FileProps } from "../core/FileInput";
import styled from "styled-components";
import { CONTENT_COLOR, QUARTER_OPAQUE } from "../../styles/colors";
import { compareProps } from "../../hooks/debugHelpers";

const FOCUS_BACKGROUND = "#3f51b526";

type View = "Day" | "Week" | "Month";

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
  RecurrenceRule: string;
  StartTime: string;
  EndTime: string;
};

const StyleCell = (CellComponent: React.FunctionComponent<any>) => styled(
  CellComponent
)<{
  isUnavailable?: boolean;
}>`
  background: ${(props) =>
    props.isUnavailable && `${CONTENT_COLOR}${QUARTER_OPAQUE}`};

  &&:hover {
    background: ${(props) =>
      props.isUnavailable && `${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  }

  &&:focus {
    background: ${(props) =>
      props.isUnavailable && `${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  }
`;

const eventToAppointmentModel = (e: EventObject) => ({
  ...e,
  startDate: new Date(e.StartTime),
  endDate: new Date(e.EndTime),
  rRule: e.RecurrenceRule,
  title: e.Subject,
  id: e.Id,
});

const getScheduleBounds = (currentDate: Date, currentView: View) => {
  switch (currentView) {
    case "Day":
      return {
        startTime: startOfDay(currentDate),
        endTime: endOfDay(currentDate),
      };
    case "Week":
      return {
        startTime: startOfWeek(currentDate),
        endTime: endOfWeek(currentDate),
      };
    case "Month":
      return {
        startTime: startOfMonth(currentDate),
        endTime: endOfMonth(currentDate),
      };
    default:
      throw new Error(`Unknown Current View: ${currentView}`);
  }
};

const DEFAULT_VIEW = "Week";

const DayTimeTableCell = StyleCell(({ isUnavailable, ...props }) => (
  <DayView.TimeTableCell
    {...props}
    onClick={isUnavailable ? noop : props.onDoubleClick}
    onDoubleClick={() => {}}
  />
));

const WeekTimeTableCell = StyleCell(({ isUnavailable, ...props }) => (
  <WeekView.TimeTableCell
    {...props}
    onClick={isUnavailable ? noop : props.onDoubleClick}
    onDoubleClick={() => {}}
  />
));

const MonthTimeTableCell = (props: MonthView.TimeTableCellProps) => (
  <MonthView.TimeTableCell onClick={props.onDoubleClick} {...props} />
);

const AllDayPanelCell = (props: AllDayPanel.CellProps) => (
  <AllDayPanel.Cell onClick={props.onDoubleClick} {...props} />
);

const Scheduler = ({
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(DEFAULT_VIEW);
  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);

  const onCommitChanges = useCallback(
    ({ added, deleted }) => {
      if (added) {
        api
          .post("events", {
            StartTime: added.startDate.toJSON(),
            EndTime: added.endDate.toJSON(),
            RecurrenceRule: added.title,
            Subject: added.title,
            userId,
            createdBy: viewUserId,
          })
          .then((e) =>
            setAppointments([...appointments, eventToAppointmentModel(e.data)])
          );
      } else if (deleted) {
        api
          .delete(`events/${deleted}`)
          .then(() => setAppointments(reject(appointments, { id: deleted })));
      }
    },
    [appointments, setAppointments, userId, viewUserId]
  );
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
      .then((e) => setAppointments(map(e.data, eventToAppointmentModel)));
  }, [userId, viewUserId, currentDate, currentView, setAppointments]);
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
  }, [setWorkHours, setLoadingSchedule, userId]);

  const workStart = parseInt(split(workHours.start, ":")[0]);
  const workEnd = parseInt(split(workHours.end, ":")[0]);
  const isUnavailable = useCallback(
    (tdHour: Date) =>
      !(
        includes(workHours.days, getDay(tdHour)) &&
        getHours(tdHour) >= workStart &&
        getHours(tdHour) < workEnd
      ),
    [workHours, workStart, workEnd]
  );

  const DayViewCell = useCallback(
    (props) => (
      <DayTimeTableCell
        {...props}
        isUnavailable={props.startDate && isUnavailable(props.startDate)}
      />
    ),
    [isUnavailable]
  );

  const WeekViewCell = useCallback(
    (props) => (
      <WeekTimeTableCell
        {...props}
        isUnavailable={props.startDate && isUnavailable(props.startDate)}
      />
    ),
    [isUnavailable]
  );

  return loadingSchedule ? (
    <div>Loading...</div>
  ) : (
    <Paper>
      <DXScheduler data={appointments}>
        <ViewState
          defaultCurrentViewName={DEFAULT_VIEW}
          onCurrentDateChange={setCurrentDate}
          onCurrentViewNameChange={(v: string) => setCurrentView(v as View)}
        />
        <EditingState onCommitChanges={onCommitChanges} />
        <DayView
          startDayHour={6}
          endDayHour={20}
          timeTableCellComponent={DayViewCell}
        />
        <WeekView
          startDayHour={6}
          endDayHour={20}
          timeTableCellComponent={WeekViewCell}
        />
        {personal && <MonthView timeTableCellComponent={MonthTimeTableCell} />}
        <Toolbar />
        <ViewSwitcher />
        <DateNavigator />
        <Appointments />
        <AllDayPanel cellComponent={AllDayPanelCell} />
        <EditRecurrenceMenu />
        <AppointmentTooltip showDeleteButton />
        <ConfirmationDialog ignoreCancel />
        <AppointmentForm />
      </DXScheduler>
    </Paper>
  );
};

export default Scheduler;
