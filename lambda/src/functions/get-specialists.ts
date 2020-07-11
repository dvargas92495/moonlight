import { okResponse, userErrorResponse } from "../layers/util";
import { userType } from "../layers/enums";
import { connectRdsClient } from "../layers/aws";

export const handler = async () => {
  const client = connectRdsClient();
  return client
    .query(
      `SELECT u.id, CONCAT(p.first_name, ' ', p.last_name) as name, u.username as email 
       FROM users u
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE u.type = ($1)`,
      [userType.SPECIALIST]
    )
    .then((res) => {
      client.end();
      return okResponse({
        data: res.rows,
        page: 0,
        totalCount: res.rowCount,
      });
    })
    .catch((e) => userErrorResponse(e.message));
};
