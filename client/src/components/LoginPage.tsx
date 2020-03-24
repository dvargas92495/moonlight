import React, { useCallback } from "react";
import Input from "./syncfusion/Input";
import { useHistory } from "react-router-dom";
import Form from "./syncfusion/Form";
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

const LoginPage = ({ setUserId }: {setUserId: (userId: number) => void}) => {
  const history = useHistory();
  const handleResponse = useCallback(
    ({ id, type }) => {
      setUserId(id);
      history.push(`/${type}`);
    },
    [history, setUserId]
  );
  return (
    <PublicPage>
      <Container>
        <Header>Sign In</Header>
        <FormContainer>
          <Form handleResponse={handleResponse} label="log in" path="signin">
            <Input placeholder="Email" name="username" />
            <Input placeholder="Password" type="password" name="password" />
          </Form>
        </FormContainer>
      </Container>
    </PublicPage>
  );
};

export default LoginPage;
