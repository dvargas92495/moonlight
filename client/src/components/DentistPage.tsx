import React, { useState, useEffect } from "react";
import UserPage from "./UserPage";
import Scheduler, { AvailabilityProps } from "./syncfusion/Scheduler";
import { map } from "lodash";
import { getSpecialistViews } from "../awsClients/apiClient";
import styled from "styled-components";

type SpecialistOptionType = {
  selected: boolean;
};

type DentistPageProps = {
  userId: number;
};

type SelectedSchedule = DentistPageProps & AvailabilityProps;

type SpecialistView = SelectedSchedule & {
  fullName: string;
};

const SpecialistOptionsContainer = styled.div`
  width: 50%;
  display: inline-block;
  vertical-align: top;
  height: 100%;
`;

const SpecialistOption = styled.div`
  padding: 5px;
  border: solid black 2px;
  background-color: ${(props: SpecialistOptionType) =>
    props.selected ? "yellow" : "white"};
`;

const SpecialistViewContainer = styled.div`
  width: 50%;
  display: inline-block;
  overflow-y: scroll;
  height: 100%;
`;

const SpecialistsContent = () => {
  const [specialistViews, setSpecialistViews] = useState([]);
  const [
    selectedSchedule,
    setSelectedSchedule
  ] = useState<SelectedSchedule | null>(null);
  useEffect(() => {
    getSpecialistViews().then(s => setSpecialistViews(s));
  }, [setSpecialistViews]);
  return (
    <>
      <SpecialistOptionsContainer>
        {map(specialistViews, (v: SpecialistView) => (
          <SpecialistOption
            selected={selectedSchedule?.userId === v.userId}
            key={v.userId}
          >
            <div>{v.fullName}</div>
            <button onClick={() => setSelectedSchedule(v)}>
              {"SEE AVAILABILITY"}
            </button>
          </SpecialistOption>
        ))}
      </SpecialistOptionsContainer>
      {selectedSchedule && (
        <SpecialistViewContainer>
          <Scheduler {...selectedSchedule} />
        </SpecialistViewContainer>
      )}
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
