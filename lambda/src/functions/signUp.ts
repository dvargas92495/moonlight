import {
  createSecretHashObj,
  cognitoIdentityServiceProvider
} from "../layers/cognito";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
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
        const client = new Client({
          host: process.env.REACT_APP_RDS_MASTER_HOST,
          user: process.env.REACT_APP_RDS_MASTER_USER,
          password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
          database: "moonlight",
          query_timeout: 10000
        });
        client.connect();
        return client
          .query("INSERT INTO users(uuid) VALUES ($1) RETURNING *", [UserSub])
          .then(res => {
            client.end();
            return okResponse(res.rows[0]);
          });
      }
    })
    .catch(e => userErrorResponse(e.message));
};
