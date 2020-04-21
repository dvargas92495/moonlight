import React, { useState, useCallback, useEffect } from "react";
import { getProfile } from "../hooks/apiClient";
import Form from "./syncfusion/Form";
import Input from "./syncfusion/Input";
import { useUserId } from "../hooks/router";
import styled from "styled-components";
import PhotoInput from "./syncfusion/PhotoInput";
import { useHistory } from "react-router-dom";
import DeletionModal from "./syncfusion/DeletionModal";

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
  const handleResponse = useCallback(
    () =>
      history.push("/", {
        userId: 0,
      }),
    [history]
  );
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
        >
          <Input
            defaultValue={firstName}
            placeholder="First Name"
            name="firstName"
          />
          <Input
            defaultValue={lastName}
            placeholder="Last Name"
            name="lastName"
          />
        </Form>
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
