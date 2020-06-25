import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { ratesBySpecialists } from "../layers/specialists";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { name } = JSON.parse(event.body);
  const client = connectRdsClient();
  return client
    .query(
      `INSERT INTO offices(name)
      VALUES ($1)
      RETURNING *`,
      [name]
    )
    .then((res) => {
      client.end();
      const { name, default_rate, address, tax_id, contact, id } = res.rows[0];
      return okResponse({
        id,
        office: name,
        address,
        contact,
        taxId: tax_id,
        ...ratesBySpecialists(default_rate),
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
