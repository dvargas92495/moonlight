import React, { useState, useEffect } from "react";
import UserPage from "./UserPage";
import Scheduler from "./syncfusion/Scheduler";
import { map } from "lodash";
import { getSpecialistViews } from "../awsClients/apiClient";
import styled from "styled-components";

type DentistPageProps = {
  userId: number;
};

type SpecialistView = {
  workHoursStart: string;
  workHoursEnd: string;
  workDays: number[];
};

const SpecialistViewContainer = styled.div`
  width: 50%;
  height: 50%;
  display: inline-block;
  overflow-y: scroll;
  padding: 10px;
`;

const SpecialistsContent = () => {
  const [specialistViews, setSpecialistViews] = useState([]);
  useEffect(() => {
    getSpecialistViews().then(s => setSpecialistViews(s));
  }, [setSpecialistViews]);
  return (
    <>
      {map(specialistViews, (v: SpecialistView) => (
        <SpecialistViewContainer>
          <Scheduler {...v} />
        </SpecialistViewContainer>
      ))}
    </>
  );
};

const DentistPage = ({ userId }: DentistPageProps) => (
  <>
    <UserPage
      userId={userId}
      header="Your Dentist Dashboard"
      initialTab="specialists"
      tabContent={{
        specialists: <SpecialistsContent />
      }}
    />
  </>
);

export default DentistPage;
