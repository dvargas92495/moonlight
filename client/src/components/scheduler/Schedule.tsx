import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { FileProps } from "../core/FileInput";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
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
  differenceInWeeks,
  getDay,
  isBefore,
  min,
  max,
  isSameDay,
  getHours,
  differenceInHours,
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
import {
  map,
  filter,
  range,
  includes,
  split,
  reject,
  find,
  keys,
  isEmpty,
} from "lodash";
import Overlay from "../core/Overlay";
import Icon from "../core/Icon";
import { FieldType } from "../core/Form";
import Button from "../core/Button";
import RequestFeedback from "../RequestFeedback";
import PatientFormInput from "../core/PatientFormInput";
import DownloadLink from "../core/DownloadLink";
import FormModal from "../core/FormModal";
import Calendar from "../core/Calendar";
import DateRange from "./DateRange";

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

const CalendarTable = styled.table`
  table-layout: fixed;
  width: 100%;
  border-spacing: 0;
`;

const TableRow = styled.tr`
  border-collapse: separate;
  border-spacing: 0;
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
  personal?: boolean;
  isUnavailable?: boolean;
  selected: boolean;
}>`
  background: ${(props) =>
    `${CONTENT_COLOR}${
      props.selected
        ? THREE_QUARTER_OPAQUE
        : props.isUnavailable
        ? HALF_OPAQUE
        : QUARTER_OPAQUE
    }`};
  padding: 0;
  text-align: left;

  &:hover {
    background: ${(props) =>
      (props.personal || !props.isUnavailable) &&
      `${CONTENT_COLOR}${THREE_QUARTER_OPAQUE}`};
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
    setIndex: (index: number) => void;
    birthdayRef: React.RefObject<HTMLDivElement>;
  }
>(({ Id, events, setEvents, setIndex, birthdayRef }, ref) => {
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
        setIndex(keys(event.Patients).length - 1);
        // spreading to force a rerender
        setEvents([...events]);
      }
    },
    [Id, events, setEvents, setIndex]
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
          placeholder: "Date of Birth (mm/dd/yyyy)",
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

const PatientSummary = React.forwardRef<
  HTMLDivElement,
  {
    eventSelected: EventObject;
    viewUserId: number;
    events: EventObject[];
    setEvents: (events: EventObject[]) => void;
    birthdayRef: React.RefObject<HTMLDivElement>;
  }
>(({ eventSelected, viewUserId, events, setEvents, birthdayRef }, ref) => {
  const [index, setIndex] = useState(0);
  const currentPatientId =
    !isEmpty(eventSelected.Patients) &&
    parseInt(Object.keys(eventSelected.Patients).sort()[index]);
  const currentPatient =
    currentPatientId && eventSelected.Patients[currentPatientId];
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
      {currentPatientId && currentPatient && (
        <div>
          <div>
            <Icon
              type={"LEFT"}
              onClick={() => setIndex(index - 1)}
              disabled={index === 0}
            />
            <Icon
              type={"RIGHT"}
              onClick={() => setIndex(index + 1)}
              disabled={index === keys(eventSelected.Patients).length - 1}
            />
          </div>
          <div>
            {`${currentPatient.identifiers.firstName} ${
              currentPatient.identifiers.lastName
            } - ${format(new Date(currentPatient.dateOfBirth), "yyyy/MM/dd")}`}
          </div>
          <div>{`Email: ${currentPatient.identifiers.email || "None"}`}</div>
          <div>
            {`Phone Number: ${
              currentPatient.identifiers.phoneNumber || "None"
            }`}
          </div>
          {viewUserId === eventSelected.CreatedBy ? (
            <PatientFormInput
              patientId={currentPatientId}
              onUploadSuccess={onUploadSuccess(currentPatientId)}
              onDeleteSuccess={onDeleteSuccess(currentPatientId)}
              files={currentPatient.forms}
            />
          ) : (
            <FormContainer>
              {map(currentPatient.forms, ({ name }, i) => (
                <DownloadLink
                  key={i}
                  href={`patients/${currentPatientId}/form/${name}`}
                >
                  {name}
                </DownloadLink>
              ))}
            </FormContainer>
          )}
        </div>
      )}
      {!eventSelected?.IsPending &&
        viewUserId === eventSelected?.CreatedBy &&
        eventSelected?.Id && (
          <PatientDialog
            Id={eventSelected.Id}
            events={events}
            setEvents={setEvents}
            setIndex={setIndex}
            ref={ref}
            birthdayRef={birthdayRef}
          />
        )}
    </PatientSummaryContainer>
  );
});

const DayHourView = ({
  tdHour,
  personal,
  anchor,
  openEventOverlay,
  documentMouseUp,
  setAnchor,
  setSelectedHour,
  setSelectedEndHour,
  setEventSelected,
  selectedHour,
  selectedEndHour,
}: {
  tdHour: Date;
  personal: boolean;
  anchor: Date;
  openEventOverlay: ({ x, y }: { x: number; y: number }) => void;
  documentMouseUp: () => void;
  setSelectedEndHour: (d: Date) => void;
  setSelectedHour: (d: Date) => void;
  setAnchor: (d: Date) => void;
  setEventSelected: (e?: EventObject) => void;
  selectedHour: Date;
  selectedEndHour: Date;
}) => {
  const endTdHour = addHours(tdHour, 1);
  const onMouseDown = useCallback(() => {
    if (!personal) {
      return;
    }
    setAnchor(tdHour);
    setSelectedHour(tdHour);
    setSelectedEndHour(endTdHour);
    setEventSelected(undefined);
    document.addEventListener("mouseup", documentMouseUp);
  }, [
    personal,
    setSelectedHour,
    setSelectedEndHour,
    setEventSelected,
    setAnchor,
    documentMouseUp,
    tdHour,
    endTdHour,
  ]);

  const onMouseOver = useCallback(
    (e: React.MouseEvent) => {
      if (!personal) {
        return;
      }
      if (e.buttons === 1) {
        setSelectedHour(min([anchor, tdHour]));
        setSelectedEndHour(max([addHours(anchor, 1), endTdHour]));
      }
    },
    [setSelectedHour, setSelectedEndHour, personal, anchor, tdHour, endTdHour]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!personal) {
        return;
      }
      const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
      openEventOverlay({ x, y });
      setAnchor(new Date(0));
      document.removeEventListener("mouseup", documentMouseUp);
      e.nativeEvent.stopImmediatePropagation();
    },
    [openEventOverlay, personal, setAnchor, documentMouseUp]
  );
  return (
    <TableRow>
      <TimeCell>{format(tdHour, "h:mm aa")}</TimeCell>
      <HourCell
        key={tdHour.valueOf()}
        personal={personal}
        selected={
          isBefore(tdHour, selectedEndHour) && !isBefore(tdHour, selectedHour)
        }
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseOver={onMouseOver}
      ></HourCell>
    </TableRow>
  );
};

const DayView = ({
  personal,
  currentDate,
  events,
  openEventOverlay,
  selectedHour,
  selectedEndHour,
  setSelectedHour,
  setSelectedEndHour,
  setEventSelected,
}: {
  personal: boolean;
  currentDate: Date;
  selectedHour: Date;
  selectedEndHour: Date;
  events: EventObject[];
  openEventOverlay: ({ x, y }: { x: number; y: number }) => void;
  setSelectedHour: (d: Date) => void;
  setSelectedEndHour: (d: Date) => void;
  setEventSelected: (e?: EventObject) => void;
}) => {
  const [anchor, setAnchor] = useState(new Date(0));
  const tdHours = useMemo(
    () => map(range(3, 24), (h) => setHours(startOfHour(currentDate), h)),
    [currentDate]
  );

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
  const documentMouseUp = useCallback(() => {
    setAnchor(new Date(0));
    setSelectedHour(new Date(0));
    setSelectedEndHour(new Date(60));
    document.removeEventListener("mouseup", documentMouseUp);
  }, [setAnchor, setSelectedHour, setSelectedEndHour]);

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
          </HeaderCell>
        </TableCell>
      </HeaderTableRow>
      {map(tdHours, (tdHour, h) => (
        <DayHourView
          tdHour={tdHour}
          personal={personal}
          selectedHour={selectedHour}
          selectedEndHour={selectedEndHour}
          anchor={anchor}
          openEventOverlay={openEventOverlay}
          documentMouseUp={documentMouseUp}
          setAnchor={setAnchor}
          setSelectedHour={setSelectedHour}
          setSelectedEndHour={setSelectedEndHour}
          setEventSelected={setEventSelected}
          key={h}
        />
      ))}
    </tbody>
  );
};

const WeekView = ({
  personal,
  currentDate,
  events,
  openEventOverlay,
  selectedHour,
  selectedEndHour,
  setSelectedHour,
  setSelectedEndHour,
  setEventSelected,
}: {
  personal: boolean;
  currentDate: Date;
  selectedHour: Date;
  selectedEndHour: Date;
  events: EventObject[];
  openEventOverlay: ({ x, y }: { x: number; y: number }) => void;
  setSelectedHour: (d: Date) => void;
  setSelectedEndHour: (d: Date) => void;
  setEventSelected: (e?: EventObject) => void;
}) => {
  const start = startOfWeek(currentDate);
  const [anchor, setAnchor] = useState(new Date(0));

  const documentMouseUp = useCallback(() => {
    setAnchor(new Date(0));
    setSelectedHour(new Date(0));
    setSelectedEndHour(new Date(60));
    document.removeEventListener("mouseup", documentMouseUp);
  }, [setAnchor, setSelectedHour, setSelectedEndHour]);

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
            const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
            openEventOverlay({
              x,
              y,
            });
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
              </HeaderCell>
            </TableCell>
          );
        })}
      </HeaderTableRow>
      {map(range(3, 24), (h) => (
        <TableRow key={h}>
          <TimeCell>
            {format(setHours(startOfHour(new Date()), h), "h:mm aa")}
          </TimeCell>
          {map(range(0, 7), (i) => {
            const tdHour = setHours(startOfHour(addDays(start, i)), h);
            const endTdHour = addHours(tdHour, 1);
            const onMouseDown = () => {
              if (!personal) {
                return;
              }
              setAnchor(tdHour);
              setSelectedHour(tdHour);
              setSelectedEndHour(endTdHour);
              setEventSelected(undefined);
              document.addEventListener("mouseup", documentMouseUp);
            };

            const onMouseOver = (e: React.MouseEvent) => {
              if (e.buttons === 1 && (personal || isSameDay(anchor, tdHour))) {
                setSelectedHour(min([anchor, tdHour]));
                setSelectedEndHour(max([addHours(anchor, 1), endTdHour]));
              }
            };

            const onMouseUp = (e: React.MouseEvent) => {
              if (!personal) {
                return;
              }
              const {
                x,
                y,
              } = (e.target as HTMLElement).getBoundingClientRect();
              openEventOverlay({
                x,
                y,
              });
              setAnchor(new Date(0));
              document.removeEventListener("mouseup", documentMouseUp);
              e.nativeEvent.stopImmediatePropagation();
            };
            return (
              <HourCell
                key={tdHour.valueOf()}
                personal={personal}
                selected={
                  isBefore(tdHour, selectedEndHour) &&
                  !isBefore(tdHour, selectedHour)
                }
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseOver={onMouseOver}
              ></HourCell>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  );
};

const MonthView = ({
  currentDate,
  openEventOverlay,
  setSelectedHour,
  setSelectedEndHour,
  setEventSelected,
}: {
  currentDate: Date;
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
            const onClick = (e: React.MouseEvent) => {
              const {
                x,
                y,
              } = (e.target as HTMLElement).getBoundingClientRect();
              openEventOverlay({
                x,
                y,
              });
              setSelectedHour(td);
              setSelectedEndHour(addDays(td, 1));
              setEventSelected(undefined);
            };
            return (
              <DayCell key={td.valueOf()} onClick={onClick}>
                <DayCellContainer>{format(td, "d")}</DayCellContainer>
              </DayCell>
            );
          })}
        </TableRow>
      ))}
    </tbody>
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

  const [events, setEvents] = useState<EventObject[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  return (
    <Container>
      <ToolbarContainer>
        <div>
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
      </ToolbarContainer>
      <CalendarTable ref={tableRef}>
        <DayView
          personal={personal}
          events={events}
          currentDate={currentDate}
          openEventOverlay={openEventOverlay}
          selectedHour={selectedHour}
          selectedEndHour={selectedEndHour}
          setSelectedHour={setSelectedHour}
          setSelectedEndHour={setSelectedEndHour}
          setEventSelected={setEventSelected}
        />
        <WeekView
          personal={personal}
          events={events}
          currentDate={currentDate}
          openEventOverlay={openEventOverlay}
          selectedHour={selectedHour}
          selectedEndHour={selectedEndHour}
          setSelectedHour={setSelectedHour}
          setSelectedEndHour={setSelectedEndHour}
          setEventSelected={setEventSelected}
        />
        <MonthView
          currentDate={currentDate}
          openEventOverlay={openEventOverlay}
          setSelectedHour={setSelectedHour}
          setSelectedEndHour={setSelectedEndHour}
          setEventSelected={setEventSelected}
        />
        <Overlay
          isOpen={isEventOpen}
          closePortal={closeEventOverlay}
          parents={[eventRef, patientRef, birthdayRef, tableRef]}
        >
          <EventContainer top={overlayTop} left={overlayLeft} ref={eventRef}>
            <EventHeader>
              {eventSelected && !eventSelected.IsReadonly && (
                <Icon onClick={() => {}} type={"DELETE"} />
              )}
              <Icon onClick={closeEventOverlay} type={"CANCEL"} />
            </EventHeader>
            {eventSelected && (
              <SubjectHeader>{eventSelected.Subject}</SubjectHeader>
            )}
            <EventContentContainer>
              {eventSelected && !eventSelected.IsReadonly && (
                <div>
                  <CreatedByContainer>
                    Created by {eventSelected.fullName}
                  </CreatedByContainer>
                  <DateRange
                    startTime={eventSelected.StartTime}
                    endTime={eventSelected.EndTime}
                  />
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
                  eventSelected={eventSelected}
                  viewUserId={viewUserId}
                  events={events}
                  setEvents={setEvents}
                  ref={patientRef}
                  birthdayRef={birthdayRef}
                />
              )}
            </EventContentContainer>
          </EventContainer>
        </Overlay>
      </CalendarTable>
      <RestOfContainer />
    </Container>
  );
};

export default Schedule;
