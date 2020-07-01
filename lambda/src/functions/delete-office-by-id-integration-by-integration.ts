import { APIGatewayProxyEvent } from "aws-lambda";
import { connectRdsClient } from "../layers/aws";
import { serverErrorResponse, emptyResponse } from "../layers/util";
import { integrations } from "../layers/enums";

const linkTableByIntegrations = {
  [integrations.vCita]: "office_vcita_links",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id, integration } = event.pathParameters;
  const integrationId = parseInt(integration);
  const client = connectRdsClient();
  return client
    .query(
      `DELETE FROM ${linkTableByIntegrations[integrationId]}
        WHERE office_id=$1`,
      [id]
    )
    .then(() => client.end())
    .then(() => emptyResponse())
    .catch((e) => serverErrorResponse(e.message));
};
