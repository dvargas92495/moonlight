import React, { useState, useEffect } from "react";
import UserPage from "./UserPage";
import Scheduler from "./syncfusion/Scheduler";
import { getAvailablity } from "../awsClients/apiClient";

type SpecialistPageProps = {
  globalUuid: string;
};

/*
enum DashboardTab {
  None,
  Scheduler,
}
*/

const SpecialistPage = ({ globalUuid }: SpecialistPageProps) => {
  // const [dashboardTab, setDashboardTab] = useState(DashboardTab.None);
  const [availability, setAvailability] = useState({
    workHoursStart: "9:00",
    workHoursEnd: "16:00",
    workDays: [1, 2, 3, 4, 5]
  });
  useEffect(() => {
    setAvailability(getAvailablity());
  }, [setAvailability]);
  return (
    <UserPage globalUuid={globalUuid}>
      <header>Your Specialist Dashboard</header>
      <Scheduler {...availability} />
    </UserPage>
  );
};

export default SpecialistPage;
