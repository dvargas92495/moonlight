import { APIGatewayProxyEvent } from "aws-lambda";
import { s3, envName } from "../layers/aws";
import { serverErrorResponse, headers } from "../layers/util";
import { S3 } from "aws-sdk";
import fs from "fs";

export const handler = async (e: APIGatewayProxyEvent) => {
  const { id, name } = e.pathParameters;
  return s3
    .getObject({
      Bucket: `${envName}-patient-forms`,
      Key: `patient${id}/${name}`,
    })
    .promise()
    .then(({ Body, ContentType, LastModified }: S3.GetObjectOutput) => {
      const body = Body.toString();
      fs.writeFileSync(name, body);
      return {
        headers: {
          ...headers,
          "Content-Type": ContentType,
          "Content-Disposition": `attachment; filename=${name}`,
          "Last-Modified": LastModified,
          "Access-Control-Expose-Headers": "Content-Disposition",
        },
        body,
        statusCode: 200,
        isBase64Encoded: true,
      };
    })
    .catch((e) => serverErrorResponse(e.message));
};
