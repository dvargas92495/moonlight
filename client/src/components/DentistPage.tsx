import React from "react";
import UserPage from "./UserPage";

type DentistPageProps = {
  globalUuid: string;
};

const DentistPage = ({ globalUuid }: DentistPageProps) => (
  <>
    <UserPage globalUuid={globalUuid}>Your Dentist Dashboard</UserPage>
  </>
);

export default DentistPage;
