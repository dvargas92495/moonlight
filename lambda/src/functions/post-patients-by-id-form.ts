import { APIGatewayProxyEvent } from "aws-lambda";
import Busboy from 'busboy';
import { pick, set } from 'lodash';
import { Client } from "pg";
import { s3 } from "../layers/aws";
import { emptyResponse, userErrorResponse } from "../layers/util";

export const handler = async (event: APIGatewayProxyEvent) => new Promise((resolve, reject) => {
    const busboy = new Busboy({
        headers: pick(event.headers,'content-type'),
    });
    const result = {};

    busboy.on('file', (_, file, filename, __, mimetype) => {
        file.on('data', data => set(result, 'file', data));
        file.on('end', () => {
            set(result, 'filename', filename);
            set(result, 'contentType', mimetype);
        });
    });

    busboy.on('field', (fieldname, value) => set(result, fieldname, value));

    busboy.on('error', reject);
    busboy.on('finish', () => resolve({ ...event, body: result }));

    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
}).then((event: Omit<APIGatewayProxyEvent, 'body'> & {body : {filename: string; file: string;}}) => {
    const { id } = event.pathParameters;
    const client = new Client({
        host: process.env.REACT_APP_RDS_MASTER_HOST,
        user: "moonlight",
        password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
        database: "moonlight",
        query_timeout: 10000
    });
    client.connect();
    return client.query('BEGIN')
        .then(() => client.query(
            `INSERT INTO patient_forms(patient_id, name)
             VALUES ($1, $2)
             RETURNING *`,
            [id, event.body.filename]
        ))
        .then(() => s3.putObject({
            Bucket: process.env.REACT_APP_S3_PATIENT_FORM_BUCKET,
            Key: `patient${id}/${event.body.filename}`,
            Body: event.body.file
        }).promise())
        .then(() => client.query('COMMIT'))
        .catch(e => {
            client.query('ROLLBACK');
            throw e;
        })
}).then(() => emptyResponse()).catch(e => userErrorResponse(e.message));