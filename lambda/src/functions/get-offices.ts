import { map } from "lodash";
import { okResponse, serverErrorResponse } from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { ratesBySpecialists, specialists } from "../layers/specialists";

export const handler = async () => {
  const client = connectRdsClient();
  return client
    .query(`SELECT * FROM offices`, [])
    .then((res) => {
      client.end();
      return okResponse({
        offices: map(res.rows, (r) => ({
          office: r.name,
          id: r.id,
          address: r.address,
          contact: r.contact,
          taxId: r.tax_id,
          ...ratesBySpecialists(r.default_rate),
        })),
        specialists,
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
