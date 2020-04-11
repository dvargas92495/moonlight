import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Form, { FieldType } from "./syncfusion/Form";
import { PRIMARY_COLOR } from "../styles/colors";
import { useParams, useHistory } from "react-router-dom";
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
  text-transform: uppercase;
`;

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [userId, setUserId] = useState(0);

  const { type } = useParams();
  const history = useHistory();

  const signupHandleResponse = useCallback(
    ({ id, username }) => {
      setShowConfirmationCode(true);
      setUserId(id);
      setUsername(username);
    },
    [setShowConfirmationCode, setUserId, setUsername]
  );
  const confirmSignupHandleResponse = useCallback(() => {
    history.push(`/${type}`, { userId, type });
  }, [userId, type, history]);
  return (
    <PublicPage>
      <Container>
        <Header>
          {showConfirmationCode
            ? `Enter confirmation code from email`
            : `Sign up as ${type}`}
        </Header>
        <FormContainer>
          {showConfirmationCode ? (
            <Form
              label="confirm"
              path="confirm-signup"
              handleResponse={confirmSignupHandleResponse}
              extraProps={{ username }}
              fields={[
                {
                  placeholder: "Confirmation Code",
                  name: "confirmationCode",
                  required: true,
                  type: FieldType.TEXT,
                },
              ]}
            />
          ) : (
            <Form
              label="sign up"
              path="signup"
              handleResponse={signupHandleResponse}
              extraProps={{ type }}
              fields={[
                {
                  placeholder: "First Name",
                  name: "firstName",
                  required: true,
                  type: FieldType.TEXT,
                },
                {
                  placeholder: "Last Name",
                  name: "lastName",
                  required: true,
                  type: FieldType.TEXT,
                },
                {
                  placeholder: "Email",
                  name: "username",
                  required: true,
                  type: FieldType.TEXT,
                },
                {
                  placeholder: "Password",
                  name: "password",
                  required: true,
                  type: FieldType.PASSWORD,
                },
              ]}
            />
          )}
        </FormContainer>
      </Container>
    </PublicPage>
  );
};

export default SignupPage;
