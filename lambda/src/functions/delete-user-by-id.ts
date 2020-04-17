import { APIGatewayProxyEvent } from "aws-lambda";
import { emptyResponse, serverErrorResponse } from "../layers/util";
import {
  s3,
  envName,
  ClientId,
  cognitoIdentityServiceProvider,
  createSecretHash,
  connectRdsClient,
} from "../layers/aws";
import { isEmpty } from "lodash";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const client = connectRdsClient();
  return client
    .query("BEGIN")
    .then(() =>
      client
        .query(`SELECT name FROM profile_photos WHERE user_id=$1`, [id])
        .then(
          (res) =>
            !isEmpty(res.rows) &&
            s3
              .deleteObject({
                Bucket: `${envName}-profile-photos`,
                Key: `user${id}/${res.rows[0].name}`,
              })
              .promise()
        )
    )
    .then(() =>
      client
        .query(
          `
        SELECT t.token, u.uuid 
        FROM refresh_tokens t
        INNER JOIN users u ON u.id=t.user_id
        WHERE t.user_id=$1`,
          [id]
        )
        .then((res) =>
          cognitoIdentityServiceProvider
            .initiateAuth({
              AuthFlow: "REFRESH_TOKEN_AUTH",
              ClientId,
              AuthParameters: {
                SECRET_HASH: createSecretHash(res.rows[0].uuid + ClientId),
                REFRESH_TOKEN: res.rows[0].token,
              },
            })
            .promise()
        )
    )
    .then(({ AuthenticationResult: { AccessToken } }) =>
      cognitoIdentityServiceProvider.deleteUser({ AccessToken }).promise()
    )
    .then(() =>
      client.query(
        `DELETE FROM users
        WHERE id=$1`,
        [id]
      )
    )
    .then(() => client.query("COMMIT"))
    .then(() => {
      client.end();
      return emptyResponse();
    })
    .catch((e) => serverErrorResponse(e.message));
};
