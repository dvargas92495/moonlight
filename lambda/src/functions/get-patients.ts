import { APIGatewayProxyEvent } from "aws-lambda";
import {
  okResponse,
  serverErrorResponse,
  getFieldByValue,
} from "../layers/util";
import { patientIdentifiers } from "../layers/enums";
import { connectRdsClient } from "../layers/aws";
import { find, values } from "lodash";

type PatientForm = {
  name: string;
  size: number;
};

type PatientInfo = {
  forms: PatientForm[];
  identifiers: { [key: string]: string };
  dateOfBirth: string;
  id: number;
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const client = connectRdsClient();
  return client
    .query(
      `SELECT p.id, p.date_of_birth, i.*, pf.name as form_name, pf.size FROM patients p
     LEFT JOIN patient_identifiers i ON i.patient_id = p.id
     LEFT JOIN patient_forms pf ON pf.patient_id = p.id`
    )
    .then((res) => {
      client.end();
      const patients = {} as { [id: number]: PatientInfo };
      res.rows.forEach((r) => {
        const { id } = r;
        const patient = !!patients[id]
          ? patients[id]
          : {
              id,
              dateOfBirth: r.date_of_birth,
              forms: [] as PatientForm[],
              identifiers: {} as { [key: string]: string },
            };
        if (r.type) {
          const key = getFieldByValue(patientIdentifiers, parseInt(r.type));
          patient.identifiers[key] = r.value;
        }
        if (r.form_name && !find(patient.forms, { name: r.form_name })) {
          patient.forms.push({
            name: r.form_name,
            size: r.size,
          });
        }
        patients[id] = patient;
      });
      return okResponse(values(patients));
    })
    .catch((e) =>
      client.query("ROLLBACK").then(() => {
        client.end();
        return serverErrorResponse(e.message);
      })
    );
};
