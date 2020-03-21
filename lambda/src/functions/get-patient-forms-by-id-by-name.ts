import { APIGatewayProxyEvent } from "aws-lambda";
import { s3 } from "../layers/aws";
import { serverErrorResponse, headers } from "../layers/util";
import { S3 } from "aws-sdk";

export const handler = async (e: APIGatewayProxyEvent) => {
    const { id, name } = e.pathParameters;
    return s3.getObject({
        Bucket: process.env.REACT_APP_S3_PATIENT_FORM_BUCKET,
        Key: `patient${id}/${name}`,
    }).promise().then(({
        Body,
        ContentType,
        LastModified,
    }: S3.GetObjectOutput) => ({
        headers: {
            ...headers,
            'Content-Type': ContentType,
            'Content-Disposition': 'attachment',
            'Last-Modified': LastModified,
        },
        body: Body,
        statusCode: 200,
        isBase64Encoded: true
    })).catch(e => serverErrorResponse(e.message));
}