import { createSecretHashObj, cognitoIdentityServiceProvider } from "../layers";

type RequestType = {
  username: string;
  confirmationCode: string;
};

export const handler = ({
  username: Username,
  confirmationCode: ConfirmationCode
}: RequestType) => {
  const hashObj = createSecretHashObj(Username);
  return cognitoIdentityServiceProvider
    .confirmSignUp({
      ...hashObj,
      ConfirmationCode,
      Username
    })
    .promise();
};
