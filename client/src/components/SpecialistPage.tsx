import React, { useState, useEffect, useCallback } from "react";
import { filter, includes, map, range } from "lodash";
import UserPage from "./UserPage";
import Scheduler from "./syncfusion/Scheduler";
import {
  getAvailablity,
  saveAvailability,
  saveProfile,
  getProfile
} from "../awsClients/apiClient";
import Input from "./Input";
import Checkbox from "./Checkbox";
import SaveButton from "./SaveButton";

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
  const saveProfileCallback = useCallback(
    () =>
      saveProfile({
        firstName,
        lastName,
        userId
      }).then(handleProfileCallback),
    [userId, firstName, lastName, handleProfileCallback]
  );
  useEffect(() => {
    getProfile(userId).then(handleProfileCallback);
  }, [userId, handleProfileCallback]);
  return (
    <div>
      <Input value={firstName} onChange={setFirstName} label="First Name" />
      <Input value={lastName} onChange={setLastName} label="Last Name" />
      <SaveButton apiCall={saveProfileCallback} />
    </div>
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
  const submitSettingsCallback = useCallback(
    () =>
      saveAvailability({
        userId,
        workHoursStart,
        workHoursEnd,
        workDays: filter(
          map(workDays, (b, i) => (b ? i : -1)),
          i => i > -1
        )
      }).then(handleAvailabilityCallback),
    [userId, workDays, workHoursStart, workHoursEnd, handleAvailabilityCallback]
  );
  useEffect(() => {
    getAvailablity(userId).then(handleAvailabilityCallback);
  }, [userId, handleAvailabilityCallback]);
  return (
    <div>
      <Input
        label="Start of Working Hours"
        onChange={setWorkHoursStart}
        value={workHoursStart}
      />
      <Input
        label="End of Working Hours"
        onChange={setWorkHoursEnd}
        value={workHoursEnd}
      />
      <div>
        {map(days, (d, i) => (
          <Checkbox
            label={d}
            checked={workDays[i]}
            key={i}
            onChange={v => {
              const preIndex = workDays.slice(0, i);
              const postIndex = workDays.slice(i + 1);
              setWorkDays([...preIndex, v, ...postIndex]);
            }}
          />
        ))}
      </div>
      <div>
        <SaveButton apiCall={submitSettingsCallback} />
      </div>
    </div>
  );
};

const SchedulerContent = ({ userId }: UserProps) => {
  const [availability, setAvailability] = useState({
    workHoursStart: "9:00",
    workHoursEnd: "17:00",
    workDays: [1, 2, 3, 4, 5]
  });
  useEffect(() => {
    getAvailablity(userId).then(a => setAvailability(a));
  }, [userId, setAvailability]);
  return <Scheduler {...availability} personal />;
};

const SpecialistPage = ({ userId }: UserProps) => (
  <UserPage
    userId={userId}
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
