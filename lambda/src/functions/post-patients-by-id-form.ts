import { APIGatewayProxyEvent } from "aws-lambda";
import Busboy from "busboy";
import { pick, set, split, omit, slice, join } from "lodash";
import { Client } from "pg";
import { s3 } from "../layers/aws";
import { userErrorResponse, okResponse, parseFileName } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) =>
  new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: pick(event.headers, "content-type"),
    });
    const result = {};

    busboy.on("file", (_, file, filename, __, mimetype) => {
      file.on("data", (data) => set(result, "file", data));
      file.on("end", () => {
        set(result, "filename", filename);
        set(result, "contentType", mimetype);
      });
    });

    busboy.on("field", (fieldname, value) => set(result, fieldname, value));

    busboy.on("error", reject);
    busboy.on("finish", () => resolve({ ...event, body: result }));

    busboy.write(event.body, event.isBase64Encoded ? "base64" : "binary");
    busboy.end();
  })
    .then(
      (
        event: Omit<APIGatewayProxyEvent, "body"> & {
          body: { filename: string; file: string };
        }
      ) => {
        const { id } = event.pathParameters;
        const { file, filename } = event.body;
        const { name, type } = parseFileName(filename);
        const size = file.length;
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
              `INSERT INTO patient_forms(patient_id, name, size)
             VALUES ($1, $2, $3)
             RETURNING *`,
              [id, filename, size]
            )
          )
          .then(() =>
            s3
              .putObject({
                Bucket: process.env.REACT_APP_S3_PATIENT_FORM_BUCKET,
                Key: `patient${id}/${filename}`,
                Body: file,
              })
              .promise()
          )
          .then(() => client.query("COMMIT"))
          .then(() => okResponse({ name, size, type }))
          .catch((e) => {
            client.query("ROLLBACK");
            throw e;
          });
      }
    )
    .catch((e) => userErrorResponse(e.message));
