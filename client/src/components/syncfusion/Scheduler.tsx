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
  endOfMonth
} from "date-fns";
import { map, reject } from "lodash";
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
import { getEvents, useApiPost } from "../../hooks/apiClient";
import Input from "./Input";
import RequestFeedback from "../RequestFeedback";
import styled from "styled-components";

type QuickInfoProps = {
  elementType: string;
};

type TimeRangeProps = {
  StartTime: Date;
  EndTime: Date;
};

type QuickInfoTemplatesHeaderProps = QuickInfoProps & {
  IsReadonly: boolean;
  Subject: string;
};

type QuickInfoTemplatesContentProps = QuickInfoProps &
  TimeRangeProps & {
    ActionNeeded: boolean;
    Id: number;
  };

type QuickInfoTemplatesFooterProps = QuickInfoProps;

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
  StartTime: string;
  EndTime: string;
};

const formatEvent = (e: EventResponse) => ({
  ...e,
  StartTime: new Date(e.StartTime),
  EndTime: new Date(e.EndTime)
});

const ScheduleFeedback = styled(RequestFeedback)`
  position: fixed;
  bottom: 0px;
`;

/**
 * Syncfusion has a weird issue with type casting and Quick info templates
 */
const QuickInfoTemplatesHeader: any = ({
  elementType,
  Subject,
  IsReadonly
}: QuickInfoTemplatesHeaderProps) => (
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
}: {
  eventId: number;
  closeQuickInfoPopup: () => void;
  dataSource: Object[];
  setDataSource: (events: Object[]) => void;
}) => {
  const { error, loading, handleSubmit: acceptEvent } = useApiPost(
    "accept",
    (e: EventResponse) => {
      const otherEvents = reject(dataSource, { Id: e.Id });
      setDataSource([...otherEvents, formatEvent(e)]);
      closeQuickInfoPopup();
    }
  );
  return (
    <>
      <button
        className="e-text-ellipsis e-btn e-lib e-flat e-primary"
        title="Accept"
        onClick={() => acceptEvent({ eventId })}
      >
        Accept
      </button>
      <button className="e-text-ellipsis e-btn e-lib e-flat" title="Reject">
        Reject
      </button>
      <RequestFeedback error={error} loading={loading} />
    </>
  );
};

const QuickInfoTemplatesContent: any = ({
  personal,
  closeQuickInfoPopup,
  dataSource,
  setDataSource
}: {
  personal: boolean;
  closeQuickInfoPopup: () => void;
  dataSource: Object[];
  setDataSource: (events: Object[]) => void;
}) => ({
  Id,
  StartTime,
  EndTime,
  ActionNeeded,
  elementType
}: QuickInfoTemplatesContentProps) => (
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
    <div className="e-date-time">
      <div className="e-date-time-icon e-icons" />
      <div>{`${format(StartTime, "MMMM dd, yyyy")} (${format(
        StartTime,
        "hh:mm a"
      )} - ${format(EndTime, "hh:mm a")})`}</div>
    </div>
    {ActionNeeded && (
      <ActionEvent
        eventId={Id}
        closeQuickInfoPopup={closeQuickInfoPopup}
        dataSource={dataSource}
        setDataSource={setDataSource}
      />
    )}
  </>
);

const QuickInfoTemplatesFooter: any = ({
  elementType
}: QuickInfoTemplatesFooterProps) => (
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
  const [dataSource, setDataSource] = useState<Object[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("Week");
  const { error, loading, handleSubmit: createEvent } = useApiPost("events");
  const actionBegin = useCallback(
    ({ requestType, ...rest }) => {
      switch (requestType) {
        case "eventCreate":
          const { addedRecords } = rest;
          const { Subject, StartTime, EndTime } = addedRecords[0];
          createEvent({
            userId,
            createdBy: viewUserId,
            Subject,
            StartTime,
            EndTime
          });
          break;
        default:
          console.log(requestType, rest);
      }
    },
    [userId, viewUserId, createEvent]
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
    <>
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
            closeQuickInfoPopup: () =>
              scheduleRef.current?.closeQuickInfoPopup(),
            dataSource,
            setDataSource
          }),
          footer: QuickInfoTemplatesFooter
        }}
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
      <ScheduleFeedback error={error} loading={loading} />
    </>
  );
};

export default Scheduler;
