import { APIGatewayProxyEvent } from "aws-lambda";
import { s3, envName, connectRdsClient } from "../layers/aws";
import {
  serverErrorResponse,
  headers,
  userErrorResponse,
} from "../layers/util";
import { S3 } from "aws-sdk";
import { isEmpty } from "lodash";

export const handler = async (e: APIGatewayProxyEvent) => {
  const { id } = e.pathParameters;
  const client = connectRdsClient();
  return client
    .query(
      `SELECT name FROM profile_photos
     WHERE user_id=$1`,
      [id]
    )
    .then((res) => {
      client.end();
      if (isEmpty(res.rows)) {
        return userErrorResponse("No Profile Photo");
      }
      return s3
        .getObject({
          Bucket: `${envName}-profile-photos`,
          Key: `user${id}/${res.rows[0].name}`,
        })
        .promise()
        .then(({ Body, ContentType, LastModified }: S3.GetObjectOutput) => {
          const body = Body.toString("base64");
          return {
            headers: {
              ...headers,
              "Content-Type": ContentType,
              "Last-Modified": LastModified,
            },
            body,
            statusCode: 200,
            isBase64Encoded: true,
          };
        });
    })
    .catch((e) => serverErrorResponse(e.message));
};
