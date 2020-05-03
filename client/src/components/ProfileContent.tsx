import React, { useState, useCallback, useEffect } from "react";
import { getProfile, clearAuth } from "../hooks/apiClient";
import Form, { FieldType } from "./core/Form";
import { useUserId } from "../hooks/router";
import styled from "styled-components";
import PhotoInput from "./core/PhotoInput";
import { useHistory } from "react-router-dom";
import DeletionModal from "./core/DeletionModal";

const Container = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const DeleteUserContainer = styled.div`
  display: flex;
`;

const ProfileContent = () => {
  const userId = useUserId();
  const history = useHistory();
  const handleResponse = useCallback(() => {
    clearAuth();
    history.push("/", {
      userId: 0,
    });
  }, [history]);
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
      <DeleteUserContainer>
        <DeletionModal
          openModalText={"Delete Account"}
          path={"user"}
          handleResponse={handleResponse}
          id={userId}
        >
          <div>
            Are you sure you want to delete your user account? Note that all
            data associated with the account will be <b>permanently</b> deleted.
          </div>
        </DeletionModal>
      </DeleteUserContainer>
    </Container>
  );
};

export default ProfileContent;
