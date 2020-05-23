import { APIGatewayProxyEvent } from "aws-lambda";
import { okResponse, serverErrorResponse } from "../layers/util";
import { patientIdentifiers } from "../layers/enums";
import { connectRdsClient } from "../layers/aws";

export const handler = async (event: APIGatewayProxyEvent) => {
  const { firstName, lastName, dateOfBirth, email, phoneNumber } = JSON.parse(
    event.body
  );
  const client = connectRdsClient();
  return client
    .query("BEGIN")
    .then(() =>
      client.query(
        `INSERT INTO patients(date_of_birth)
      VALUES ($1)
      RETURNING *`,
        [dateOfBirth]
      )
    )
    .then((res) =>
      client.query(
        `INSERT INTO patient_identifiers(patient_id,type,value)
     VALUES ($1,$2,$3), ($1,$4,$5), ($1, $6, $7), ($1, $8, $9)
     RETURNING *
    `,
        [
          res.rows[0].id,
          patientIdentifiers.FIRST_NAME,
          firstName,
          patientIdentifiers.LAST_NAME,
          lastName,
          patientIdentifiers.EMAIL,
          email,
          patientIdentifiers.PHONE_NUMBER,
          phoneNumber,
        ]
      )
    )
    .then((res) =>
      client.query("COMMIT").then(() => {
        client.end();
        const { patient_id } = res.rows[0];
        return okResponse({
          patientId: patient_id,
          firstName,
          lastName,
          email,
          phoneNumber,
          dateOfBirth,
        });
      })
    )
    .catch((e) =>
      client.query("ROLLBACK").then(() => {
        client.end();
        return serverErrorResponse(e.message);
      })
    );
};
