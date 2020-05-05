import React, { useCallback, useState } from "react";
import Form, { FieldType } from "./core/Form";
import PublicPage from "./PublicPage";
import styled from "styled-components";
import { PRIMARY_COLOR } from "../styles/colors";

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

const PasswordResetPage = () => {
  const [sent, setSent] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);
  const [username, setUsername] = useState("");
  const handleResponse = useCallback(() => setSent(true), [setSent]);
  const handlePasswordResponse = useCallback(() => setPasswordSet(true), [
    setPasswordSet,
  ]);
  return (
    <PublicPage>
      {sent ? (
        <Container>
          <Header>
            {passwordSet
              ? "Password successfully reset! Click above to log in"
              : "Check your email for a confirmation code and enter your new password below."}
          </Header>
          {!passwordSet && (
            <FormContainer>
              <Form
                handleResponse={handlePasswordResponse}
                label="set password"
                path="password/confirm"
                extraProps={{ username }}
                onValidate={(data) => {
                  if (data.password !== data.confirmPassword) {
                    return ["Passwords must match"];
                  }
                  return [];
                }}
                fields={[
                  {
                    placeholder: "Confirmation Code",
                    name: "confirmationCode",
                    type: FieldType.TEXT,
                    required: true,
                  },
                  {
                    placeholder: "New Password",
                    name: "password",
                    type: FieldType.PASSWORD,
                    required: true,
                  },
                  {
                    placeholder: "Confirm Password",
                    name: "confirmPassword",
                    type: FieldType.PASSWORD,
                    required: true,
                    skip: true,
                  },
                ]}
              />
            </FormContainer>
          )}
        </Container>
      ) : (
        <Container>
          <Header>Reset Password</Header>
          <FormContainer>
            <Form
              handleResponse={handleResponse}
              label="reset password"
              path="password/reset"
              fields={[
                {
                  placeholder: "Email",
                  name: "username",
                  type: FieldType.TEXT,
                  required: true,
                  onChange: setUsername,
                },
              ]}
            />
          </FormContainer>
        </Container>
      )}
    </PublicPage>
  );
};

export default PasswordResetPage;
