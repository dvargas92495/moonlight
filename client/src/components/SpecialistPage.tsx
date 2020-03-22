import React, { useState, useEffect, useCallback } from "react";
import { includes, map, range } from "lodash";
import UserPage, { UserPageProps } from "./UserPage";
import Scheduler from "./syncfusion/Scheduler";
import { getAvailablity, getProfile } from "../hooks/apiClient";
import Input from "./syncfusion/Input";
import Checkbox from "./syncfusion/Checkbox";
import Form from "./syncfusion/Form";

type UserProps = {
  userId: number;
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const range7 = range(0, 7);
const initialWorkDays = map(range7, () => false);

const ProfileContent = ({ userId }: UserProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const handleProfileCallback = useCallback(
    ({ firstName, lastName }) => {
      setFirstName(firstName);
      setLastName(lastName);
    },
    [setFirstName, setLastName]
  );
  useEffect(() => {
    getProfile(userId).then(handleProfileCallback);
  }, [userId, handleProfileCallback]);
  return (
    <Form
      handleResponse={handleProfileCallback}
      path="profile"
      extraProps={{ userId }}
    >
      <Input
        defaultValue={firstName}
        placeholder="First Name"
        name="firstName"
      />
      <Input defaultValue={lastName} placeholder="Last Name" name="lastName" />
    </Form>
  );
};

const SettingsContent = ({ userId }: UserProps) => {
  const [workHoursStart, setWorkHoursStart] = useState("");
  const [workHoursEnd, setWorkHoursEnd] = useState("");
  const [workDays, setWorkDays] = useState(initialWorkDays);
  const handleAvailabilityCallback = useCallback(
    ({ workHoursStart, workHoursEnd, workDays }) => {
      setWorkHoursStart(workHoursStart);
      setWorkHoursEnd(workHoursEnd);
      setWorkDays(map(range7, i => includes(workDays, i)));
    },
    [setWorkHoursStart, setWorkHoursEnd, setWorkDays]
  );
  useEffect(() => {
    getAvailablity(userId).then(handleAvailabilityCallback);
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
            checked={workDays[i]}
          />
        ))}
      </div>
    </Form>
  );
};

const SchedulerContent = ({ userId }: { userId: number}) => {
  const [availability, setAvailability] = useState(null);
  useEffect(() => {
    getAvailablity(userId).then(a => setAvailability(a));
  }, [userId, setAvailability]);
  return <Scheduler {...availability} viewUserId={userId} userId={userId} />;
};

const SpecialistPage = ({ userId, setUserId }: UserPageProps) => (
  <UserPage
    userId={userId}
    setUserId={setUserId}
    header={"Your Specialist Dashboard"}
    initialTab={"schedule"}
    tabContent={{
      profile: <ProfileContent userId={userId} />,
      settings: <SettingsContent userId={userId} />,
      schedule: <SchedulerContent userId={userId} />
    }}
  />
);

export default SpecialistPage;
