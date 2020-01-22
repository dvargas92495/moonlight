import { createSecretHashObj, cognitoIdentityServiceProvider } from "../layers";

type RequestType = {
  username: string;
  password: string;
};

export const handler = ({
  username: Username,
  password: Password
}: RequestType) => {
  const hashObj = createSecretHashObj(Username);
  return cognitoIdentityServiceProvider
    .signUp({
      ...hashObj,
      Password,
      Username
    })
    .promise();
};
