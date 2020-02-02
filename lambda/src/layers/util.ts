const headers = {
  "Access-Control-Allow-Origin": "*"
};

export const okResponse = (body: object) => ({
  statusCode: 200,
  body: JSON.stringify(body),
  headers
});

export const userErrorResponse = (message: string) => ({
  statusCode: 400,
  body: JSON.stringify({ message }),
  headers
});
