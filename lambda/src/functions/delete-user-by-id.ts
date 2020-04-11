import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { emptyResponse, serverErrorResponse } from "../layers/util";
import { s3, envName } from "../layers/aws";
import { isEmpty } from "lodash";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
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
