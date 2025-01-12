export const createResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body, null, 2),
  };
};

export async function handler() {
  return createResponse(200, {
    status: 'OK',
  });
}
