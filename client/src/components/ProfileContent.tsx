import React, { useState, useCallback, useEffect } from "react";
import { getProfile } from "../hooks/apiClient";
import Form, { FieldType } from "./core/Form";
import { useUserId } from "../hooks/router";
import styled from "styled-components";
import PhotoInput from "./core/PhotoInput";
import DeleteUserModal from "./core/DeleteUserModal";

const Container = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ProfileContent = () => {
  const userId = useUserId();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const handleProfileCallback = useCallback(
    ({ firstName, lastName }) => {
      setFirstName(firstName);
      setLastName(lastName);
    },
    [setFirstName, setLastName]
  );
  useEffect(() => {
    getProfile(userId).then(handleProfileCallback);
  }, [userId, handleProfileCallback]);
  return (
    <Container>
      <div>
        <PhotoInput />
        <Form
          handleResponse={handleProfileCallback}
          path="profile"
          extraProps={{ userId }}
          fields={[
            {
              defaultValue: firstName,
              placeholder: "First Name",
              name: "firstName",
              type: FieldType.TEXT,
            },
            {
              defaultValue: lastName,
              placeholder: "Last Name",
              name: "lastName",
              type: FieldType.TEXT,
            },
          ]}
        />
      </div>
      <DeleteUserModal />
    </Container>
  );
};

export default ProfileContent;
