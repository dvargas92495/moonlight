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
  values,
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
  max-width: 85px;
  border-left-width: 0px;
  text-align: center;
`;

const HourCell = styled(TableCell)<{
  selected: boolean;
  isUnavailable?: boolean;
}>`
  background: ${(props) =>
    `${CONTENT_COLOR}${
      props.selected ? "" : props.isUnavailable ? HALF_OPAQUE : QUARTER_OPAQUE
    }`};
  padding: 1px;
  height: 36px;
  text-align: left;

  &:hover {
    background: ${(props) =>
      !props.selected && `${CONTENT_COLOR}${THREE_QUARTER_OPAQUE}`};
  }
`;

const EventHeader = styled.div`
  background: ${SECONDARY_BACKGROUND_COLOR};
  padding: 5px;
  display: flex;
  justify-content: flex-end;
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
`;

const ActionEventContainer = styled.div`
  display: flex;
`;

const ActionEvent = ({
  eventId,
  closeOverlay,
  events,
  setEvents,
}: {
  eventId: number;
  closeOverlay: () => void;
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
    closeOverlay();
  });
  const {
    error: rejectError,
    loading: rejectLoading,
    handleSubmit: rejectEvent,
  } = useApiDelete("events", () => {
    const otherEvents = reject(events, { Id: eventId });
    setEvents(otherEvents);
    closeOverlay();
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
  }
>(({ Id, events, setEvents }, ref) => {
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
              initialFiles={Patients[p].forms}
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
  e,
  setEventSelected,
}: {
  e: EventObject;
  setEventSelected: (e: EventObject) => (evt: React.MouseEvent) => void;
}) => {
  return (
    <EventSummaryContainer
      hours={1}
      onClick={(evt) => {
        setEventSelected(e)(evt);
        evt.stopPropagation();
      }}
    >
      <div>{e.Subject}</div>
      <div>{`${format(e.StartTime, "hh:mm")} - ${format(
        e.EndTime,
        "hh:mm"
      )}`}</div>
    </EventSummaryContainer>
  );
};

const DayView = () => <div>Day View is coming soon!</div>;

const WeekView = ({
  userId,
  viewUserId,
  currentDate,
  workHours,
  events,
  setEvents,
}: {
  userId: number;
  viewUserId: number;
  currentDate: Date;
  workHours: {
    start: string;
    end: string;
    days: number[];
  };
  events: EventObject[];
  setEvents: (events: EventObject[]) => void;
}) => {
  const personal = userId === viewUserId;
  const start = startOfWeek(currentDate);
  const workStart = parseInt(split(workHours.start, ":")[0]);
  const workEnd = parseInt(split(workHours.end, ":")[0]);
  const eventRef = useRef<HTMLDivElement>(null);
  const patientRef = useRef<HTMLDivElement>(null);
  const [selectedHour, setSelectedHour] = useState<Date>(new Date(0));
  const [selectedEndHour, setSelectedEndHour] = useState<Date>(new Date(60));
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [overlayTop, setOverlayTop] = useState(0);
  const [overlayLeft, setOverlayLeft] = useState(0);
  const [eventSelected, setEventSelected] = useState<EventObject>();

  const closeOverlay = useCallback(() => {
    setSelectedHour(new Date(0));
    setEventSelected(undefined);
    setIsEventOpen(false);
  }, [setIsEventOpen, setEventSelected]);
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
      closeOverlay();
    },
    [events, setEvents, closeOverlay]
  );
  const deleteEvent = useCallback(() => {
    api.delete(`events/${eventSelected?.Id}`).then(() => {
      const filteredEvents = reject(events, { Id: eventSelected?.Id });
      setEvents(filteredEvents);
      closeOverlay();
    });
  }, [events, setEvents, eventSelected, closeOverlay]);

  return (
    <CalendarTable>
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
            const openOverlay = (event?: EventObject) => (
              e: React.MouseEvent
            ) => {
              if (!personal) {
                return;
              }
              const {
                x,
                y,
                width,
              } = (e.target as HTMLElement).getBoundingClientRect();
              setOverlayTop(y);
              setOverlayLeft(i < 3 ? x + width : x - 300);
              setSelectedHour(tdDate);
              setSelectedEndHour(addDays(tdDate, 1));
              setIsEventOpen(true);
              setEventSelected(event);
            };
            return (
              <TableCell key={i}>
                <HeaderCell
                  isToday={isEqual(getDate(currentDate), getDate(tdDate))}
                  onClick={openOverlay()}
                >
                  <span>{format(tdDate, "iii")}</span>
                  <span>{format(tdDate, "dd")}</span>
                  {map(eventsThisDay, (e) => (
                    <EventSummary
                      e={e}
                      key={e.Id}
                      setEventSelected={openOverlay}
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
                isEqual(e.StartTime, tdHour)
              );
              const openOverlay = (event?: EventObject) => (
                e: React.MouseEvent
              ) => {
                if (isUnavailable && !personal) {
                  return;
                }
                const {
                  x,
                  y,
                  width,
                } = (e.target as HTMLElement).getBoundingClientRect();
                setOverlayTop(y);
                setOverlayLeft(i < 3 ? x + width : x - 300);
                setSelectedHour(tdHour);
                setSelectedEndHour(addHours(tdHour, 1));
                setIsEventOpen(true);
                setEventSelected(event);
              };
              return (
                <HourCell
                  key={tdHour.valueOf()}
                  isUnavailable={isUnavailable}
                  selected={isEqual(selectedHour, tdHour)}
                  onClick={openOverlay()}
                >
                  {map(eventsThisHour, (e) => (
                    <EventSummary
                      e={e}
                      key={e.Id}
                      setEventSelected={openOverlay}
                    />
                  ))}
                </HourCell>
              );
            })}
          </TableRow>
        ))}
      </tbody>
      <Overlay
        isOpen={isEventOpen}
        closePortal={closeOverlay}
        parents={[eventRef, patientRef]}
      >
        <EventContainer top={overlayTop} left={overlayLeft} ref={eventRef}>
          <EventHeader>
            {eventSelected && !eventSelected.IsReadonly && (
              <Icon onClick={deleteEvent} type={"DELETE"} />
            )}
            <Icon onClick={closeOverlay} type={"CANCEL"} />
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
                )} (${format(eventSelected.StartTime, "hh:mm a")} - ${format(
                  eventSelected.EndTime,
                  "hh:mm a"
                )})`}</span>
              </div>
            )}
            {eventSelected?.IsPending && personal && (
              <ActionEvent
                eventId={eventSelected.Id}
                closeOverlay={closeOverlay}
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
                />
              )}
          </EventContentContainer>
        </EventContainer>
      </Overlay>
    </CalendarTable>
  );
};

const MonthView = () => <div>Month View is coming soon!</div>;

const Schedule = ({
  userId,
  viewUserId,
}: {
  userId: number;
  viewUserId: number;
}) => {
  const [workHours, setWorkHours] = useState({
    start: "09:00",
    end: "17:00",
    days: [1, 2, 3, 4, 5],
  });
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [dataSource, setDataSource] = useState<EventObject[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(View.WEEK);

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
        setDataSource(
          map(e.data, (e) => ({
            ...e,
            StartTime: new Date(e.StartTime),
            EndTime: new Date(e.EndTime),
          }))
        )
      );
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
  }, [setWorkHours, setLoadingSchedule, userId]);
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
              <ToolbarButton>
                {format(currentDate, "MMM dd, yyyy")}
                <TiArrowSortedDown />
              </ToolbarButton>
              <ToolbarButton onClick={() => setCurrentDate(new Date())}>
                TODAY
              </ToolbarButton>
            </div>
            <div>
              {map(reject(values(View), isNaN), (v) => (
                <TimeToolbarButton
                  key={v as View}
                  onClick={() => setCurrentView(v as View)}
                  selected={currentView === v}
                >
                  {View[v as View]}
                </TimeToolbarButton>
              ))}
            </div>
          </ToolbarContainer>
          <div>
            {currentView === View.DAY && <DayView />}
            {currentView === View.WEEK && (
              <WeekView
                userId={userId}
                viewUserId={viewUserId}
                currentDate={currentDate}
                workHours={workHours}
                events={dataSource}
                setEvents={setDataSource}
              />
            )}
            {currentView === View.MONTH && <MonthView />}
          </div>
          <RestOfContainer />
        </>
      )}
    </Container>
  );
};

export default Schedule;
