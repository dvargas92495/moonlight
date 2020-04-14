import React, { useState, useEffect, useCallback } from "react";
import { includes, map, range } from "lodash";
import UserPage from "./UserPage";
import Scheduler from "./syncfusion/Scheduler";
import { getAvailablity } from "../hooks/apiClient";
import Input from "./syncfusion/Input";
import Checkbox from "./syncfusion/Checkbox";
import Form from "./syncfusion/Form";
import ProfileContent from "./ProfileContent";
import { useUserId } from "../hooks/router";
import Schedule from "./syncfusion/Schedule";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const range7 = range(0, 7);
const initialWorkDays = map(range7, () => false);

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
      <div>
        {map(days, (d, i) => (
          <Checkbox
            label={d}
            key={i}
            name="workDays"
            value={i.toString()}
            defaultChecked={workDays[i]}
          />
        ))}
      </div>
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
