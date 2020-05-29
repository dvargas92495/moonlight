import faker from "faker";
import { Client } from "pg";
import { handler } from "../post-events";

jest.mock("pg");

let query: jest.Mock;
beforeEach(() => {
  query = new Client().query as jest.Mock;
});
afterEach(() => {
  jest.clearAllMocks();
});

test("Default event values", async () => {
  const userId = faker.random.number();
  const body = {
    userId,
    Subject: faker.random.word(),
    StartTime: new Date().toJSON(),
    EndTime: new Date().toJSON(),
  };
  const mockQuery = jest.spyOn(Client.prototype, "query");
  mockQuery
    .mockImplementationOnce(() => Promise.resolve())
    .mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ id: faker.random.number() }],
        rowCount: 0,
      })
    )
    .mockImplementationOnce(() => Promise.resolve());
  const response = await handler({ body: JSON.stringify(body) });

  expect(mockQuery).toHaveBeenCalledTimes(3);
  expect(mockQuery).toHaveBeenNthCalledWith(
    2,
    `
INSERT INTO events(user_id, created_by, subject, start_time, end_time, is_pending, notes, all_day)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id`,
    [
      userId,
      userId,
      body.Subject,
      body.StartTime,
      body.EndTime,
      false,
      "",
      false,
    ]
  );

  const responseBody = JSON.parse(response.body);
  expect(responseBody).toHaveProperty("notes", "");
  expect(responseBody).toHaveProperty("createdBy", userId);
  expect(responseBody).toHaveProperty("allDay", false);
});
