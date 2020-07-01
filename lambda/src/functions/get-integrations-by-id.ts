import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { integrations } from "../layers/enums";
import { map } from "lodash";

const tablesByIntegrations = {
  [integrations.vCita]: "vcita_clients",
};

const selectByIntegrations = {
  [integrations.vCita]: "first_name",
};

export const handler = async (e: APIGatewayProxyEvent) => {
  const { id } = e.pathParameters;
  const integrationId = parseInt(id);
  const table = tablesByIntegrations[integrationId];
  const select = selectByIntegrations[integrationId];
  const client = connectRdsClient();
  return client
    .query(`SELECT ${select} as display FROM ${table}`)
    .then((res) => {
      client.end();
      return okResponse(map(res.rows, "display").sort());
    })
    .catch((e) => serverErrorResponse(e.message));
};
