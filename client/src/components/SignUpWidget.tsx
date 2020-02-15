import React, { useCallback, useState } from "react";
import { signUp, confirmSignUp } from "../awsClients/apiClient";
import Input from "./Input";
import ApiButton from "./ApiButton";

type SignUpWidgetProps = {
  setUserId: (userId: number) => void;
  signUpToggleCallback: () => void;
};

const SignUpWidget = ({
  setUserId,
  signUpToggleCallback
}: SignUpWidgetProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [uuid, setUuid] = useState(0);

  const signUpCallback = useCallback(
    () =>
      signUp({ username, password }).then(({ id }) => {
        setShowConfirmationCode(true);
        setUuid(id);
      }),
    [username, password]
  );

  const confirmSignUpCallback = useCallback(
    () =>
      confirmSignUp(username, confirmationCode).then(() => {
        setUserId(uuid);
        signUpToggleCallback();
      }),
    [username, confirmationCode, setUserId, uuid, signUpToggleCallback]
  );
  return (
    <>
      {showConfirmationCode ? (
        <>
          <Input
            onChange={setConfirmationCode}
            label="Confirmation Code"
            value={confirmationCode}
          />
          <div>
            <ApiButton apiCall={confirmSignUpCallback} label="Confirm" />
          </div>
        </>
      ) : (
        <>
          <Input onChange={setUsername} label="Username" value={username} />
          <Input
            onChange={setPassword}
            label="Password"
            type="password"
            value={password}
          />
          <div>
            <ApiButton apiCall={signUpCallback} label="sign up" />
          </div>
        </>
      )}
    </>
  );
};

export default SignUpWidget;
