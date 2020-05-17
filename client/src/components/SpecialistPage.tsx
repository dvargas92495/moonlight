import React, { useState, useEffect, useCallback } from "react";
import { includes, map, range } from "lodash";
import UserPage from "./UserPage";
import { getAvailablity } from "../hooks/apiClient";
import Form, { FieldType } from "./core/Form";
import ProfileContent from "./ProfileContent";
import { useUserId } from "../hooks/router";
import Schedule from "./scheduler/Schedule";
import Scheduler from "./devExtreme/Scheduler";
import styled from "styled-components";
import { CONTENT_COLOR } from "../styles/colors";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const range7 = range(0, 7);
const initialWorkDays = map(range7, () => false);

const SettingsContainer = styled.div`
  color: ${CONTENT_COLOR};
`;

const SettingsContent = () => {
  const userId = useUserId();
  const [workHoursStart, setWorkHoursStart] = useState("");
  const [workHoursEnd, setWorkHoursEnd] = useState("");
  const [workDays, setWorkDays] = useState(initialWorkDays);
  const [loading, setLoading] = useState(true);
  const handleAvailabilityCallback = useCallback(
    ({ workHoursStart, workHoursEnd, workDays }) => {
      setWorkHoursStart(workHoursStart);
      setWorkHoursEnd(workHoursEnd);
      setWorkDays(map(range7, (i) => includes(workDays, i)));
    },
    [setWorkHoursStart, setWorkHoursEnd, setWorkDays]
  );
  useEffect(() => {
    getAvailablity(userId)
      .then(handleAvailabilityCallback)
      .catch((e) => {
        console.log(`TODO - Display error somewhere: ${e.message}`);
      })
      .finally(() => setLoading(false));
  }, [userId, handleAvailabilityCallback, setLoading]);
  return loading ? (
    <SettingsContainer>Loading...</SettingsContainer>
  ) : (
    <SettingsContainer>
      <Form
        handleResponse={handleAvailabilityCallback}
        path="availability"
        extraProps={{ userId }}
        onValidate={(data) => {
          if (data.workHoursStart > data.workHoursEnd) {
            return ["End Hours must be after Start Hours"];
          }
          return [];
        }}
        fields={[
          {
            type: FieldType.TIME,
            placeholder: "Start of Working Hours",
            name: "workHoursStart",
            defaultValue: workHoursStart,
          },
          {
            type: FieldType.TIME,
            placeholder: "End of Working Hours",
            name: "workHoursEnd",
            defaultValue: workHoursEnd,
          },
          {
            type: FieldType.CHECKBOXES,
            placeholder: "Work Days",
            name: "workDays",
            defaultValue: JSON.stringify(workDays),
            values: days,
          },
        ]}
      />
    </SettingsContainer>
  );
};

const SchedulerContent = () => {
  const userId = useUserId();
  return <Scheduler viewUserId={userId} userId={userId} />;
};

const SpecialistPage = () => (
  <UserPage
    header={"Your Specialist Dashboard"}
    initialTab={"schedule"}
    tabContent={{
      profile: <ProfileContent />,
      settings: <SettingsContent />,
      schedule: <SchedulerContent />,
    }}
  />
);

export default SpecialistPage;
