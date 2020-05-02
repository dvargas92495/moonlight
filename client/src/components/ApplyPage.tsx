import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Form, { FieldType } from "./core/Form";
import { PRIMARY_COLOR } from "../styles/colors";
import { useParams, useHistory } from "react-router-dom";
import PublicPage from "./PublicPage";
import { isEmpty } from "lodash";

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

const ApplyPage = () => {
  const [username, setUsername] = useState("");

  const { type } = useParams();

  const applyHandleResponse = useCallback(
    ({ username }) => setUsername(username),
    [setUsername]
  );
  return (
    <PublicPage>
      <Container>
        <Header>
          {username
            ? `Successfully applied as ${type}! The team will review your application, and if accepted, will send a temporary password to ${username}`
            : `Apply to Emdeo as ${type}`}
        </Header>
        <FormContainer>
          {isEmpty(username) && (
            <Form
              label="apply"
              path={`application/${type}`}
              handleResponse={applyHandleResponse}
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
              ]}
            />
          )}
        </FormContainer>
      </Container>
    </PublicPage>
  );
};

export default ApplyPage;
