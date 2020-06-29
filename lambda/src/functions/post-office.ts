import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { name = "", address = "", taxId = "", contact = "" } = JSON.parse(
    event.body
  );
  const client = connectRdsClient();
  return client
    .query(
      `INSERT INTO offices(name, address, tax_id, contact)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [name, address, taxId, contact]
    )
    .then((res) => {
      client.end();
      const { name, address, tax_id, contact, id } = res.rows[0];
      return okResponse({
        id,
        office: name,
        address,
        contact,
        taxId: tax_id,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
