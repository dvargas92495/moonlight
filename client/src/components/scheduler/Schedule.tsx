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
    </PatientSummaryContainer>
  );
});

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
