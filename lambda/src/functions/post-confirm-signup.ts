import {
  createSecretHashObj,
  cognitoIdentityServiceProvider
} from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";

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
    .promise()
    .then(() => okResponse({ success: true }))
    .catch(e => userErrorResponse(e.message));
};
