import React, { useState, useEffect, useCallback } from "react";
import UserPage from "./UserPage";
import Scheduler from "./devExtreme/Scheduler";
import { map, find, reject } from "lodash";
import api, { getSpecialistViews } from "../hooks/apiClient";
import styled from "styled-components";
import ProfileContent from "./ProfileContent";
import {
  CONTENT_COLOR,
  SECONDARY_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  QUARTER_OPAQUE,
  PRIMARY_COLOR,
} from "../styles/colors";
import Button from "./core/Button";
import { useUserId } from "../hooks/router";
import Form, { FieldType } from "./core/Form";
import { FileProps } from "./core/FileInput";
import { format } from "date-fns";
import PatientFormInput from "./core/PatientFormInput";

type PatientInfo = {
  forms: FileProps[];
  identifiers: { [key: string]: string };
  dateOfBirth: string;
  id: number;
};

type SpecialistOptionType = {
  selected: boolean;
};

type SelectedSchedule = { userId: number };

type SpecialistView = SelectedSchedule & {
  fullName: string;
};

const PatientHeader = styled.h3`
  color: ${PRIMARY_COLOR};
  margin-left: 16px;
`;

const Content = styled.div`
  display: flex;
  width: 100%;
`;

const PatientFormContainer = styled.div`
  min-width: 400px;
  max-width: 400px;
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
  height: 100%;
  border-right: solid ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`} 2px;
`;

const PatientsContainer = styled.div`
  overflow-y: scroll;
  flex-grow: 1;
`;

const PatientSummaryContainer = styled.div`
  color: ${CONTENT_COLOR};
  padding-top: 16px;
`;

const SpecialistOptionsContainer = styled.div`
  min-width: 144px;
  max-width: 144px;
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
  height: 100%;
  border-right: solid ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`} 2px;
`;

const SpecialistOption = styled.div`
  padding: 5px;
  border-bottom: solid ${`${CONTENT_COLOR}${QUARTER_OPAQUE}`} 2px;
  background-color: ${(props: SpecialistOptionType) =>
    props.selected ? SECONDARY_COLOR : SECONDARY_BACKGROUND_COLOR};
  color: ${CONTENT_COLOR};
`;

const SpecialistsContent = () => {
  const userId = useUserId();
  const [specialistViews, setSpecialistViews] = useState<SpecialistView[]>([]);
  const [
    selectedSchedule,
    setSelectedSchedule,
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
        <Scheduler userId={selectedSchedule.userId} viewUserId={userId} />
      )}
    </Content>
  );
};

const PatientsContent = () => {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const handleResponse = useCallback(
    ({
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      email,
      phoneNumber,
    }: {
      patientId: number;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      email: string;
      phoneNumber: string;
    }) => {
      const patient = {
        id: patientId,
        identifiers: {
          firstName,
          lastName,
          email,
          phoneNumber,
        },
        dateOfBirth,
        forms: [] as FileProps[],
      };
      setPatients([...patients, patient]);
    },
    [patients, setPatients]
  );
  const onUploadSuccess = useCallback(
    (p: number) => (f: FileProps) => {
      const patient = find(patients, { id: p });
      patient?.forms.push(f);
      setPatients([...patients]);
    },
    [patients, setPatients]
  );
  const onDeleteSuccess = useCallback(
    (p: number) => (name: string) => {
      const patient = find(patients, { id: p });
      if (patient) {
        patient.forms = reject(patient?.forms, { name });
        setPatients([...patients]);
      }
    },
    [patients, setPatients]
  );
  useEffect(() => {
    api.get("patients").then((res) => setPatients(res.data));
  }, [setPatients]);

  return (
    <Content>
      <PatientFormContainer>
        <PatientHeader>Enter Patient Information</PatientHeader>
        <Form
          path={`patients`}
          handleResponse={handleResponse}
          fields={[
            {
              placeholder: "First Name",
              name: "firstName",
              type: FieldType.TEXT,
            },
            {
              placeholder: "Last Name",
              name: "lastName",
              type: FieldType.TEXT,
            },
            { placeholder: "Email", name: "email", type: FieldType.TEXT },
            {
              placeholder: "Phone Number",
              name: "phoneNumber",
              type: FieldType.TEXT,
            },
            {
              placeholder: "Date of Birth (mm/dd/yyyy)",
              name: "dateOfBirth",
              type: FieldType.DATE,
            },
          ]}
        />
      </PatientFormContainer>
      <PatientsContainer>
        <PatientHeader>Patients</PatientHeader>
        {map(patients, (p) => (
          <PatientSummaryContainer key={p.id}>
            <div>
              {`${p.identifiers.firstName} ${p.identifiers.lastName} - ${format(
                new Date(p.dateOfBirth),
                "yyyy/MM/dd"
              )}`}
            </div>
            <div>{`Email: ${p.identifiers.email || "None"}`}</div>
            <div>{`Phone Number: ${p.identifiers.phoneNumber || "None"}`}</div>
            <PatientFormInput
              patientId={p.id}
              onUploadSuccess={onUploadSuccess(p.id)}
              onDeleteSuccess={onDeleteSuccess(p.id)}
              files={p.forms}
            />
          </PatientSummaryContainer>
        ))}
      </PatientsContainer>
    </Content>
  );
};

const DentistPage = () => (
  <>
    <UserPage
      header="Your Dentist Dashboard"
      initialTab="specialists"
      tabContent={{
        profile: <ProfileContent />,
        specialists: <SpecialistsContent />,
        patients: <PatientsContent />,
      }}
    />
  </>
);

export default DentistPage;
