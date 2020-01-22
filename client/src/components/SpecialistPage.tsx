import React from "react";
import UserPage from "./UserPage";
import Scheduler from "./Scheduler";

type SpecialistPageProps = {
  globalUuid: string;
};

const SpecialistPage = ({ globalUuid }: SpecialistPageProps) => (
  <UserPage globalUuid={globalUuid}>
    <header>Your Specialist Dashboard</header>
    <Scheduler />
  </UserPage>
);

export default SpecialistPage;
