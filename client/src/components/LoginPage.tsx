import React, { useCallback, useState } from "react";
import { signIn } from "../awsClients/apiClient";
import Input from "./Input";
import PageLink from "./PageLink";
import { useHistory } from "react-router-dom";

type LoginPageProps = {
  setUserId: (userId: number) => void;
};

const LoginPage = ({ setUserId }: LoginPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();
  const signInCallback = useCallback(
    () =>
      signIn(username, password)
        .then(({ id = 1 }) => {
          setUserId(id);
          history.push("/");
        })
        .catch(e => setError(e.message)),
    [username, password, history, setError, setUserId]
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
        <button onClick={signInCallback}>LOG IN</button>
      </div>
      {error && <div>{error}</div>}
    </>
  );
};

export default LoginPage;
