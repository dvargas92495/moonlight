import { APIGatewayProxyEvent } from "aws-lambda";
import { s3, connectRdsClient } from "../layers/aws";
import { serverErrorResponse, emptyResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id, name } = event.pathParameters;
  const client = connectRdsClient();
  return client
    .query("BEGIN")
    .then(() =>
      client.query(
        `DELETE FROM patient_forms
        WHERE patient_id=$1 AND name=$2`,
        [id, name]
      )
    )
    .then(() =>
      s3
        .deleteObject({
          Bucket: process.env.REACT_APP_S3_PATIENT_FORM_BUCKET,
          Key: `patient${id}/${name}`,
        })
        .promise()
    )
    .then(() => client.query("COMMIT"))
    .then(() => client.end())
    .then(() => emptyResponse())
    .catch((e) => {
      client.query("ROLLBACK");
      return serverErrorResponse(e.message);
    });
};
