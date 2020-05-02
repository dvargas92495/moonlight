import React, { useState, useEffect } from "react";
import UserPage from "./UserPage";
import styled from "styled-components";
import Form, { FieldType } from "./core/Form";
import { map } from "lodash";
import Button from "./core/Button";
import api, { useApiPost } from "../hooks/apiClient";
import RequestFeedback from "./RequestFeedback";

const Content = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const ApplicationsContainer = styled.div`
  margin-top: 16px;
`;

const ApplicationContainer = styled.div`
  display: flex;
`;

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
  const {
    loading: acceptLoading,
    error: acceptError,
    handleSubmit: acceptUser,
  } = useApiPost("application/accept");
  const {
    loading: rejectLoading,
    error: rejectError,
    handleSubmit: rejectUser,
  } = useApiPost("application/reject");
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
    </Content>
  );
};

const SupportPage = () => (
  <>
    <UserPage
      header="Your Support Dashboard"
      initialTab="users"
      tabContent={{
        users: <UserManagementContent />,
      }}
    />
  </>
);

export default SupportPage;
