import React, { useCallback, useState } from "react";
import Form, { FieldType } from "./core/Form";
import PublicPage from "./PublicPage";
import styled from "styled-components";
import { PRIMARY_COLOR } from "../styles/colors";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

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
  const [passwordSet, setPasswordSet] = useState(false);
  const handlePasswordResponse = useCallback(() => setPasswordSet(true), [
    setPasswordSet,
  ]);
  const query = useLocation()?.search;
  const { confirm } = queryString.parse(query);
  return (
    <PublicPage>
      {passwordSet ? (
        <Container>
          <Header>Password successfully reset! Click above to log in</Header>
        </Container>
      ) : (
        <Container>
          <Header>Enter your new password below</Header>
          <FormContainer>
            <Form
              handleResponse={handlePasswordResponse}
              label="set password"
              path="password/confirm"
              extraProps={{ confirmationCode: confirm }}
              onValidate={(data) => {
                if (data.password !== data.confirmPassword) {
                  return ["Passwords must match"];
                }
                return [];
              }}
              fields={[
                {
                  placeholder: "Email",
                  name: "username",
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
        </Container>
      )}
    </PublicPage>
  );
};

export default PasswordResetPage;
