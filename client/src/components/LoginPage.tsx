import React, { useCallback, useState } from "react";
import { signIn } from "../awsClients/apiClient";
import Input from "./Input";
import PageLink from "./PageLink";
import { useHistory } from "react-router-dom";
import ApiButton from "./ApiButton";

type LoginPageProps = {
  setUserId: (userId: number) => void;
};

const LoginPage = ({ setUserId }: LoginPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();
  const signInCallback = useCallback(
    () =>
      signIn(username, password).then(({ id }) => {
        setUserId(id);
        history.push("/");
      }),
    [username, password, history, setUserId]
  );
  return (
    <>
      <PageLink label="Home" path="/" />
      <Input onChange={setUsername} label="Username" value={username} />
      <Input
        onChange={setPassword}
        label="Password"
        type="password"
        value={password}
      />
      <div>
        <ApiButton apiCall={signInCallback} label="log in" />
      </div>
    </>
  );
};

export default LoginPage;
