import { map } from "lodash";
import {
  okResponse,
  serverErrorResponse,
  getFieldByValue,
} from "../layers/util";
import { connectRdsClient } from "../layers/aws";
import { applicationStatus, userType } from "../layers/enums";

export const handler = async () => {
  const client = connectRdsClient();
  return client
    .query(
      `SELECT * FROM applications
       WHERE status=($1)`,
      [applicationStatus.PENDING]
    )
    .then((res) => {
      client.end();
      return okResponse({
        applications: map(res.rows, (r) => ({
          username: r.username,
          firstName: r.first_name,
          lastName: r.last_name,
          type: getFieldByValue(userType, r.type),
        })),
      });
    })
    .catch((e) => serverErrorResponse(e.message));
};
