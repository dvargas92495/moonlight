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
  signUpToggleCallback: () => void;
};

const SignUpWidget = ({
  setGlobalUuid,
  signUpToggleCallback
}: SignUpWidgetProps) => {
  const { value: username, setValue: setUsername } = useInputState("");
  const { value: password, setValue: setPassword } = useInputState("");
  const {
    value: confirmationCode,
    setValue: setConfirmationCode
  } = useInputState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [uuid, setUuid] = useState("");

  const signUpCallback = useCallback(() => {
    setLoading(true);
    signUp(username, password)
      .then(({ uuid }) => {
        setError("");
        setShowConfirmationCode(true);
        setUuid(uuid);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [username, password, setError]);

  const confirmSignUpCallback = useCallback(() => {
    setLoading(true);
    confirmSignUp(username, confirmationCode)
      .then(() => {
        setError("");
        setGlobalUuid(uuid);
        signUpToggleCallback();
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [
    username,
    confirmationCode,
    setError,
    setGlobalUuid,
    uuid,
    signUpToggleCallback
  ]);
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
      {loading && <div>Loading...</div>}
      {error && (
        <div>
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      )}
    </>
  );
};

export default SignUpWidget;
