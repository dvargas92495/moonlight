import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { integrations } from "../layers/enums";

const linkTableByIntegrations = {
  [integrations.vCita]: "office_vcita_links",
};

const linkColumnByIntegrations = {
  [integrations.vCita]: "client_id",
};

export const handler = async (e: APIGatewayProxyEvent) => {
  const { integration, link, officeId } = JSON.parse(e.body);
  const id = parseInt(integration);
  const client = connectRdsClient();
  const column = linkColumnByIntegrations[id];
  const insert = `INSERT INTO ${linkTableByIntegrations[id]}(office_id, ${column}) 
  VALUES ($1, $2) 
  ON CONFLICT (office_id) 
  DO UPDATE SET ${column}=excluded.${column}
  `;
  return client
    .query(insert, [officeId, link])
    .then(() => {
      client.end();
      return okResponse({
        link,
        integration,
        officeId,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
