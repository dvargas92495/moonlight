import React from "react";
import UserPage from "./UserPage";

type SpecialistPageProps = {
  globalUuid: string;
};

const SpecialistPage = ({ globalUuid }: SpecialistPageProps) => (
  <>
    <UserPage globalUuid={globalUuid}>Your Specialist Dashboard</UserPage>
  </>
);

export default SpecialistPage;
