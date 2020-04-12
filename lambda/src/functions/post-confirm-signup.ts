import {
  ClientId,
  createSecretHash,
  cognitoIdentityServiceProvider,
} from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username: Username, confirmationCode: ConfirmationCode } = JSON.parse(
    event.body
  );
  return cognitoIdentityServiceProvider
    .confirmSignUp({
      SecretHash: createSecretHash(Username + ClientId),
      ClientId,
      ConfirmationCode,
      Username,
    })
    .promise()
    .then(() => okResponse({ success: true }))
    .catch((e) => userErrorResponse(e.message));
};
