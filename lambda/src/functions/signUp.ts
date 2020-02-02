import {
  createSecretHashObj,
  cognitoIdentityServiceProvider
} from "../layers/cognito";
import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username: Username, password: Password } = JSON.parse(event.body);
  const hashObj = createSecretHashObj(Username);
  return cognitoIdentityServiceProvider
    .signUp({
      ...hashObj,
      Password,
      Username
    })
    .promise()
    .then(({ UserConfirmed, UserSub }) => {
      if (UserConfirmed) {
        return userErrorResponse("User email is already confirmed");
      } else {
        return okResponse({ uuid: UserSub });
      }
    })
    .catch(e => userErrorResponse(e.message));
};
