import React, { useState, useEffect } from "react";
import UserPage from "./UserPage";
import styled from "styled-components";
import Form, { FieldType } from "./core/Form";
import { map } from "lodash";
import Button from "./core/Button";
import api, { useApiPost } from "../hooks/apiClient";
import RequestFeedback from "./RequestFeedback";
import DeleteUserModal from "./core/DeleteUserModal";
import OfficesContent from "./OfficesContent";
import MonthlyReportsContent from "./MonthlyReportsContent";
import ProfileContent from "./ProfileContent";

const Content = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const ApplicationsContainer = styled.div`
  margin-top: 16px;
`;

const ApplicationContainer = styled.div`
  display: flex;
`;

enum ApplicationStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
}

const Application = ({
  username,
  firstName,
  lastName,
  type,
}: {
  username: string;
  firstName: string;
  lastName: string;
  type: string;
}) => {
  const [status, setStatus] = useState(ApplicationStatus.PENDING);
  const {
    loading: acceptLoading,
    error: acceptError,
    handleSubmit: acceptUser,
  } = useApiPost("application/accept", () =>
    setStatus(ApplicationStatus.ACCEPTED)
  );
  const {
    loading: rejectLoading,
    error: rejectError,
    handleSubmit: rejectUser,
  } = useApiPost("application/reject", () =>
    setStatus(ApplicationStatus.REJECTED)
  );
  switch (status) {
    case ApplicationStatus.PENDING:
      return (
        <ApplicationContainer>
          <div>
            <span>{`${firstName} ${lastName} applied as ${type}`}</span>
          </div>
          <div>
            <Button onClick={() => acceptUser({ username })} isPrimary>
              Accept
            </Button>
            <RequestFeedback loading={acceptLoading} error={acceptError} />
          </div>
          <div>
            <Button onClick={() => rejectUser({ username })}>Reject</Button>
            <RequestFeedback loading={rejectLoading} error={rejectError} />
          </div>
        </ApplicationContainer>
      );
    case ApplicationStatus.ACCEPTED:
      return (
        <ApplicationContainer>
          {`Application for ${username} was accepted.`}
        </ApplicationContainer>
      );
    case ApplicationStatus.REJECTED:
      return (
        <ApplicationContainer>
          {`Application for ${username} was rejected.`}
        </ApplicationContainer>
      );
  }
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("applications")
      .then((res) => setApplications(res.data.applications))
      .finally(() => setLoading(false));
  }, [setApplications, setLoading]);
  return loading ? (
    <div>Loading...</div>
  ) : (
    <ApplicationsContainer>
      {map(applications, (a) => (
        <Application {...a} />
      ))}
    </ApplicationsContainer>
  );
};

const UserManagementContent = () => {
  return (
    <Content>
      <Form
        path={"user"}
        fields={[
          {
            type: FieldType.TEXT,
            name: "username",
            placeholder: "Username",
            required: true,
          },
          {
            type: FieldType.TEXT,
            name: "firstName",
            placeholder: "First Name",
            required: true,
          },
          {
            type: FieldType.TEXT,
            name: "lastName",
            placeholder: "Last Name",
            required: true,
          },
          {
            type: FieldType.DROPDOWN,
            name: "type",
            placeholder: "User Type",
            values: ["specialist", "dentist", "support"],
            required: true,
          },
        ]}
        handleResponse={() => {}}
      />
      <Applications />
      <DeleteUserModal />
    </Content>
  );
};

const SupportPage = () => (
  <>
    <UserPage
      header="Your Support Dashboard"
      initialTab="offices"
      tabContent={{
        offices: <OfficesContent />,
        reports: <MonthlyReportsContent />,
        users: <UserManagementContent />,
        profile: <ProfileContent />,
      }}
    />
  </>
);

export default SupportPage;
