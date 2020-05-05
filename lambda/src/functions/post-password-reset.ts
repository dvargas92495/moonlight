import { APIGatewayProxyEvent } from "aws-lambda";
import {
  cognitoIdentityServiceProvider,
  createSecretHash,
  ClientId,
} from "../layers/aws";
import { emptyResponse, serverErrorResponse } from "../layers/util";

export const handler = (event: APIGatewayProxyEvent) => {
  const { username: Username } = JSON.parse(event.body);
  return cognitoIdentityServiceProvider
    .forgotPassword({
      ClientId,
      Username,
      SecretHash: createSecretHash(Username + ClientId),
    })
    .promise()
    .then(() => emptyResponse())
    .catch((e) => serverErrorResponse(e.message));
};
