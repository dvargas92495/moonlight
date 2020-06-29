import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const { name = "", address = "", taxId = "", contact = "" } = JSON.parse(
    event.body
  );
  const client = connectRdsClient();
  return client
    .query(
      `UPDATE offices
      SET name=$1, address=$2, tax_id=$3, contact=$4
      WHERE id=$5
      RETURNING *`,
      [name, address, taxId, contact, id]
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
