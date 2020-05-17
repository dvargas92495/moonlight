import React, { useState, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { ViewState, AppointmentModel } from "@devexpress/dx-react-scheduler";
import {
  Scheduler as DXScheduler,
  DayView,
  Appointments,
  WeekView,
  MonthView,
  ViewSwitcher,
  Toolbar,
  AllDayPanel,
} from "@devexpress/dx-react-scheduler-material-ui";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import api from "../../hooks/apiClient";
import { map } from "lodash";

type View = "Day" | "Week" | "Month";

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

const Scheduler = ({
  userId,
  viewUserId,
}: {
  userId: number;
  viewUserId: number;
}) => {
  const personal = userId === viewUserId;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(DEFAULT_VIEW);
  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);
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
      .then((e) =>
        setAppointments(
          map(e.data, (e) => ({
            ...e,
            startDate: new Date(e.StartTime),
            endDate: new Date(e.EndTime),
            rRule: e.RecurrenceRule,
            title: e.Subject,
          }))
        )
      );
  }, [userId, viewUserId, currentDate, currentView, setAppointments]);
  return (
    <Paper>
      <DXScheduler data={appointments}>
        <ViewState defaultCurrentViewName={DEFAULT_VIEW} />
        <DayView startDayHour={9} endDayHour={20} />
        <WeekView startDayHour={9} endDayHour={20} />
        {personal && <MonthView />}
        <Toolbar />
        <ViewSwitcher />
        <Appointments />
        <AllDayPanel />
      </DXScheduler>
    </Paper>
  );
};

export default Scheduler;
