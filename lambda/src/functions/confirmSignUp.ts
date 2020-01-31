import {
  createSecretHashObj,
  cognitoIdentityServiceProvider
} from "../layers/cognito";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username: Username, confirmationCode: ConfirmationCode } = JSON.parse(
    event.body
  );
  const hashObj = createSecretHashObj(Username);
  return cognitoIdentityServiceProvider
    .confirmSignUp({
      ...hashObj,
      ConfirmationCode,
      Username
    })
    .promise();
};
