import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { APIGatewayProxyEvent } from "aws-lambda";
import { integrations } from "../layers/enums";

export const handler = async (e: APIGatewayProxyEvent) => {
  const { id } = e.pathParameters;
  const client = connectRdsClient();
  return client
    .query(
      `SELECT l.client_id as vcita FROM offices o
      LEFT JOIN office_vcita_links l ON l.office_id = o.id
      LEFT JOIN vcita_clients v ON l.client_id = v.client_id
      WHERE id = $1`,
      [id]
    )
    .then((res) => {
      client.end();
      const office = res.rows[0];
      const vCitaIntegration = office.vcita
        ? [
            {
              integration: integrations.vCita,
              link: office.vcita,
              url: `https://app.vcita.com/app/clients/${office.vcita}`,
            },
          ]
        : [];
      return okResponse({
        data: [...vCitaIntegration],
        page: 0,
        totalCount: res.rows.length,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
