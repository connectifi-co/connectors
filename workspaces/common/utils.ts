export const awsResponse = (statusCode:number, body: any) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body, null, 2),
  }
}

