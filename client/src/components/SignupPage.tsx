import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Input from "./syncfusion/Input";
import Form from "./syncfusion/Form";
import { PRIMARY_COLOR } from "../styles/colors";
import { useParams } from "react-router-dom";
import PublicPage from "./PublicPage";

const Container = styled.div`
  max-width: 450px;
  max-height: 600px;
  margin: 100px auto;
  text-align: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const FormContainer = styled.div`
  text-align: center;
  display: flex;
  justify-content: center;
`;

const Header = styled.h2`
  color: ${PRIMARY_COLOR};
`;

const SignupPage = ({
  setUserId,
}: {
  setUserId: (userId: number) => void;
}) => {
  const [username, setUsername] = useState("");
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [uuid, setUuid] = useState(0);

  const signupHandleResponse = useCallback(
    ({ id }) => {
      setShowConfirmationCode(true);
      setUuid(id);
      setUsername("");
    },
    [setShowConfirmationCode, setUuid, setUsername]
  );

  const confirmSignupHandleResponse = useCallback(() => {
    setUserId(uuid);
  }, [setUserId, uuid]);
  const { type } = useParams();
  return (
    <PublicPage>
      <Container>
        <Header>{`Sign up as ${type}`}</Header>
        <FormContainer>
          {showConfirmationCode ? (
            <Form
              label="confirm"
              path="confirm-signup"
              handleResponse={confirmSignupHandleResponse}
              extraProps={{ username }}
            >
              <Input placeholder="Confirmation Code" name="confirmationCode" />
            </Form>
          ) : (
            <Form
              label="sign up"
              path="signup"
              handleResponse={signupHandleResponse}
            >
              <Input placeholder="First Name" name="firstName" />
              <Input placeholder="Last Name" name="lastName" />
              <Input placeholder="Email" name="username" />
              <Input placeholder="Password" name="password" type="password" />
            </Form>
          )}
        </FormContainer>
      </Container>
    </PublicPage>
  );
};

export default SignupPage;
