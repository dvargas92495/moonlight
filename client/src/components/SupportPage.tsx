import React from "react";
import UserPage from "./UserPage";
import styled from "styled-components";
import Form, { FieldType } from "./core/Form";

const Content = styled.div`
  display: flex;
  width: 100%;
`;

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
