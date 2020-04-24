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
        path={"users"}
        fields={[
          { type: FieldType.TEXT, name: "username", placeholder: "username" },
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
      initialTab="userManagement"
      tabContent={{
        userManagement: <UserManagementContent />,
      }}
    />
  </>
);

export default SupportPage;
