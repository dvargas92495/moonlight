import React, { useCallback, useState } from "react";
import { useInputState } from "../hooks";
import { signIn } from "../awsClients/cognitoIdentityServiceProvider";
import Input from "./Input";
import PageLink from "./PageLink";
import { useHistory } from "react-router-dom";

type LoginPageProps = {
  setGlobalUuid: (uuid: string) => void;
};

const LoginPage = ({ setGlobalUuid }: LoginPageProps) => {
  const { value: username, setValue: setUsername } = useInputState("");
  const { value: password, setValue: setPassword } = useInputState("");
  const [error, setError] = useState("");
  const history = useHistory();
  const signInCallback = useCallback(
    () =>
      signIn(username, password)
        .then(({ uuid }) => {
          setGlobalUuid(uuid);
          history.push("/");
        })
        .catch(e => setError(e.message)),
    [username, password, history, setError, setGlobalUuid]
  );
  return (
    <>
      <PageLink label="Home" path="/" />
      <Input onChange={setUsername} label="Username" />
      <Input onChange={setPassword} label="Password" hideText />
      <div>
        <button onClick={signInCallback}>LOG IN</button>
      </div>
      {error && <div>{error}</div>}
    </>
  );
};

export default LoginPage;
