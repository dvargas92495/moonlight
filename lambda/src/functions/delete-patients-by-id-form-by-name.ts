import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { s3 } from "../layers/aws";
import { serverErrorResponse, emptyResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id, name } = event.pathParameters;
  const client = new Client({
    host: process.env.REACT_APP_RDS_MASTER_HOST,
    user: "moonlight",
    password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
    database: "moonlight",
    query_timeout: 10000,
  });
  client.connect();
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
    .then(() => emptyResponse())
    .catch((e) => {
      client.query("ROLLBACK");
      return serverErrorResponse(e.message);
    });
};
