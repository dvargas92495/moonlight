import React, { useState, useEffect } from "react";
import UserPage, { UserPageProps } from "./UserPage";
import Scheduler, { AvailabilityProps } from "./syncfusion/Scheduler";
import { map } from "lodash";
import { getSpecialistViews } from "../hooks/apiClient";
import styled from "styled-components";

type SpecialistOptionType = {
  selected: boolean;
};

type SelectedSchedule = { userId: number } & AvailabilityProps;

type SpecialistView = SelectedSchedule & {
  fullName: string;
};

const SpecialistOptionsContainer = styled.div`
  width: 30%;
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
  width: 70%;
  display: inline-block;
  overflow-y: scroll;
  height: 100%;
`;

const SpecialistsContent = ({ userId }: { userId: number }) => {
  const [specialistViews, setSpecialistViews] = useState<SpecialistView[]>([]);
  const [
    selectedSchedule,
    setSelectedSchedule
  ] = useState<SelectedSchedule | null>(null);
  useEffect(() => {
    getSpecialistViews(userId).then((s: SpecialistView[]) =>
      setSpecialistViews(s)
    );
  }, [userId, setSpecialistViews]);
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
              SEE AVAILABILITY
            </button>
          </SpecialistOption>
        ))}
      </SpecialistOptionsContainer>
      {selectedSchedule && (
        <SpecialistViewContainer>
          <Scheduler {...selectedSchedule} viewUserId={userId} />
        </SpecialistViewContainer>
      )}
    </>
  );
};

const DentistPage = ({ userId, setUserId }: UserPageProps) => (
  <>
    <UserPage
      userId={userId}
      setUserId={setUserId}
      header="Your Dentist Dashboard"
      initialTab="specialists"
      tabContent={{
        specialists: <SpecialistsContent userId={userId} />
      }}
    />
  </>
);

export default DentistPage;
