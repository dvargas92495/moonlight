import { APIGatewayProxyEvent } from "aws-lambda";
import Busboy from "busboy";
import { pick, set, isEmpty } from "lodash";
import { s3, envName, connectRdsClient } from "../layers/aws";
import { okResponse, serverErrorResponse } from "../layers/util";

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
          body: { filename: string; file: Buffer; contentType: string };
        }
      ) => {
        const { id } = event.pathParameters;
        const { file, filename, contentType } = event.body;
        if (isEmpty(file)) {
          throw new Error(
            `Failed to parse any file content for ${filename} of type ${contentType}`
          );
        }
        const size = file.length;
        const client = connectRdsClient();
        return client
          .query("BEGIN")
          .then(() =>
            client.query(
              `INSERT INTO profile_photos(user_id, name, size)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id) 
                DO UPDATE SET name=excluded.name, size=excluded.size
             RETURNING *`,
              [id, filename, size]
            )
          )
          .then(() =>
            s3
              .putObject({
                Bucket: `${envName}-profile-photos`,
                Key: `user${id}/${filename}`,
                Body: file,
                ContentType: contentType,
              })
              .promise()
          )
          .then(() => client.query("COMMIT"))
          .then(() => client.end())
          .then(() =>
            okResponse({
              name: filename,
              size,
              contentType,
              file: file.toString("base64"),
            })
          )
          .catch((e) => {
            client.query("ROLLBACK");
            throw e;
          });
      }
    )
    .catch((e) => serverErrorResponse(e.message));
