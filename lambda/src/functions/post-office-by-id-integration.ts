import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { integrations } from "../layers/enums";

const tablesByIntegrations = {
  [integrations.vCita]: "vcita_clients",
};

const selectByIntegrations = {
  [integrations.vCita]: "first_name as link, client_id as url",
};

const whereByIntegrations = {
  [integrations.vCita]: "first_name",
};

const linksTableByIntegrations = {
  [integrations.vCita]: "office_vcita_links(office_id, client_id)",
};

export const handler = async (e: APIGatewayProxyEvent) => {
  const { integration, link, officeId } = JSON.parse(e.body);
  const id = parseInt(integration);
  const client = connectRdsClient();
  const select = `SELECT ${selectByIntegrations[id]} FROM ${tablesByIntegrations[id]} WHERE ${whereByIntegrations[id]} = $1`;
  const insert = `INSERT INTO ${linksTableByIntegrations[id]} VALUES ($1, $2)`;
  return client
    .query(select, [link])
    .then((res) => client.query(insert, [officeId, res.rows[0].url]))
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
