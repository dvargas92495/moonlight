import React, { useState, useEffect, useCallback, useRef } from "react";
import { FileProps } from "./FileInput";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  addDays,
  isEqual,
  getDate,
  startOfHour,
  addHours,
  addWeeks,
  setHours,
  subWeeks,
  subDays,
  addMonths,
  subMonths,
  differenceInWeeks,
  getDay,
  getYear,
  getMonth,
} from "date-fns";
import { api, useApiDelete, useApiPost } from "../../hooks/apiClient";
import styled from "styled-components";
import {
  SECONDARY_BACKGROUND_COLOR,
  CONTENT_COLOR,
  HALF_OPAQUE,
  THREE_QUARTER_OPAQUE,
  QUARTER_OPAQUE,
  SECONDARY_COLOR,
  PRIMARY_COLOR,
} from "../../styles/colors";
import { BsChevronLeft, BsChevronRight, BsCalendarFill } from "react-icons/bs";
import { TiArrowSortedDown } from "react-icons/ti";
import {
  map,
  filter,
  range,
  includes,
  split,
  reject,
  find,
  keys,
} from "lodash";
import Overlay from "./Overlay";
import Icon from "./Icon";
import Form, { FieldType } from "./Form";
import Button from "./Button";
import RequestFeedback from "../RequestFeedback";
import PatientFormInput from "./PatientFormInput";
import DownloadLink from "./DownloadLink";
import FormModal from "./FormModal";
import Calendar from "./Calendar";

enum View {
  DAY,
  WEEK,
  MONTH,
}

type PatientInfo = {
  forms: FileProps[];
  identifiers: { [key: string]: string };
  dateOfBirth: string;
};

type EventCommon = {
  Id: number;
  userId: number;
  CreatedBy: number;
  Subject: string;
  IsReadonly: boolean;
  IsPending: boolean;
  Patients: { [id: number]: PatientInfo };
  fullName: string;
  RecurrenceRule: string;
};

type EventObject = EventCommon & {
  StartTime: Date;
  EndTime: Date;
};

type EventResponse = EventCommon & {
  StartTime: string;
  EndTime: string;
};

const formatEventResponse = (e: EventResponse) => ({
  ...e,
  StartTime: new Date(e.StartTime),
  EndTime: new Date(e.EndTime),
});

const getScheduleBounds = (currentDate: Date, currentView: View) => {
  switch (currentView) {
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
  border: 1px solid ${SECONDARY_BACKGROUND_COLOR};
  width: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  user-select: none;
`;

const RestOfContainer = styled.div`
  width: 100%;
  background: ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  height: 100%;
`;

const ToolbarContainer = styled.div`
  min-height: 45px;
  padding-bottom: 3px;
  background: ${`${CONTENT_COLOR}${HALF_OPAQUE}`};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${SECONDARY_BACKGROUND_COLOR};
`;

const ToolbarButton = styled.button`
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

const ToolbarIcon = styled(ToolbarButton)`
  &:hover {
    border-radius: 100%;
  }
`;

const TimeToolbarButton = styled(ToolbarButton)<{ selected: boolean }>`
  text-transform: capitalize;
  color: ${(props) =>
    props.selected ? SECONDARY_COLOR : SECONDARY_BACKGROUND_COLOR};
`;

const CalendarTable = styled.table`
  table-layout: fixed;
  width: 100%;
  border-spacing: 0;
`;

const TableRow = styled.tr`
  border-collapse: separate;
  border-spacing: 0;
  height: 36px;
`;

const HeaderTableRow = styled(TableRow)`
  height: 60px;
  border-color: ${`${SECONDARY_BACKGROUND_COLOR}${QUARTER_OPAQUE}`};
  border-style: solid;
  border-bottom-width: 1px;
`;

const TableCell = styled.td`
  border-color: ${`${SECONDARY_BACKGROUND_COLOR}${QUARTER_OPAQUE}`};
  border-style: solid;
  border-width: 0 0 1px 1px;
  padding: 5px;
  font-weight: 400;
  background: ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  vertical-align: top;
`;

const HeaderCell = styled.div<{ isToday?: boolean }>`
  color: ${(props) =>
    props.isToday ? SECONDARY_COLOR : SECONDARY_BACKGROUND_COLOR};
  cursor: pointer;
  font-size: 18px;
  display: flex;
  flex-direction: column;

  &:hover {
    text-decoration: underline;
  }
`;

const TimeCell = styled(TableCell)`
  width: 120px;
  border-left-width: 0px;
  text-align: center;
`;

const HourCell = styled(TableCell)<{
  isUnavailable?: boolean;
}>`
  background: ${(props) =>
    `${CONTENT_COLOR}${props.isUnavailable ? HALF_OPAQUE : QUARTER_OPAQUE}`};
  padding: 1px;
  height: 36px;
  text-align: left;

  &:hover {
    background: ${`${CONTENT_COLOR}${THREE_QUARTER_OPAQUE}`};
  }
`;

const DayCell = styled(TableCell)<{
  isUnavailable?: boolean;
}>`
  background: ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  padding: 1px;
  height: 126px;
  text-align: left;

  &:hover {
    background: ${`${CONTENT_COLOR}${THREE_QUARTER_OPAQUE}`};
  }
`;

const DayCellEventContainer = styled.div`
  height: 36px;
  padding: 1px 0;
`;

const DayCellContainer = styled.div`
  height: 18px;
  font-size: 14px;
`;

const EventHeader = styled.div`
  background: ${SECONDARY_BACKGROUND_COLOR};
  padding: 5px;
  display: flex;
  justify-content: flex-end;
  color: ${CONTENT_COLOR};
`;

const SubjectHeader = styled.div`
  color: ${CONTENT_COLOR};
  font-size: 18px;
  padding: 0 24px 16px;
  background: ${SECONDARY_BACKGROUND_COLOR};
`;

const EventContainer = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  width: 300px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14),
    0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px -7px rgba(0, 0, 0, 0.2);
`;

const EventContentContainer = styled.div`
  background: ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
  padding: 16px;
  color: ${SECONDARY_BACKGROUND_COLOR};
  font-size: 12px;
`;

const EventSummaryContainer = styled.div<{ hours: number }>`
  position: relative;
  width: 90%;
  height: ${(props) => props.hours * 100}%;
  background: ${SECONDARY_BACKGROUND_COLOR};
  color: ${CONTENT_COLOR};
  font-size: 13px;
  padding-left: 2px;
  cursor: pointer;
`;

const PatientSummaryContainer = styled.div`
  color: ${SECONDARY_BACKGROUND_COLOR};
  padding-top: 16px;
`;

const PatientHeader = styled.h3`
  color: ${PRIMARY_COLOR};
  margin-left: 16px;
`;

const CreatedByContainer = styled.div`
  font-size: 14px;
  color: ${SECONDARY_BACKGROUND_COLOR};
`;

const FormContainer = styled.div`
  padding-left: 16px;
  color: ${SECONDARY_BACKGROUND_COLOR};
`;

const ActionEventContainer = styled.div`
  display: flex;
`;

const ActionEvent = ({
  eventId,
  closeEventOverlay,
  events,
  setEvents,
}: {
  eventId: number;
  closeEventOverlay: () => void;
  events: EventObject[];
  setEvents: (events: EventObject[]) => void;
}) => {
  const {
    error: acceptError,
    loading: acceptLoading,
    handleSubmit: acceptEvent,
  } = useApiPost("accept", (e: EventResponse) => {
    const otherEvents = reject(events, { Id: e.Id });
    setEvents([...otherEvents, formatEventResponse(e)]);
    closeEventOverlay();
  });
  const {
    error: rejectError,
    loading: rejectLoading,
    handleSubmit: rejectEvent,
  } = useApiDelete("events", () => {
    const otherEvents = reject(events, { Id: eventId });
    setEvents(otherEvents);
    closeEventOverlay();
  });
  return (
    <ActionEventContainer>
      <Button isPrimary onClick={() => acceptEvent({ eventId })}>
        Accept
      </Button>
      <RequestFeedback error={acceptError} loading={acceptLoading} />
      <Button onClick={() => rejectEvent(eventId)}>Reject</Button>
      <RequestFeedback error={rejectError} loading={rejectLoading} />
    </ActionEventContainer>
  );
};

const PatientDialog = React.forwardRef<
  HTMLDivElement,
  {
    Id: number;
    events: EventObject[];
    setEvents: (events: EventObject[]) => void;
    birthdayRef: React.RefObject<HTMLDivElement>;
  }
>(({ Id, events, setEvents, birthdayRef }, ref) => {
  const handleResponse = useCallback(
    ({
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      email,
      phoneNumber,
    }: {
      patientId: number;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      email: string;
      phoneNumber: string;
    }) => {
      const event = find(events, { Id });
      if (event) {
        event.Patients[patientId] = {
          identifiers: {
            firstName,
            lastName,
            email,
            phoneNumber,
          },
          dateOfBirth,
          forms: [] as FileProps[],
        };
        // spreading to force a rerender
        setEvents([...events]);
      }
    },
    [Id, events, setEvents]
  );
  return (
    <FormModal
      openModalText={"Add Patient"}
      path={`events/${Id}/patient`}
      handleResponse={handleResponse}
      fields={[
        {
          placeholder: "First Name",
          name: "firstName",
          type: FieldType.TEXT,
        },
        {
          placeholder: "Last Name",
          name: "lastName",
          type: FieldType.TEXT,
        },
        { placeholder: "Email", name: "email", type: FieldType.TEXT },
        {
          placeholder: "Phone Number",
          name: "phoneNumber",
          type: FieldType.TEXT,
        },
        {
          placeholder: "Date of Birth (yyyy/mm/dd)",
          name: "dateOfBirth",
          type: FieldType.DATE,
          ref: birthdayRef,
        },
      ]}
      ref={ref}
    >
      <PatientHeader>Enter Patient Information</PatientHeader>
    </FormModal>
  );
});

const PatientSummary = ({
  Patients,
  CreatedBy,
  viewUserId,
  events,
  setEvents,
}: {
  Patients: { [id: string]: PatientInfo };
  viewUserId: number;
  CreatedBy: number;
  events: EventObject[];
  setEvents: (events: EventObject[]) => void;
}) => {
  const onUploadSuccess = useCallback(
    (p: number) => (f: FileProps) => {
      const eventsWithPatient = filter(events, (e) => !!e.Patients[p]);
      eventsWithPatient.forEach((e) => e.Patients[p].forms.push(f));
      // spreading to force a rerender
      setEvents([...events]);
    },
    [events, setEvents]
  );
  const onDeleteSuccess = useCallback(
    (p: number) => (name: string) => {
      const eventsWithPatient = filter(events, (e) => !!e.Patients[p]);
      eventsWithPatient.forEach(
        (e) => (e.Patients[p].forms = reject(e.Patients[p].forms, { name }))
      );
      // spreading to force a rerender
      setEvents([...events]);
    },
    [events, setEvents]
  );
  return (
    <PatientSummaryContainer>
      {map(keys(Patients), (p: number) => (
        <div key={p}>
          <div>
            {`${Patients[p].identifiers.firstName} ${
              Patients[p].identifiers.lastName
            } - ${format(new Date(Patients[p].dateOfBirth), "yyyy/MM/dd")}`}
          </div>
          <div>{`Email: ${Patients[p].identifiers.email || "None"}`}</div>
          <div>
            {`Phone Number: ${Patients[p].identifiers.phoneNumber || "None"}`}
          </div>
          {viewUserId === CreatedBy ? (
            <PatientFormInput
              patientId={p}
              onUploadSuccess={onUploadSuccess(p)}
              onDeleteSuccess={onDeleteSuccess(p)}
              files={Patients[p].forms}
            />
          ) : (
            <FormContainer>
              {map(Patients[p].forms, ({ name }, i) => (
                <DownloadLink key={i} href={`patients/${p}/form/${name}`}>
                  {name}
                </DownloadLink>
              ))}
            </FormContainer>
          )}
        </div>
      ))}
    </PatientSummaryContainer>
  );
};

const EventSummary = ({
  event,
  setEventSelected,
  openEventOverlay,
}: {
  event: EventObject;
  setEventSelected: (e: EventObject) => void;
  openEventOverlay: ({ x, y }: { x: number; y: number }) => void;
}) => {
  const onClick = (e: React.MouseEvent) => {
    const { x, y, width } = (e.target as HTMLElement).getBoundingClientRect();
    openEventOverlay({
      x: getDay(event.StartTime) < 3 ? x + width : x - 300,
      y,
    });
    setEventSelected(event);
    e.stopPropagation();
  };
  return (
    <EventSummaryContainer hours={1} onClick={onClick}>
      <div>
        {event.Subject.length > 10
          ? `${event.Subject.substring(0, 9)}...`
          : event.Subject}
      </div>
      <div>{`${format(event.StartTime, "hh:mm")} - ${format(
        event.EndTime,
        "hh:mm"
      )}`}</div>
    </EventSummaryContainer>
  );
};

const isEventOnDate = (e: EventObject, d: Date) => {
  if (isEqual(e.StartTime, d)) {
    return true;
  }
  const recurrenceRule = e.RecurrenceRule;
  if (!recurrenceRule) {
    return false;
  }
  const diffWeeks = differenceInWeeks(d, e.StartTime);
  return diffWeeks > 0 && isEqual(addWeeks(e.StartTime, diffWeeks), d);
};

const DayView = ({
  personal,
  currentDate,
  workHours,
  events,
  openEventOverlay,
  setSelectedHour,
  setSelectedEndHour,
  setEventSelected,
}: {
  personal: boolean;
  currentDate: Date;
  workHours: {
    start: string;
    end: string;
    days: number[];
  };
  events: EventObject[];
  openEventOverlay: ({ x, y }: { x: number; y: number }) => void;
  setSelectedHour: (d: Date) => void;
  setSelectedEndHour: (d: Date) => void;
  setEventSelected: (e?: EventObject) => void;
}) => {
  const workStart = parseInt(split(workHours.start, ":")[0]);
  const workEnd = parseInt(split(workHours.end, ":")[0]);

  const eventsThisDay = filter(
    events,
    (e) =>
      isEqual(e.StartTime, currentDate) &&
      isEqual(e.EndTime, addDays(currentDate, 1))
  );

  const onClick = (e: React.MouseEvent) => {
    if (!personal) {
      return;
    }
    const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
    openEventOverlay({ x, y });
    setSelectedHour(currentDate);
    setSelectedEndHour(addDays(currentDate, 1));
    setEventSelected(undefined);
  };

  return (
    <tbody>
      <HeaderTableRow>
        <TimeCell />
        <TableCell>
          <HeaderCell
            isToday={isEqual(getDate(currentDate), getDate(new Date()))}
            onClick={onClick}
          >
            <span>{format(currentDate, "iii")}</span>
            <span>{format(currentDate, "dd")}</span>
            {map(eventsThisDay, (e) => (
              <EventSummary
                event={e}
                key={e.Id}
                setEventSelected={setEventSelected}
                openEventOverlay={openEventOverlay}
              />
            ))}
          </HeaderCell>
        </TableCell>
      </HeaderTableRow>
      {map(range(6, 21), (h) => {
        const tdHour = setHours(startOfHour(currentDate), h);
        const isUnavailable = !(
          includes(workHours.days, getDay(currentDate)) &&
          h >= workStart &&
          h < workEnd
        );
        const eventsThisHour = filter(events, (e) => isEventOnDate(e, tdHour));
        const onClick = (e: React.MouseEvent) => {
          if (isUnavailable && !personal) {
            return;
          }
          const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
          openEventOverlay({ x, y });
          setSelectedHour(tdHour);
          setSelectedEndHour(addHours(tdHour, 1));
          setEventSelected(undefined);
        };
        return (
          <TableRow key={h}>
            <TimeCell>
              {format(setHours(startOfHour(new Date()), h), "h:mm aa")}
            </TimeCell>
            <HourCell
              key={tdHour.valueOf()}
              isUnavailable={isUnavailable}
              onClick={onClick}
            >
              {map(eventsThisHour, (e) => (
                <EventSummary
                  event={e}
                  key={e.Id}
                  setEventSelected={setEventSelected}
                  openEventOverlay={openEventOverlay}
                />
              ))}
            </HourCell>
          </TableRow>
        );
      })}
    </tbody>
  );
};

const WeekView = ({
  personal,
  currentDate,
  workHours,
  events,
  openEventOverlay,
  setSelectedHour,
  setSelectedEndHour,
  setEventSelected,
}: {
  personal: boolean;
  currentDate: Date;
  workHours: {
    start: string;
    end: string;
    days: number[];
  };
  events: EventObject[];
  openEventOverlay: ({ x, y }: { x: number; y: number }) => void;
  setSelectedHour: (d: Date) => void;
  setSelectedEndHour: (d: Date) => void;
  setEventSelected: (e?: EventObject) => void;
}) => {
  const start = startOfWeek(currentDate);
  const workStart = parseInt(split(workHours.start, ":")[0]);
  const workEnd = parseInt(split(workHours.end, ":")[0]);

  return (
    <tbody>
      <HeaderTableRow>
        <TimeCell />
        {map(range(0, 7), (i) => {
          const tdDate = startOfDay(addDays(start, i));
          const eventsThisDay = filter(
            events,
            (e) =>
              isEqual(e.StartTime, tdDate) &&
              isEqual(e.EndTime, addDays(tdDate, 1))
          );

          const onClick = (e: React.MouseEvent) => {
            if (!personal) {
              return;
            }
            const {
              x,
              y,
              width,
            } = (e.target as HTMLElement).getBoundingClientRect();
            openEventOverlay({ x: i < 3 ? x + width : x - 300, y });
            setSelectedHour(tdDate);
            setSelectedEndHour(addDays(tdDate, 1));
            setEventSelected(undefined);
          };
          return (
            <TableCell key={i}>
              <HeaderCell
                isToday={isEqual(getDate(new Date()), getDate(tdDate))}
                onClick={onClick}
              >
                <span>{format(tdDate, "iii")}</span>
                <span>{format(tdDate, "dd")}</span>
                {map(eventsThisDay, (e) => (
                  <EventSummary
                    event={e}
                    key={e.Id}
                    setEventSelected={setEventSelected}
                    openEventOverlay={openEventOverlay}
                  />
                ))}
              </HeaderCell>
            </TableCell>
          );
        })}
      </HeaderTableRow>
      {map(range(6, 21), (h) => (
        <TableRow key={h}>
          <TimeCell>
            {format(setHours(startOfHour(new Date()), h), "h:mm aa")}
          </TimeCell>
          {map(range(0, 7), (i) => {
            const tdHour = setHours(startOfHour(addDays(start, i)), h);
            const isUnavailable = !(
              includes(workHours.days, i) &&
              h >= workStart &&
              h < workEnd
            );
            const eventsThisHour = filter(events, (e) =>
              isEventOnDate(e, tdHour)
            );
            const onClick = (e: React.MouseEvent) => {
              if (isUnavailable && !personal) {
                return;
              }
              const {
                x,
                y,
                width,
              } = (e.target as HTMLElement).getBoundingClientRect();
              openEventOverlay({ x: i < 3 ? x + width : x - 300, y });
              setSelectedHour(tdHour);
              setSelectedEndHour(addHours(tdHour, 1));
              setEventSelected(undefined);
            };
            return (
              <HourCell
                key={tdHour.valueOf()}
                isUnavailable={isUnavailable}
                onClick={onClick}
              >
                {map(eventsThisHour, (e) => (
                  <EventSummary
                    event={e}
                    key={e.Id}
                    setEventSelected={setEventSelected}
                    openEventOverlay={openEventOverlay}
                  />
                ))}
              </HourCell>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  );
};

const MonthView = ({
  currentDate,
  events,
  openEventOverlay,
  setSelectedHour,
  setSelectedEndHour,
  setEventSelected,
}: {
  currentDate: Date;
  events: EventObject[];
  openEventOverlay: ({ x, y }: { x: number; y: number }) => void;
  setSelectedHour: (d: Date) => void;
  setSelectedEndHour: (d: Date) => void;
  setEventSelected: (e?: EventObject) => void;
}) => {
  const start = startOfWeek(startOfMonth(currentDate));
  const numWeeks = differenceInWeeks(endOfMonth(currentDate), start) + 1;

  return (
    <tbody>
      <HeaderTableRow>
        {map(range(0, 7), (i) => (
          <TableCell key={i}>
            <HeaderCell>
              <span>{format(addDays(start, i), "iiii")}</span>
            </HeaderCell>
          </TableCell>
        ))}
      </HeaderTableRow>
      {map(range(numWeeks), (w) => (
        <TableRow key={w}>
          {map(range(0, 7), (i) => {
            const td = startOfDay(addWeeks(addDays(start, i), w));
            const eventsToday = filter(events, (e) =>
              isEqual(startOfDay(e.StartTime), td)
            );
            const onClick = (e: React.MouseEvent) => {
              const {
                x,
                y,
                width,
              } = (e.target as HTMLElement).getBoundingClientRect();
              openEventOverlay({ x: i < 3 ? x + width : x - 300, y });
              setSelectedHour(td);
              setSelectedEndHour(addDays(td, 1));
              setEventSelected(undefined);
            };
            return (
              <DayCell key={td.valueOf()} onClick={onClick}>
                <DayCellContainer>{format(td, "d")}</DayCellContainer>
                {map(eventsToday, (e) => (
                  <DayCellEventContainer key={e.Id}>
                    <EventSummary
                      event={e}
                      setEventSelected={setEventSelected}
                      openEventOverlay={openEventOverlay}
                    />
                  </DayCellEventContainer>
                ))}
              </DayCell>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  );
};

const getFormattedDateRange = (d: Date, v: View) => {
  if (v === View.DAY) {
    return format(d, "MMM dd, yyyy");
  } else if (v === View.WEEK) {
    const start = startOfWeek(d);
    const end = endOfWeek(d);
    const startFormat =
      getYear(start) === getYear(end) ? "MMM dd" : "MMM dd, yyyy";
    const endFormat =
      getMonth(start) === getMonth(end) ? "dd, yyyy" : "MMM dd, yyyy";
    return `${format(startOfWeek(d), startFormat)} - ${format(
      endOfWeek(d),
      endFormat
    )}`;
  } else if (v === View.MONTH) {
    return format(d, "MMMM yyyy");
  } else {
    return d.toString();
  }
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
  const [events, setEvents] = useState<EventObject[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(View.WEEK);
  const [calendarIsOpen, setCalendarIsOpen] = useState(false);
  const [overlayTop, setOverlayTop] = useState(0);
  const [overlayLeft, setOverlayLeft] = useState(0);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<Date>(new Date(0));
  const [selectedEndHour, setSelectedEndHour] = useState<Date>(new Date(60));
  const [eventSelected, setEventSelected] = useState<EventObject>();

  const tableRef = useRef<HTMLTableElement>(null);
  const eventRef = useRef<HTMLDivElement>(null);
  const patientRef = useRef<HTMLDivElement>(null);
  const birthdayRef = useRef<HTMLDivElement>(null);

  const openEventOverlay = useCallback(
    ({ y, x }) => {
      setOverlayTop(y);
      setOverlayLeft(x);
      setIsEventOpen(true);
    },
    [setOverlayTop, setOverlayLeft, setIsEventOpen]
  );
  const closeEventOverlay = useCallback(() => {
    setSelectedHour(new Date(0));
    setSelectedEndHour(new Date(60));
    setEventSelected(undefined);
    setIsEventOpen(false);
  }, [setIsEventOpen, setEventSelected]);

  const increaseCurrentDate = useCallback(() => {
    switch (currentView) {
      case View.DAY:
        setCurrentDate(addDays(currentDate, 1));
        break;
      case View.WEEK:
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case View.MONTH:
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  }, [setCurrentDate, currentDate, currentView]);
  const decreaseCurrentDate = useCallback(() => {
    switch (currentView) {
      case View.DAY:
        setCurrentDate(subDays(currentDate, 1));
        break;
      case View.WEEK:
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case View.MONTH:
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  }, [setCurrentDate, currentDate, currentView]);
  const handleEventCreate = useCallback(
    (e: EventObject) => {
      setEvents([
        ...events,
        {
          ...e,
          StartTime: new Date(e.StartTime),
          EndTime: new Date(e.EndTime),
        },
      ]);
      closeEventOverlay();
    },
    [events, setEvents, closeEventOverlay]
  );
  const { loading, error, handleSubmit: deleteEvent } = useApiDelete(
    "events",
    () => {
      const filteredEvents = reject(events, { Id: eventSelected?.Id });
      setEvents(filteredEvents);
      closeEventOverlay();
    }
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
      .then((e) =>
        setEvents(
          map(e.data, (e) => ({
            ...e,
            StartTime: new Date(e.StartTime),
            EndTime: new Date(e.EndTime),
          }))
        )
      );
  }, [userId, viewUserId, currentDate, currentView, setEvents]);
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

  const openCalendar = useCallback(
    (e) => {
      const {
        x,
        y,
        height,
      } = (e.target as HTMLElement).getBoundingClientRect();
      setOverlayTop(y + height);
      setOverlayLeft(x);
      setCalendarIsOpen(true);
    },
    [setCalendarIsOpen, setOverlayTop, setOverlayLeft]
  );
  return (
    <Container>
      {loadingSchedule ? (
        <div>Loading...</div>
      ) : (
        <>
          <ToolbarContainer>
            <div>
              <ToolbarIcon onClick={decreaseCurrentDate}>
                <BsChevronLeft strokeWidth={3} />
              </ToolbarIcon>
              <ToolbarIcon onClick={increaseCurrentDate}>
                <BsChevronRight strokeWidth={3} />
              </ToolbarIcon>
              <ToolbarButton onClick={openCalendar}>
                {getFormattedDateRange(currentDate, currentView)}
                <TiArrowSortedDown />
              </ToolbarButton>
              <Overlay
                isOpen={calendarIsOpen}
                closePortal={() => setCalendarIsOpen(false)}
              >
                <Calendar
                  value={currentDate}
                  top={overlayTop}
                  left={overlayLeft}
                  onChange={(d) => {
                    setCurrentDate(d);
                    setCalendarIsOpen(false);
                  }}
                />
              </Overlay>
              <ToolbarButton onClick={() => setCurrentDate(new Date())}>
                TODAY
              </ToolbarButton>
            </div>
            <div>
              <TimeToolbarButton
                onClick={() => setCurrentView(View.DAY)}
                selected={currentView === View.DAY}
              >
                DAY
              </TimeToolbarButton>
              <TimeToolbarButton
                onClick={() => setCurrentView(View.WEEK)}
                selected={currentView === View.WEEK}
              >
                WEEK
              </TimeToolbarButton>
              {personal && (
                <TimeToolbarButton
                  onClick={() => setCurrentView(View.MONTH)}
                  selected={currentView === View.MONTH}
                >
                  MONTH
                </TimeToolbarButton>
              )}
            </div>
          </ToolbarContainer>
          <CalendarTable ref={tableRef}>
            {currentView === View.DAY && (
              <DayView
                personal={personal}
                events={events}
                currentDate={currentDate}
                workHours={workHours}
                openEventOverlay={openEventOverlay}
                setSelectedHour={setSelectedHour}
                setSelectedEndHour={setSelectedEndHour}
                setEventSelected={setEventSelected}
              />
            )}
            {currentView === View.WEEK && (
              <WeekView
                personal={personal}
                events={events}
                currentDate={currentDate}
                workHours={workHours}
                openEventOverlay={openEventOverlay}
                setSelectedHour={setSelectedHour}
                setSelectedEndHour={setSelectedEndHour}
                setEventSelected={setEventSelected}
              />
            )}
            {currentView === View.MONTH && (
              <MonthView
                events={events}
                currentDate={currentDate}
                openEventOverlay={openEventOverlay}
                setSelectedHour={setSelectedHour}
                setSelectedEndHour={setSelectedEndHour}
                setEventSelected={setEventSelected}
              />
            )}
            <Overlay
              isOpen={isEventOpen}
              closePortal={closeEventOverlay}
              parents={[eventRef, patientRef, birthdayRef, tableRef]}
            >
              <EventContainer
                top={overlayTop}
                left={overlayLeft}
                ref={eventRef}
              >
                <EventHeader>
                  {eventSelected && !eventSelected.IsReadonly && (
                    <Icon
                      onClick={() => deleteEvent(eventSelected?.Id)}
                      type={"DELETE"}
                    />
                  )}
                  <Icon onClick={closeEventOverlay} type={"CANCEL"} />
                </EventHeader>
                {eventSelected && (
                  <SubjectHeader>{eventSelected.Subject}</SubjectHeader>
                )}
                <EventContentContainer>
                  {!eventSelected && (
                    <Form
                      path={"/events"}
                      handleResponse={handleEventCreate}
                      fields={[
                        {
                          type: personal ? FieldType.TEXT : FieldType.DROPDOWN,
                          name: "Subject",
                          placeholder: "Event Subject",
                          values: ["Request Booking"],
                          required: true,
                        },
                        {
                          type: FieldType.CHECKBOX,
                          name: "isWeekly",
                          placeholder: "Repeat Weekly",
                        },
                      ]}
                      extraProps={{
                        StartTime: selectedHour.toJSON(),
                        EndTime: selectedEndHour.toJSON(),
                        userId: userId,
                        createdBy: viewUserId,
                      }}
                    />
                  )}
                  {eventSelected && !eventSelected.IsReadonly && (
                    <div>
                      <CreatedByContainer>
                        Created by {eventSelected.fullName}
                      </CreatedByContainer>
                      <BsCalendarFill />
                      <span>{`${format(
                        eventSelected.StartTime,
                        "MMMM dd, yyyy"
                      )} (${format(
                        eventSelected.StartTime,
                        "hh:mm a"
                      )} - ${format(eventSelected.EndTime, "hh:mm a")})`}</span>
                    </div>
                  )}
                  {eventSelected?.IsPending && personal && (
                    <ActionEvent
                      eventId={eventSelected.Id}
                      closeEventOverlay={closeEventOverlay}
                      events={events}
                      setEvents={setEvents}
                    />
                  )}
                  {eventSelected && (
                    <PatientSummary
                      Patients={eventSelected.Patients}
                      CreatedBy={eventSelected.CreatedBy}
                      viewUserId={viewUserId}
                      events={events}
                      setEvents={setEvents}
                    />
                  )}
                  {!eventSelected?.IsPending &&
                    viewUserId === eventSelected?.CreatedBy &&
                    eventSelected?.Id && (
                      <PatientDialog
                        Id={eventSelected.Id}
                        events={events}
                        setEvents={setEvents}
                        ref={patientRef}
                        birthdayRef={birthdayRef}
                      />
                    )}
                  <RequestFeedback loading={loading} error={error} />
                </EventContentContainer>
              </EventContainer>
            </Overlay>
          </CalendarTable>
          <RestOfContainer />
        </>
      )}
    </Container>
  );
};

export default Schedule;
