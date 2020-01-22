import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { signUp, confirmSignUp } from "../awsClients/apiClient";
import { useInputState } from "../hooks";
import Input from "./Input";

const ErrorMessage = styled.span`
  color: red;
`;

type SignUpWidgetProps = {
  setGlobalUuid: (uuid: string) => void;
};

const SignUpWidget = ({ setGlobalUuid }: SignUpWidgetProps) => {
  const { value: username, setValue: setUsername } = useInputState("");
  const { value: password, setValue: setPassword } = useInputState("");
  const {
    value: confirmationCode,
    setValue: setConfirmationCode
  } = useInputState("");
  const [error, setError] = useState("");
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [uuid, setUuid] = useState("");

  const signUpCallback = useCallback(
    () =>
      signUp(username, password)
        .then(({ UserConfirmed, UserSub }) => {
          setError("");
          if (UserConfirmed) {
            setError("User email is already confirmed");
          } else {
            setShowConfirmationCode(true);
            setUuid(UserSub);
          }
        })
        .catch(e => setError(e.message)),
    [username, password, setError]
  );

  const confirmSignUpCallback = useCallback(
    () =>
      confirmSignUp(username, confirmationCode)
        .then(() => {
          setError("");
          setGlobalUuid(uuid);
        })
        .catch(e => setError(e.massage)),
    [username, confirmationCode, setError, setGlobalUuid, uuid]
  );
  return (
    <>
      {showConfirmationCode ? (
        <>
          <Input onChange={setConfirmationCode} label="Confirmation Code" />
          <div>
            <button onClick={confirmSignUpCallback}>Confirm</button>
          </div>
        </>
      ) : (
        <>
          <Input onChange={setUsername} label="Username" />
          <Input onChange={setPassword} label="Password" hideText={true} />
          <div>
            <button onClick={signUpCallback}>SIGN UP</button>
          </div>
        </>
      )}
      {error && (
        <div>
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      )}
    </>
  );
};

export default SignUpWidget;
