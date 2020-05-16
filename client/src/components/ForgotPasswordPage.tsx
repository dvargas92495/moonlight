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
  const handleResponse = useCallback(() => setSent(true), [setSent]);
  return (
    <PublicPage>
      {sent ? (
        <Container>
          <Header>Check your email for a link to reset your password</Header>
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
