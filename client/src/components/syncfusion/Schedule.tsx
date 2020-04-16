import React, { useState, useEffect, useCallback } from "react";
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
} from "date-fns";
import { api } from "../../hooks/apiClient";
import styled from "styled-components";
import {
  SECONDARY_BACKGROUND_COLOR,
  CONTENT_COLOR,
  HALF_OPAQUE,
  THREE_QUARTER_OPAQUE,
  QUARTER_OPAQUE,
  SECONDARY_COLOR,
} from "../../styles/colors";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { TiArrowSortedDown } from "react-icons/ti";
import { map, values, filter, range, includes, split, reject } from "lodash";
import { setHours } from "date-fns/esm";
import Overlay from "./Overlay";
import Input from "./Input";

enum View {
  TODAY,
  DAY,
  WEEK,
  MONTH,
}

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

  StartTime: Date;
  EndTime: Date;
};

const getScheduleBounds = (currentDate: Date, currentView: View) => {
  switch (currentView) {
    case View.TODAY:
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
`;

const TableCell = styled.td<{ isToday?: boolean }>`
  border-color: ${`${SECONDARY_BACKGROUND_COLOR}${HALF_OPAQUE}`};
  border-style: solid;
  border-width: 0 0 1px 1px;
  padding: 5px;
  text-align: center;
  font-weight: 400;
  color: ${(props) =>
    props.isToday ? SECONDARY_COLOR : SECONDARY_BACKGROUND_COLOR};
  background: ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`};
`;

const TimeCell = styled(TableCell)`
  max-width: 85px;
  border-left-width: 0px;
`;

const HourCell = styled(TableCell)<{
  selected: boolean;
  isUnavailable?: boolean;
}>`
  background: ${(props) =>
    `${CONTENT_COLOR}${
      props.selected ? "" : props.isUnavailable ? HALF_OPAQUE : QUARTER_OPAQUE
    }`};

  &:hover {
    background: ${(props) =>
      !props.selected && `${CONTENT_COLOR}${THREE_QUARTER_OPAQUE}`};
  }
`;

const HeaderCellContent = styled.span`
  cursor: pointer;
  display: table;
  font-size: 18px;
`;

const EventHeader = styled.div`
  background: ${SECONDARY_BACKGROUND_COLOR};
`;

const EventContainer = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  z-index: 2000;

  && {
    min-width: 0;
    max-width: 0;
  }
`;

/*
const ActionEvent = ({
  eventId,
  closeQuickInfoPopup,
  dataSource,
  setDataSource,
}: QuickInfoExtraProps & {
  eventId: number;
}) => {
  const {
    error: acceptError,
    loading: acceptLoading,
    handleSubmit: acceptEvent,
  } = useApiPost("accept", (e: EventResponse) => {
    const otherEvents = reject(dataSource, { Id: e.Id });
    setDataSource([...otherEvents, formatEvent(e)]);
    closeQuickInfoPopup();
  });
  const {
    error: rejectError,
    loading: rejectLoading,
    handleSubmit: rejectEvent,
  } = useApiDelete("events", () => {
    const otherEvents = reject(dataSource, { Id: eventId });
    setDataSource(otherEvents);
    closeQuickInfoPopup();
  });
  return (
    <>
      <Button isPrimary onClick={() => acceptEvent({ eventId })}>
        Accept
      </Button>
      <RequestFeedback error={acceptError} loading={acceptLoading} />
      <Button onClick={() => rejectEvent(eventId)}>Reject</Button>
      <RequestFeedback error={rejectError} loading={rejectLoading} />
    </>
  );
};

const PatientDialog = ({
  Id,
  dataSource,
  setDataSource,
  closeQuickInfoPopup,
}: QuickInfoExtraProps & {
  Id: number;
}) => {
  const handleResponse = useCallback(
    (close) => ({
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
      const event = find(dataSource, { Id });
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
        setDataSource([...dataSource]);
      }
      close();
      closeQuickInfoPopup();
    },
    [Id, dataSource, setDataSource, closeQuickInfoPopup]
  );
  return (
    <Dialog openText={"Add Patient"}>
      {(close) => (
        <Form
          path={`events/${Id}/patient`}
          handleResponse={handleResponse(close)}
          width={320}
        >
          <PatientHeader>Enter Patient Information</PatientHeader>
          <Input placeholder="First Name" name="firstName" />
          <Input placeholder="Last Name" name="lastName" />
          <Input placeholder="Email" name="email" />
          <Input placeholder="Phone Number" name="phoneNumber" />
          <DatePicker
            placeholder="Date of Birth (yyyy/mm/dd)"
            displayFormat="yyyy/MM/dd"
            name="dateOfBirth"
          />
        </Form>
      )}
    </Dialog>
  );
};

const PatientSummary = ({
  Patients,
  CreatedBy,
  viewUserId,
  dataSource,
  setDataSource,
}: {
  Patients: { [id: string]: PatientInfo };
  viewUserId: number;
  CreatedBy: number;
  dataSource: EventObject[];
  setDataSource: (events: EventObject[]) => void;
}) => {
  const onUploadSuccess = useCallback(
    (p: number) => (f: FileProps) => {
      const eventsWithPatient = filter(dataSource, (e) => !!e.Patients[p]);
      eventsWithPatient.forEach((e) => e.Patients[p].forms.push(f));
      // spreading to force a rerender
      setDataSource([...dataSource]);
    },
    [dataSource, setDataSource]
  );
  const onDeleteSuccess = useCallback(
    (p: number) => (name: string) => {
      const eventsWithPatient = filter(dataSource, (e) => !!e.Patients[p]);
      eventsWithPatient.forEach(
        (e) => (e.Patients[p].forms = reject(e.Patients[p].forms, { name }))
      );
      // spreading to force a rerender
      setDataSource([...dataSource]);
    },
    [dataSource, setDataSource]
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

const QuickInfoTemplatesContent: any = ({
  personal,
  closeQuickInfoPopup,
  dataSource,
  viewUserId,
  setDataSource,
}: QuickInfoExtraProps & {
  personal: boolean;
  viewUserId: number;
}) => ({
  Id,
  StartTime,
  EndTime,
  IsPending,
  CreatedBy,
  Patients,
  IsReadonly,
  elementType,
  fullName,
}: QuickInfoProps) => (
  <>
    {elementType === "cell" &&
      (personal ? (
        <Input placeholder="Add Title" name="Subject" />
      ) : (
        <>
          <div>TYPE</div>
          <DropDownListComponent
            dataSource={[{ text: "Request Booking", value: "REQUEST_BOOKING" }]}
            name="Subject"
            className="e-field"
          />
          <Checkbox
            label="Repeat Weekly"
            name="isWeekly"
            className="e-field e-control"
          />
        </>
      ))}
    {Id && !IsReadonly && (
      <div>
        <h3>Created by {fullName}</h3>
      </div>
    )}
    <div className="e-date-time">
      <div className="e-date-time-icon e-icons" />
      <div>{`${format(StartTime, "MMMM dd, yyyy")} (${format(
        StartTime,
        "hh:mm a"
      )} - ${format(EndTime, "hh:mm a")})`}</div>
    </div>
    {IsPending && personal && (
      <ActionEvent
        eventId={Id}
        closeQuickInfoPopup={closeQuickInfoPopup}
        dataSource={dataSource}
        setDataSource={setDataSource}
      />
    )}
    <PatientSummary
      Patients={Patients}
      CreatedBy={CreatedBy}
      viewUserId={viewUserId}
      dataSource={dataSource}
      setDataSource={setDataSource}
    />
    {!IsPending && viewUserId === CreatedBy && Id && (
      <PatientDialog
        Id={Id}
        dataSource={dataSource}
        setDataSource={setDataSource}
        closeQuickInfoPopup={closeQuickInfoPopup}
      />
    )}
  </>
);

const QuickInfoTemplatesFooter: any = ({
  elementType,
}: {
  elementType: string;
}) => (
  <>
    {elementType === "cell" && (
      <button
        className="e-event-create e-text-ellipsis e-control e-btn e-lib e-flat e-primary"
        title="Save"
      >
        Save
      </button>
    )}
  </>
);
*/

const WeekView = ({
  currentDate,
  workHours,
  events,
  setEvents,
}: {
  currentDate: Date;
  workHours: {
    start: string;
    end: string;
    days: number[];
  };
  events: EventObject[];
  setEvents: (events: EventObject[]) => void;
}) => {
  const start = startOfWeek(currentDate);
  const workStart = parseInt(split(workHours.start, ":")[0]);
  const workEnd = parseInt(split(workHours.end, ":")[0]);
  const [selectedHour, setSelectedHour] = useState<Date>(new Date(0));
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [eventSelected, setEventSelected] = useState<EventObject>();

  const deleteEvent = useCallback(() => {
    api.delete(`events/${eventSelected?.Id}`).then(() => {
      const filteredEvents = reject(events, { Id: eventSelected?.Id });
      setEvents(filteredEvents);
    });
  }, [events, setEvents, eventSelected]);

  return (
    <CalendarTable>
      <tbody>
        <HeaderTableRow>
          <TimeCell />
          {map(range(0, 7), (i) => {
            const tdDate = addDays(start, i);
            return (
              <TableCell
                key={i}
                isToday={isEqual(getDate(currentDate), getDate(tdDate))}
              >
                <HeaderCellContent>{format(tdDate, "iii")}</HeaderCellContent>
                <HeaderCellContent>{format(tdDate, "dd")}</HeaderCellContent>
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
              return (
                <HourCell
                  key={tdHour.valueOf()}
                  isUnavailable={isUnavailable}
                  selected={isEqual(selectedHour, tdHour)}
                  onClick={() => {
                    setSelectedHour(tdHour);
                    setIsEventOpen(true);
                  }}
                />
              );
            })}
          </TableRow>
        ))}
      </tbody>
      <Overlay isOpen={isEventOpen} closePortal={() => setIsEventOpen(false)}>
        <EventContainer top={300} left={300}>
          <EventHeader>
            <div className="e-header-icon-wrapper">
              {eventSelected && !eventSelected.IsReadonly && (
                <button
                  className="e-delete"
                  title="Delete"
                  onClick={deleteEvent}
                />
              )}
              <button className="e-close" title="Close" />
            </div>
            {eventSelected && (
              <div className="e-subject-wrap">
                <div className="e-subject e-text-ellipsis">
                  {eventSelected.Subject}
                </div>
              </div>
            )}
          </EventHeader>
          <Input placeholder="Add Title" name="Subject" />
        </EventContainer>
      </Overlay>
    </CalendarTable>
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

  const [workHours, setWorkHours] = useState({
    start: "09:00",
    end: "17:00",
    days: [1, 2, 3, 4, 5],
  });
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [dataSource, setDataSource] = useState<EventObject[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(View.WEEK);

  /*
    const actionBegin = useCallback(
      ({ requestType, ...rest }) => {
        switch (requestType) {
          case "eventCreate":
            const { addedRecords } = rest;
            const { Subject, StartTime, EndTime, isWeekly } = addedRecords[0];
            api.post("events", {
              userId,
              createdBy: viewUserId,
              Subject,
              StartTime,
              EndTime,
              isWeekly,
            });
            break;
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
    */

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
      .then((e) => setDataSource(e.data));
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
  }, [setWorkHours, setLoadingSchedule]);
  return (
    <Container>
      {loadingSchedule ? (
        <div>Loading...</div>
      ) : (
        <>
          <ToolbarContainer>
            <div>
              <ToolbarIcon>
                <BsChevronLeft strokeWidth={3} />
              </ToolbarIcon>
              <ToolbarIcon>
                <BsChevronRight strokeWidth={3} />
              </ToolbarIcon>
              <ToolbarButton>
                {format(currentDate, "MMM dd, yyyy")}
                <TiArrowSortedDown />
              </ToolbarButton>
            </div>
            <div>
              {map(filter(values(View), isNaN), (v) => (
                <TimeToolbarButton
                  key={v as View}
                  onClick={() => setCurrentView(v as View)}
                  selected={View[currentView] === v}
                >
                  {v}
                </TimeToolbarButton>
              ))}
            </div>
          </ToolbarContainer>
          <div>
            {currentView === View.WEEK && (
              <WeekView
                currentDate={currentDate}
                workHours={workHours}
                events={dataSource}
                setEvents={setDataSource}
              />
            )}
          </div>
          <RestOfContainer />
        </>
      )}
    </Container>
  );
};

export default Schedule;
