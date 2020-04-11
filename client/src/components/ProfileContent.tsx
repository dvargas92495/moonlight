import React, { useState, useCallback, useEffect } from "react";
import Modal from "react-modal";
import { getProfile, useApiDelete } from "../hooks/apiClient";
import Form from "./syncfusion/Form";
import Input from "./syncfusion/Input";
import { useUserId } from "../hooks/router";
import styled from "styled-components";
import PhotoInput from "./syncfusion/PhotoInput";
import Button from "./syncfusion/Button";
import RequestFeedback from "./RequestFeedback";
import { ROOT } from "../hooks/constants";
import {
  PRIMARY_BACKGROUND_COLOR,
  CONTENT_COLOR,
  THREE_QUARTER_OPAQUE,
  SECONDARY_BACKGROUND_COLOR,
} from "../styles/colors";
import { useHistory } from "react-router-dom";

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
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), [setIsOpen]);
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen]);
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
  const { loading, error, handleSubmit } = useApiDelete("user", handleResponse);
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
        <Button onClick={openModal}>Delete Account</Button>
        <Modal
          isOpen={isOpen}
          style={{
            overlay: {
              backgroundColor: `${PRIMARY_BACKGROUND_COLOR}${THREE_QUARTER_OPAQUE}`,
            },
            content: {
              position: "absolute",
              top: "40%",
              left: "35%",
              right: "35%",
              bottom: "40%",
              border: `1px solid ${CONTENT_COLOR}`,
              background: SECONDARY_BACKGROUND_COLOR,
              color: CONTENT_COLOR,
              borderRadius: "4px",
              outline: "none",
              padding: "16px",
              minWidth: "240px",
              minHeight: "120px",
            },
          }}
          appElement={document.querySelector(`#${ROOT}`) as HTMLElement}
        >
          <div>
            Are you sure you want to delete your user account? Note that all
            data associated with the account will be <b>permanently</b> deleted.
          </div>
          <Button isPrimary onClick={() => handleSubmit(userId)}>
            Submit
          </Button>
          <Button onClick={closeModal}>Cancel</Button>
          <RequestFeedback loading={loading} error={error} />
        </Modal>
      </DeleteUserContainer>
    </Container>
  );
};

export default ProfileContent;
