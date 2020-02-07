import React from "react";
import UserPage from "./UserPage";

type DentistPageProps = {
  userId: number;
};

const DentistPage = ({ userId }: DentistPageProps) => (
  <>
    <UserPage
      userId={userId}
      header="Your Dentist Dashboard"
      initialTab="todo"
      tabContent={{
        todo: <div>Coming Soon...</div>
      }}
    />
  </>
);

export default DentistPage;
