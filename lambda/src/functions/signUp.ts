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
    .promise()
    .then(({ UserConfirmed, UserSub }) => {
      if (UserConfirmed) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "User email is already confirmed" })
        };
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({ uuid: UserSub })
        };
      }
    })
    .catch(e => ({
      statusCode: 400,
      body: JSON.stringify({ message: e.message })
    }));
};
