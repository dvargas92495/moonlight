import React, { useState, useEffect, useCallback } from "react";
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
  format,
} from "date-fns";
import api, { useApiPost, useApiDelete } from "../../hooks/apiClient";
import {
  map,
  reject,
  split,
  includes,
  noop,
  parseInt,
  isEmpty,
  find,
} from "lodash";
import { FileProps } from "../core/FileInput";
import styled from "styled-components";
import {
  CONTENT_COLOR,
  QUARTER_OPAQUE,
  SECONDARY_BACKGROUND_COLOR,
} from "../../styles/colors";
import { Grid } from "@material-ui/core";
import RequestFeedback from "../RequestFeedback";
import Button from "../core/Button";
import DownloadLink from "../core/DownloadLink";

const DEFAULT_VIEW = "Week";

type View = "Day" | "Week" | "Month";

type PatientInfo = {
  forms: FileProps[];
  identifiers: { [key: string]: string };
  dateOfBirth: string;
  id: number;
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
  notes: string;
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

const ActionEventContainer = styled.div`
  display: flex;
`;

const ActionEvent = ({
  id,
  closeTooltip,
  appointments,
  setAppointments,
}: {
  id: number;
  closeTooltip: () => void;
  appointments: EventObject[];
  setAppointments: (events: EventObject[]) => void;
}) => {
  const {
    error: acceptError,
    loading: acceptLoading,
    handleSubmit: acceptEvent,
  } = useApiPost("accept", (e: EventObject) => {
    const otherAppointments = reject(appointments, { Id: e.Id });
    setAppointments([...otherAppointments, eventToAppointmentModel(e)]);
    closeTooltip();
  });
  const {
    error: rejectError,
    loading: rejectLoading,
    handleSubmit: rejectEvent,
  } = useApiDelete("events", () => {
    const otherEvents = reject(appointments, { Id: id });
    setAppointments(otherEvents);
    closeTooltip();
  });
  return (
    <ActionEventContainer>
      <Button isPrimary onClick={() => acceptEvent({ eventId: id })}>
        Accept
      </Button>
      <RequestFeedback error={acceptError} loading={acceptLoading} />
      <Button onClick={() => rejectEvent(id)}>Reject</Button>
      <RequestFeedback error={rejectError} loading={rejectLoading} />
    </ActionEventContainer>
  );
};

const AppointmentTooltipHeader = ({
  ...restProps
}: AppointmentTooltip.HeaderProps) => {
  const { appointmentData } = restProps;
  return (
    <AppointmentTooltip.Header
      {...restProps}
      showDeleteButton={!!appointmentData && !appointmentData.IsReadonly}
    />
  );
};

const AppointmentTooltipContent = ({
  appointments,
  setAppointments,
  closeTooltip,
  appointmentData,
  personal,
  ...restProps
}: AppointmentTooltip.ContentProps & {
  closeTooltip: () => void;
  appointments: EventObject[];
  setAppointments: (events: EventObject[]) => void;
  personal: boolean;
}) => (
  <AppointmentTooltip.Content {...restProps} appointmentData={appointmentData}>
    {appointmentData?.IsPending && personal && (
      <Grid container alignItems="center">
        <ActionEvent
          id={+(appointmentData?.id || 0)}
          closeTooltip={closeTooltip}
          appointments={appointments}
          setAppointments={setAppointments}
        />
      </Grid>
    )}
  </AppointmentTooltip.Content>
);

const PatientSummaryContainer = styled.div`
  padding: 8px;
  border: 1px solid ${SECONDARY_BACKGROUND_COLOR};
`;

const AppointmentFormPatientSection = ({
  patients,
  onFieldChange,
}: {
  patients: PatientInfo[];
  onFieldChange: (change: any) => void;
}) => {
  const [allPatients, setAllPatients] = useState<{
    data: PatientInfo[];
    loading: boolean;
  }>({ data: [], loading: true });
  const onPatientsChange = useCallback(
    (value) =>
      onFieldChange({
        Patients: [...patients, find(allPatients.data, { id: value })],
      }),
    [allPatients, patients, onFieldChange]
  );
  const attachedIds = map(patients, "id");
  const availableOptions = map(
    reject(allPatients.data, (p) => includes(attachedIds, p.id)),
    (p) => ({
      id: p.id,
      text: `${p.identifiers.firstName} ${p.identifiers.lastName}`,
    })
  );
  useEffect(() => {
    api
      .get("patients")
      .then((res) => setAllPatients({ data: res.data, loading: false }));
  }, [setAllPatients]);
  return allPatients.loading ? (
    <AppointmentForm.Label text={"Loading..."} />
  ) : (
    <Grid>
      <AppointmentForm.Label
        text={"Patients"}
        // @ts-ignore
        type={"title"}
      />
      <AppointmentForm.Select
        value={""}
        onValueChange={onPatientsChange}
        type={"filledSelect"}
        availableOptions={availableOptions}
      />
      {map(patients, (p) => (
        <PatientSummaryContainer>
          <div>
            {`${p.identifiers.firstName} ${p.identifiers.lastName} - ${format(
              new Date(p.dateOfBirth),
              "yyyy/MM/dd"
            )}`}
          </div>
          <div>{`Email: ${p.identifiers.email || "None"}`}</div>
          <div>{`Phone Number: ${p.identifiers.phoneNumber || "None"}`}</div>
          {map(p.forms, ({ name }, i) => (
            <DownloadLink key={i} href={`patients/${p.id}/form/${name}`}>
              {name}
            </DownloadLink>
          ))}
        </PatientSummaryContainer>
      ))}
    </Grid>
  );
};

const AppointmentFormLayout = ({
  personal,
  ...restProps
}: AppointmentForm.BasicLayoutProps & { personal: boolean }) => {
  const { appointmentData } = restProps;
  const TextEditorComponent = useCallback(
    (props) => {
      const { type, value, onValueChange } = props;
      if (!personal && type === "titleTextEditor") {
        return (
          <AppointmentForm.Select
            value={value || ""}
            onValueChange={onValueChange}
            type={"filledSelect"}
            availableOptions={[
              {
                text: "Request Booking",
                id: "Request Booking",
              },
            ]}
          />
        );
      }
      return <AppointmentForm.TextEditor {...props} />;
    },
    [personal]
  );

  const BooleanEditorComponent = useCallback(
    (props: AppointmentForm.BooleanEditorProps) => {
      return personal || props.label !== "All Day" ? (
        <AppointmentForm.BooleanEditor {...props} />
      ) : (
        <React.Fragment />
      );
    },
    [personal]
  );
  return (
    <AppointmentForm.BasicLayout
      {...restProps}
      textEditorComponent={TextEditorComponent}
      booleanEditorComponent={BooleanEditorComponent}
    >
      {(!personal || !isEmpty(appointmentData?.Patients)) && (
        <AppointmentFormPatientSection
          patients={appointmentData?.Patients || []}
          onFieldChange={restProps.onFieldChange}
        />
      )}
    </AppointmentForm.BasicLayout>
  );
};

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
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const onCommitChanges = useCallback(
    ({ added, deleted }) => {
      if (added) {
        api
          .post("events", {
            StartTime: added.startDate.toJSON(),
            EndTime: added.endDate.toJSON(),
            RecurrenceRule: added.rRule,
            Subject: added.title,
            userId,
            createdBy: viewUserId,
            patientIds: map(added.Patients, "id"),
            notes: added.notes,
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

  const closeTooltip = useCallback(() => setTooltipVisible(false), [
    setTooltipVisible,
  ]);

  const AppointmentTooltipContentComponent = useCallback(
    (props) => (
      <AppointmentTooltipContent
        {...props}
        personal={personal}
        appointments={appointments}
        setAppointments={setAppointments}
        closeTooltip={closeTooltip}
      />
    ),
    [closeTooltip, appointments, setAppointments, personal]
  );

  const BasicLayoutComponent = useCallback(
    (props) => <AppointmentFormLayout personal={personal} {...props} />,
    [personal]
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
        <AppointmentTooltip
          visible={tooltipVisible}
          onVisibilityChange={setTooltipVisible}
          headerComponent={AppointmentTooltipHeader}
          contentComponent={AppointmentTooltipContentComponent}
        />
        <ConfirmationDialog ignoreCancel />
        <AppointmentForm basicLayoutComponent={BasicLayoutComponent} />
      </DXScheduler>
    </Paper>
  );
};

export default Scheduler;
