import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import { map, uniqBy, keyBy, find } from "lodash";
import {
  okResponse,
  userErrorResponse,
  getFieldByValue,
  parseFileName,
} from "../layers/util";
import { patientIdentifiers } from "../layers/enums";

type PatientForm = {
  name: string;
  size: number;
  type: string;
};

type PatientInfo = {
  forms: PatientForm[];
  identifiers: { [key: string]: string };
  dateOfBirth: string;
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const {
    userId,
    viewUserId,
    startTime,
    endTime,
  } = event.queryStringParameters;
  const viewUserIdInt = parseInt(viewUserId);
  const userIdInt = parseInt(userId);
  const client = new Client({
    host: process.env.REACT_APP_RDS_MASTER_HOST,
    user: "moonlight",
    password: process.env.REACT_APP_RDS_MASTER_USER_PASSWORD,
    database: "moonlight",
    query_timeout: 10000,
  });
  client.connect();
  return client
    .query(
      `SELECT e.*, p.date_of_birth, i.*, pr.first_name, pr.last_name, pf.name as form_name, pf.size FROM events e
       LEFT JOIN patient_event_links l ON e.id = l.event_id 
       LEFT JOIN patients p ON l.patient_id = p.id 
       LEFT JOIN patient_identifiers i ON i.patient_id = p.id
       LEFT JOIN patient_forms pf ON pf.patient_id = p.id
       LEFT JOIN profile pr ON pr.user_id = e.created_by
       WHERE e.user_id=$1 AND e.start_time >= $2 AND e.start_time < $3 AND (NOT e.is_pending OR e.created_by=$4 OR e.user_id=$4)`,
      [userIdInt, startTime, endTime, viewUserIdInt]
    )
    .then((res) => {
      client.end();
      const events = map(uniqBy(res.rows, "id"), (e) => {
        const IsReadonly =
          e.user_id != viewUserIdInt && e.created_by != viewUserIdInt;
        return {
          Subject: IsReadonly ? "BUSY" : e.subject,
          StartTime: e.start_time,
          EndTime: e.end_time,
          IsReadonly,
          Id: e.id,
          IsPending: e.is_pending,
          CreatedBy: e.created_by,
          Patients: {} as { [id: number]: PatientInfo },
          fullName: e.first_name + " " + e.last_name,
        };
      });
      const eventsById = keyBy(events, "Id");
      res.rows.forEach((r) => {
        if (!r.patient_id) {
          return;
        }
        const event = eventsById[r.id];
        if (!event.Patients[r.patient_id]) {
          event.Patients[r.patient_id] = {
            dateOfBirth: r.date_of_birth,
            forms: [] as PatientForm[],
            identifiers: {},
          };
        }
        if (r.type) {
          const key = getFieldByValue(patientIdentifiers, parseInt(r.type));
          event.Patients[r.patient_id].identifiers[key] = r.value;
        }
        const { name, type } = parseFileName(r.form_name);
        if (name && !find(event.Patients[r.patient_id].forms, { name })) {
          event.Patients[r.patient_id].forms.push({ name, type, size: r.size });
        }
      });
      return okResponse(events);
    })
    .catch((e) => userErrorResponse(e.message));
};
