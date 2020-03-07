import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Input from "./syncfusion/Input";
import Form from "./syncfusion/Form";

type SignUpWidgetProps = {
  setUserId: (userId: number) => void;
  signUpToggleCallback: () => void;
};

const StyledForm = styled(Form)`
  display: inline-block;
`;

const SignUpWidget = ({
  setUserId,
  signUpToggleCallback
}: SignUpWidgetProps) => {
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [uuid, setUuid] = useState(0);

  const signupHandleResponse = useCallback(
    ({ id }) => {
      setShowConfirmationCode(true);
      setUuid(id);
    },
    [setShowConfirmationCode, setUuid]
  );

  const confirmSignupHandleResponse = useCallback(() => {
    setUserId(uuid);
    signUpToggleCallback();
  }, [setUserId, uuid, signUpToggleCallback]);
  return (
    <>
      {showConfirmationCode ? (
        <StyledForm
          label="confirm"
          path="confirm-signup"
          handleResponse={confirmSignupHandleResponse}
        >
          <Input placeholder="Email" name="username" />
          <Input placeholder="Confirmation Code" name="confirmationCode" />
        </StyledForm>
      ) : (
        <StyledForm
          label="sign up"
          path="signup"
          handleResponse={signupHandleResponse}
        >
          <Input placeholder="Email" name="username" />
          <Input placeholder="Password" name="password" type="password" />
        </StyledForm>
      )}
    </>
  );
};

export default SignUpWidget;
