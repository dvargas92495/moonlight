import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
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

const LoginPage = () => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const handleResponse = useCallback(
    ({ id, type, idToken, Session }) => {
      if (!id) {
        history.push("/password", {
          Session,
          username,
        });
      } else {
        setAuth(idToken);
        history.push(`/${type}`, {
          userId: id,
          type,
        });
      }
    },
    [history, username]
  );
  return (
    <PublicPage>
      <Container>
        <Header>Sign In</Header>
        <FormContainer>
          <Form
            handleResponse={handleResponse}
            label="log in"
            path="signin"
            fields={[
              {
                placeholder: "Email",
                name: "username",
                type: FieldType.TEXT,
                required: true,
                onChange: setUsername,
              },
              {
                placeholder: "Password",
                name: "password",
                type: FieldType.PASSWORD,
                required: true,
              },
            ]}
          />
        </FormContainer>
      </Container>
    </PublicPage>
  );
};

export default LoginPage;
