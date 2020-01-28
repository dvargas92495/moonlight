import {
  createSecretHashObj,
  cognitoIdentityServiceProvider
} from "../layers/cognito";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username: Username, password: Password } = JSON.parse(event.body);
  const hashObj = createSecretHashObj(Username);
  return cognitoIdentityServiceProvider
    .signUp({
      ...hashObj,
      Password,
      Username
    })
    .promise();
};
