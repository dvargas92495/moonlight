import React, { useCallback, useState } from "react";
import Input from "./syncfusion/Input";
import Form from "./syncfusion/Form";

type SignUpWidgetProps = {
  setUserId: (userId: number) => void;
  signUpToggleCallback: () => void;
};

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
        <Form
          label="sign up"
          path="signup"
          handleResponse={signupHandleResponse}
        >
          <Input placeholder="Username" name="username" />
          <Input placeholder="Confirmation Code" name="confirmationCode" />
        </Form>
      ) : (
        <Form
          label="confirm"
          path="confirm-signup"
          handleResponse={confirmSignupHandleResponse}
        >
          <Input placeholder="Username" name="username" />
          <Input placeholder="Password" name="password" type="password" />
        </Form>
      )}
    </>
  );
};

export default SignUpWidget;
