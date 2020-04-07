import React, { useState, useCallback, useEffect } from "react";
import { getProfile } from "../hooks/apiClient";
import Form from "./syncfusion/Form";
import Input from "./syncfusion/Input";
import { useUserId } from "../hooks/router";
import styled from "styled-components";
import PhotoInput from "./syncfusion/PhotoInput";

const Container = styled.div`
  padding: 32px;
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
    </Container>
  );
};

export default ProfileContent;
