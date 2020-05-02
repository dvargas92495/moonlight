import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, userErrorResponse } from "../layers/util";
import { userType } from "../layers/enums";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { username, firstName, lastName } = JSON.parse(event.body);
  const { type } = event.pathParameters;
  const key = type.toUpperCase() as string;
  if (!userType.hasOwnProperty(key)) {
    return userErrorResponse(`Tried to create a user of invalid type ${type}`);
  }
  const inputUserType = userType[key as keyof typeof userType];
  if (inputUserType === userType.SUPPORT) {
    return userErrorResponse("Cannot apply as a Support user");
  }

  const client = connectRdsClient();
  return client
    .query(
      "INSERT INTO applications(username, first_name, last_name, type) VALUES ($1, $2, $3, $4)",
      [username, firstName, lastName, inputUserType]
    )
    .then(() => {
      client.end();
      return okResponse({ username });
    })
    .catch((e) => userErrorResponse(e.message));
};
