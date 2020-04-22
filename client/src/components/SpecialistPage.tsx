import React, { useState, useEffect, useCallback } from "react";
import { includes, map, range } from "lodash";
import UserPage from "./UserPage";
import { getAvailablity } from "../hooks/apiClient";
import Input from "./core/Input";
import Checkbox from "./core/Checkbox";
import Form from "./core/Form";
import ProfileContent from "./ProfileContent";
import { useUserId } from "../hooks/router";
import Schedule from "./core/Schedule";
import styled from "styled-components";
import { CONTENT_COLOR } from "../styles/colors";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const range7 = range(0, 7);
const initialWorkDays = map(range7, () => false);

const CheckboxContainer = styled.div`
  color: ${CONTENT_COLOR};
`;

const SettingsContent = () => {
  const userId = useUserId();
  const [workHoursStart, setWorkHoursStart] = useState("");
  const [workHoursEnd, setWorkHoursEnd] = useState("");
  const [workDays, setWorkDays] = useState(initialWorkDays);
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
      });
  }, [userId, handleAvailabilityCallback]);
  return (
    <Form
      handleResponse={handleAvailabilityCallback}
      path="availability"
      extraProps={{ userId }}
    >
      <Input
        placeholder="Start of Working Hours"
        defaultValue={workHoursStart}
        name="workHoursStart"
      />
      <Input
        placeholder="End of Working Hours"
        defaultValue={workHoursEnd}
        name="workHoursEnd"
      />
      <CheckboxContainer>
        {map(days, (d, i) => (
          <Checkbox
            label={d}
            key={i}
            name="workDays"
            value={i.toString()}
            defaultChecked={workDays[i]}
          />
        ))}
      </CheckboxContainer>
    </Form>
  );
};

const SchedulerContent = () => {
  const userId = useUserId();
  return <Schedule viewUserId={userId} userId={userId} />;
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
