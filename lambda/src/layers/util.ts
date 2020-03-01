const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
};

export const okResponse = (body: object) => ({
  statusCode: 200,
  body: JSON.stringify(body),
  headers
});

export const emptyResponse = () => ({
  statusCode: 204,
  headers
});

export const userErrorResponse = (message: string) => ({
  statusCode: 400,
  body: JSON.stringify({ message }),
  headers
});
