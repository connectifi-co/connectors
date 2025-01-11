import { HTTPResponse } from './types';

export const createResponse = (statusCode: number, body: any): HTTPResponse => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body, null, 2),
  };
};
