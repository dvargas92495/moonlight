import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { signUp, confirmSignUp } from "../awsClients/apiClient";
import Input from "./Input";

const ErrorMessage = styled.span`
  color: red;
`;

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [uuid, setUuid] = useState(0);

  const signUpCallback = useCallback(() => {
    setLoading(true);
    signUp(username, password)
      .then(({ id }) => {
        setError("");
        setShowConfirmationCode(true);
        setUuid(id);
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
        setUserId(uuid);
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
    setUserId,
    uuid,
    signUpToggleCallback
  ]);
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
            <button onClick={confirmSignUpCallback}>Confirm</button>
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
