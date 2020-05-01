import React, { useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Form, { FieldType } from "./core/Form";
import PublicPage from "./PublicPage";
import styled from "styled-components";
import { PRIMARY_COLOR } from "../styles/colors";
import { setAuth } from "../hooks/apiClient";

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

const NewPasswordPage = () => {
  const history = useHistory();
  const {
    state: { Session, username },
  } = useLocation();
  const handleResponse = useCallback(
    ({ id, type, idToken }) => {
      setAuth(idToken);
      history.push(`/${type}`, {
        userId: id,
        type,
      });
    },
    [history]
  );
  return (
    <PublicPage>
      <Container>
        <Header>Set New Password</Header>
        <FormContainer>
          <Form
            handleResponse={handleResponse}
            label="set password"
            path="password"
            onValidate={(data) => {
              if (data.password !== data.confirmPassword) {
                return ["Passwords must match!"];
              }
              return [];
            }}
            extraProps={{
              Session,
              username,
            }}
            fields={[
              {
                placeholder: "Password",
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
    </PublicPage>
  );
};

export default NewPasswordPage;
