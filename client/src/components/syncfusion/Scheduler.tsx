import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  RefObject
} from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter
} from "date-fns";
import { map, reject, includes, keys, find } from "lodash";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import {
  ScheduleComponent,
  Day,
  Week,
  Month,
  Inject,
  ViewsDirective,
  ViewDirective
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
import api, {
  getEvents,
  useApiPost,
  useApiDelete
} from "../../hooks/apiClient";
import Input from "./Input";
import RequestFeedback from "../RequestFeedback";
import Dialog from "./Dialog";
import Form from "./Form";
import FileInput from "./FileInput";
import styled from "styled-components";
import DownloadLink from "./DownloadLink";

export type AvailabilityProps = {
  userId: number;
  workHoursStart: string;
  workHoursEnd: string;
  workDays: number[];
};

type SchedulerProps = AvailabilityProps & {
  viewUserId: number;
};

type EventResponse = {
  Id: number;
  userId: number;
  CreatedBy: number;
  Subject: string;
  StartTime: string;
  EndTime: string;
  IsReadonly: boolean;
  IsPending: boolean;
  Patients: { [id: number]: {forms: string[]; identifiers: { [key: string]: string }, dateOfBirth: string; }};
  fullName: string;
};

type EventObject = {
  Id: number;
  userId: number;
  CreatedBy: number;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsReadonly: boolean;
  IsPending: boolean;
  Patients: { [id: number]: {forms: string[]; identifiers: { [key: string]: string }, dateOfBirth: string; }};
  fullName: string;
};

type QuickInfoExtraProps = {
  closeQuickInfoPopup: () => void;
  dataSource: EventObject[];
  setDataSource: (events: EventObject[]) => void;
};

type QuickInfoProps = EventObject & {
  elementType: string;
};

const formatEvent = (e: EventResponse) => ({
  ...e,
  StartTime: new Date(e.StartTime),
  EndTime: new Date(e.EndTime)
});

const PatientSummary = styled.div`
  padding-top: 16px;
`;

const FormContainer = styled.div`
  padding-left: 16px;
`;

/**
 * Syncfusion has a weird issue with type casting and Quick info templates
 */
const QuickInfoTemplatesHeader: any = ({
  elementType,
  Subject,
  IsReadonly
}: EventObject & {
  elementType: string;
}) => (
  <>
    <div className="e-header-icon-wrapper">
      {!IsReadonly && elementType === "event" && (
        <button className="e-delete" title="Delete" />
      )}
      <button className="e-close" title="Close" />
    </div>
    {elementType === "event" && (
      <div className="e-subject-wrap">
        <div className="e-subject e-text-ellipsis">{Subject}</div>
      </div>
    )}
  </>
);

const ActionEvent = ({
  eventId,
  closeQuickInfoPopup,
  dataSource,
  setDataSource
}: QuickInfoExtraProps & {
  eventId: number;
}) => {
  const {
    error: acceptError,
    loading: acceptLoading,
    handleSubmit: acceptEvent
  } = useApiPost("accept", (e: EventResponse) => {
    const otherEvents = reject(dataSource, { Id: e.Id });
    setDataSource([...otherEvents, formatEvent(e)]);
    closeQuickInfoPopup();
  });
  const {
    error: rejectError,
    loading: rejectLoading,
    handleSubmit: rejectEvent
  } = useApiDelete("events", () => {
    const otherEvents = reject(dataSource, { Id: eventId });
    setDataSource(otherEvents);
    closeQuickInfoPopup();
  });
  return (
    <>
      <button
        className="e-text-ellipsis e-btn e-lib e-flat e-primary"
        title="Accept"
        onClick={() => acceptEvent({ eventId })}
      >
        Accept
      </button>
      <RequestFeedback error={acceptError} loading={acceptLoading} />
      <button
        className="e-text-ellipsis e-btn e-lib e-flat"
        title="Reject"
        onClick={() => rejectEvent(eventId)}
      >
        Reject
      </button>
      <RequestFeedback error={rejectError} loading={rejectLoading} />
    </>
  );
};

const PatientDialog = ({
  Id,
  dataSource,
  setDataSource,
  closeQuickInfoPopup
}: QuickInfoExtraProps & {
  Id: number;
}) => {
  const handleResponse = useCallback(
    close => ({
      patientId,
      firstName,
      lastName,
      dateOfBirth
    }: {
      patientId: number;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
    }) => {
      const event = find(dataSource, { Id });
      if (event) {
        event.Patients[patientId] = {
          identifiers: {
            firstName,
            lastName,
          },
          dateOfBirth,
          forms: [],
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
      {close => (
        <Form
          path={`events/${Id}/patient`}
          handleResponse={handleResponse(close)}
          width={320}
        >
          <h3>Enter Patient Information</h3>
          <Input placeholder="First Name" name="firstName" />
          <Input placeholder="Last Name" name="lastName" />
          <DatePickerComponent
            placeholder="Date of Birth (yyyy/mm/dd)"
            format="yyyy/MM/dd"
            name="dateOfBirth"
          />
        </Form>
      )}
    </Dialog>
  );
};

const QuickInfoTemplatesContent: any = ({
  personal,
  closeQuickInfoPopup,
  dataSource,
  viewUserId,
  setDataSource
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
  fullName
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
    <PatientSummary>
      {map(keys(Patients), (p: number) => (
        <div key={p}>
          {`${Patients[p].identifiers.firstName} ${Patients[p].identifiers.lastName} - ${format(
            new Date(Patients[p].dateOfBirth),
            "yyyy/MM/dd"
          )}`}
          {viewUserId === CreatedBy ? (
            <FileInput
              browseButtonText={"Add Patient Form..."}
              files={Patients[p].forms}
              url={`patients/${p}/form`}
            />
          ) : (
            <FormContainer>
              {map(Patients[p].forms, f => (
                <DownloadLink key={f} href={`patient-forms/${p}/${f}`}>{f}</DownloadLink>
              ))}
            </FormContainer>
          )}
        </div>
      ))}
    </PatientSummary>
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
  elementType
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

const onPopupOpen = (
  schedule: RefObject<ScheduleComponent>,
  personal: boolean
) => (args: any) => {
  if (personal) {
    return;
  }
  const {
    data: { Subject, StartTime, EndTime, groupIndex }
  } = args;
  if (Subject) {
    return;
  }
  const available = schedule.current?.isSlotAvailable({
    StartTime,
    EndTime,
    groupIndex
  });
  const isInWorkHours = (d: Date) => {
    const startOfDay = new Date(d);
    const endOfDay = new Date(d);
    const start = schedule.current?.workHours?.start || "00:00";
    const end = schedule.current?.workHours?.end || "23:00";
    startOfDay.setHours(parseInt(start.substring(0, 2)));
    startOfDay.setMinutes(parseInt(start.substring(3)));
    endOfDay.setHours(parseInt(end.substring(0, 2)));
    endOfDay.setMinutes(parseInt(end.substring(3)));
    return !isBefore(d, startOfDay) && !isAfter(d, endOfDay);
  };
  const startAvailable =
    includes(schedule.current?.workDays, StartTime.getDay()) &&
    isInWorkHours(StartTime);
  const endAvailable =
    includes(schedule.current?.workDays, StartTime.getDay()) &&
    isInWorkHours(EndTime);
  args.cancel = !(available && startAvailable && endAvailable);
};

const getScheduleBounds = (currentDate: Date, currentView: string) => {
  if (currentView === "Day") {
    return {
      startTime: startOfDay(currentDate),
      endTime: endOfDay(currentDate)
    };
  } else if (currentView === "Week") {
    return {
      startTime: startOfWeek(currentDate),
      endTime: endOfWeek(currentDate)
    };
  } else if (currentView === "Month") {
    return {
      startTime: startOfMonth(currentDate),
      endTime: endOfMonth(currentDate)
    };
  } else {
    throw new Error(`Unknown Current View: ${currentView}`);
  }
};

const Scheduler = ({
  userId,
  viewUserId,
  workHoursStart,
  workHoursEnd,
  workDays
}: SchedulerProps) => {
  const personal = userId === viewUserId;
  const scheduleRef = useRef() as RefObject<ScheduleComponent>;
  const [dataSource, setDataSource] = useState<EventObject[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("Week");
  const actionBegin = useCallback(
    ({ requestType, ...rest }) => {
      switch (requestType) {
        case "eventCreate":
          const { addedRecords } = rest;
          const { Subject, StartTime, EndTime } = addedRecords[0];
          api.post("events", {
            userId,
            createdBy: viewUserId,
            Subject,
            StartTime,
            EndTime
          });
          break;
        case "eventRemove":
          const { deletedRecords } = rest;
          const { Id } = deletedRecords[0];
          api.delete(`events/${Id}`);
          break;
        default:
          console.log(requestType, rest);
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
  useEffect(() => {
    const { startTime, endTime } = getScheduleBounds(currentDate, currentView);
    getEvents({
      userId,
      viewUserId,
      startTime: startTime.toJSON(),
      endTime: endTime.toJSON()
    }).then(events => setDataSource(map(events, formatEvent)));
  }, [userId, viewUserId, currentDate, currentView, setDataSource]);
  return (
    <ScheduleComponent
      ref={scheduleRef}
      workHours={{ start: workHoursStart, end: workHoursEnd }}
      workDays={workDays}
      startHour="06:00"
      endHour="21:00"
      height="100%"
      timeScale={{ slotCount: 1 }}
      quickInfoTemplates={{
        header: QuickInfoTemplatesHeader,
        content: QuickInfoTemplatesContent({
          personal,
          viewUserId,
          closeQuickInfoPopup: () => scheduleRef.current?.closeQuickInfoPopup(),
          dataSource,
          setDataSource
        }),
        footer: QuickInfoTemplatesFooter
      }}
      popupOpen={onPopupOpen(scheduleRef, personal)}
      actionBegin={actionBegin}
      navigating={navigating}
      eventSettings={{ dataSource }}
    >
      <ViewsDirective>
        {personal && <ViewDirective option="Day" />}
        <ViewDirective option="Week" />
        {personal && <ViewDirective option="Month" />}
      </ViewsDirective>
      <Inject services={personal ? [Day, Week, Month] : [Week]} />
    </ScheduleComponent>
  );
};

export default Scheduler;
