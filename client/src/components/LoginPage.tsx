import React, { useCallback } from "react";
import Input from "./syncfusion/Input";
import PageLink from "./PageLink";
import { useHistory } from "react-router-dom";
import Form from "./syncfusion/Form";
import PublicPage from "./PublicPage";

type LoginPageProps = {
  setUserId: (userId: number) => void;
};

const LoginPage = ({ setUserId }: LoginPageProps) => {
  const history = useHistory();
  const handleResponse = useCallback(
    ({ id }) => {
      setUserId(id);
      history.push("/");
    },
    [history, setUserId]
  );
  return (
    <PublicPage>
      <Form handleResponse={handleResponse} label="log in" path="signin">
        <PageLink label="Home" path="/" />
        <Input placeholder="Email" name="username" />
        <Input placeholder="Password" type="password" name="password" />
      </Form>
    </PublicPage>
  );
};

export default LoginPage;
