import React, { useState, useEffect } from "react";
import UserPage, { UserPageProps } from "./UserPage";
import Scheduler, { AvailabilityProps } from "./syncfusion/Scheduler";
import { map } from "lodash";
import { getSpecialistViews } from "../hooks/apiClient";
import styled from "styled-components";
import ProfileContent from "./ProfileContent";
import { CONTENT_COLOR, SECONDARY_COLOR, SECONDARY_BACKGROUND_COLOR, QUARTER_OPAQUE } from "../styles/colors";
import Button from "./syncfusion/Button";

type SpecialistOptionType = {
  selected: boolean;
};

type SelectedSchedule = { userId: number } & AvailabilityProps;

type SpecialistView = SelectedSchedule & {
  fullName: string;
};

const Content = styled.div`
  display: flex;
`;

const SpecialistOptionsContainer = styled.div`
  min-width: 144px;
  max-width: 144px;
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
  height: 100%;
  border-right: solid ${CONTENT_COLOR}${QUARTER_OPAQUE} 2px;
`;

const SpecialistOption = styled.div`
  padding: 5px;
  border-bottom: solid ${CONTENT_COLOR}${QUARTER_OPAQUE} 2px;
  background-color: ${(props: SpecialistOptionType) =>
    props.selected ? SECONDARY_COLOR : SECONDARY_BACKGROUND_COLOR};
  color: ${CONTENT_COLOR};
`;

const SpecialistViewContainer = styled.div`
  display: inline-flex;
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
    <Content>
      <SpecialistOptionsContainer>
        {map(specialistViews, (v: SpecialistView) => (
          <SpecialistOption
            selected={selectedSchedule?.userId === v.userId}
            key={v.userId}
          >
            <div>{v.fullName}</div>
            <Button isPrimary onClick={() => setSelectedSchedule(v)}>
              SEE AVAILABILITY
            </Button>
          </SpecialistOption>
        ))}
      </SpecialistOptionsContainer>
      {selectedSchedule && (
        <SpecialistViewContainer>
          <Scheduler {...selectedSchedule} viewUserId={userId} />
        </SpecialistViewContainer>
      )}
    </Content>
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
        profile: <ProfileContent userId={userId} />,
        specialists: <SpecialistsContent userId={userId} />
      }}
    />
  </>
);

export default DentistPage;
