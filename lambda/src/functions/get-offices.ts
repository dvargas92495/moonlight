import { map, sortBy } from "lodash";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";

export const handler = async () => {
  const client = connectRdsClient();
  return client
    .query(`SELECT * FROM offices`, [])
    .then((res) => {
      client.end();
      return okResponse({
        data: sortBy(
          map(res.rows, (r) => ({
            name: r.name,
            id: r.id,
            address: r.address,
            contact: r.contact,
            taxId: r.tax_id,
          })),
          "name"
        ),
        page: 0,
        totalCount: res.rows.length,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
