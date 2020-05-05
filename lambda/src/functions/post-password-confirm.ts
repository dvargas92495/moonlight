import { APIGatewayProxyEvent } from "aws-lambda";
import {
  cognitoIdentityServiceProvider,
  createSecretHash,
  ClientId,
} from "../layers/aws";
import { emptyResponse, serverErrorResponse } from "../layers/util";

export const handler = (event: APIGatewayProxyEvent) => {
  const {
    username: Username,
    confirmationCode: ConfirmationCode,
    password: Password,
  } = JSON.parse(event.body);
  return cognitoIdentityServiceProvider
    .confirmForgotPassword({
      ClientId,
      Username,
      SecretHash: createSecretHash(Username + ClientId),
      ConfirmationCode,
      Password,
    })
    .promise()
    .then(() => emptyResponse())
    .catch((e) => serverErrorResponse(e.message));
};
