import express, { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import bodyParser from "body-parser";
import cors from "cors";
import { reduce, keys, reject, forEach, split, slice, join } from "lodash";
import { isArray } from "util";
import { APIGatewayProxyEvent } from "aws-lambda";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.raw());

const transformHandler = (
  handler: (
    event: APIGatewayProxyEvent
  ) => Promise<{
    statusCode: number;
    body: string;
    headers: {
      "Access-Control-Allow-Origin": string;
      "Access-Control-Allow-Methods": string;
    };
    isBase64Encoded: boolean;
  }>
) => (req: Request<ParamsDictionary>, res: Response<any>) => {
  const event = {
    body: req.body,
    headers: reduce(
      reject(keys(req.headers), (header) => isArray(req.headers[header])),
      (acc, header) => ({ ...acc, [header]: req.headers[header] }),
      {}
    ),
    httpMethod: req.method,
    path: req.path,
    pathParameters: req.params,
    isBase64Encoded: true,
    queryStringParameters: req.query,
    multiValueHeaders: reduce(
      keys(req.headers),
      (acc, header) => ({
        ...acc,
        [header]: isArray(req.headers[header])
          ? req.headers[header]
          : [req.headers[header]],
      }),
      {}
    ),
    multiValueQueryStringParameters: req.query,
    stageVariables: {},
    requestContext: {
      accountId: "123456789012",
      apiId: "1234567890",
      httpMethod: "POST",
      identity: {
        accessKey: "",
        accountId: "",
        apiKey: "",
        apiKeyId: "",
        caller: "",
        cognitoAuthenticationProvider: "",
        cognitoAuthenticationType: "",
        cognitoIdentityId: "",
        cognitoIdentityPoolId: "",
        principalOrgId: "",
        sourceIp: "",
        user: "",
        userAgent: "",
        userArn: "",
      },
      path: req.path,
      stage: "prod",
      requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
      requestTimeEpoch: 0,
      resourceId: "123456",
      resourcePath: req.path,
    },
    resource: req.path,
  };
  Promise.resolve(handler(event))
    .then((r) => {
      forEach(r.headers, (value: string, header: string) =>
        res.setHeader(header, value)
      );
      res.status(r.statusCode).send(r.body);
    })
    .catch((e) => {
      res.status(500).send({ message: e.message });
    });
};

const lambdas = fs.readdirSync("./src/functions");
lambdas.forEach((lambda) => {
  const stripTs = lambda.substring(0, lambda.length - 3);
  const lambdaParts = split(stripTs, "-");
  const method = lambdaParts[0];
  const pathWithBy = `/api/${join(
    slice(lambdaParts, 1, lambdaParts.length),
    "/"
  )}`;
  const path = pathWithBy.replace(/\/by\//g, "/:");
  import("./functions/" + lambda).then((m) => {
    switch (method) {
      case "get":
        app.get(path, transformHandler(m.handler));
        break;
      case "post":
        app.post(path, transformHandler(m.handler));
        break;
      case "delete":
        app.delete(path, transformHandler(m.handler));
        break;
      case "put":
        app.put(path, transformHandler(m.handler));
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  });
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port " + port);
