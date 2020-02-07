import React, { useState, useEffect } from "react";
import UserPage from "./UserPage";
import Scheduler from "./syncfusion/Scheduler";
import { getAvailablity } from "../awsClients/apiClient";

type SpecialistPageProps = {
  userId: number;
};

const SchedulerContent = ({ userId }: SpecialistPageProps) => {
  const [availability, setAvailability] = useState({
    workHoursStart: "9:00",
    workHoursEnd: "16:00",
    workDays: [1, 2, 3, 4, 5]
  });
  useEffect(() => {
    getAvailablity(userId).then(({ workHoursStart, workHoursEnd, workDays }) =>
      setAvailability({
        workHoursStart,
        workHoursEnd,
        workDays
      })
    );
  }, [userId, setAvailability]);
  return <Scheduler {...availability} />;
};

const SpecialistPage = ({ userId }: SpecialistPageProps) => (
  <UserPage
    userId={userId}
    header={"Your Specialist Dashboard"}
    initialTab={"schedule"}
    tabContent={{
      schedule: <SchedulerContent userId={userId} />
    }}
  />
);

export default SpecialistPage;
