import React, { useCallback, useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Form, { FieldType } from "./core/Form";
import PublicPage from "./PublicPage";
import styled from "styled-components";
import { PRIMARY_COLOR } from "../styles/colors";
import api, { setAuth } from "../hooks/apiClient";
import queryString from "query-string";

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
  const { state, search } = useLocation();
  const [username, setUsername] = useState(state?.username);
  const [session, setSession] = useState(state?.Session);
  const [loading, setLoading] = useState(!session);
  const [error, setError] = useState("");
  const usernameFromQuery = queryString.parse(search)?.username;
  const temporaryPassword = queryString.parse(search)?.temporary;
  useEffect(() => {
    if (loading) {
      api
        .post("signin", {
          username: usernameFromQuery,
          password: temporaryPassword,
        })
        .then((res) => {
          setUsername(usernameFromQuery);
          setSession(res.data.Session);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setError(
            "Temporary link failed, contact Support to retrieve another link"
          );
        });
    }
  }, [
    loading,
    usernameFromQuery,
    temporaryPassword,
    setSession,
    setUsername,
    setLoading,
  ]);
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
  return loading ? (
    <div>Loading...</div>
  ) : error ? (
    <div>{error}</div>
  ) : (
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
              Session: session,
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
