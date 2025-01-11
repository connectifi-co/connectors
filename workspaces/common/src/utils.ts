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

export const cleanPostalCode = (code: string): string => {
  if (code) {
    const codeSplit = code.split('-');
    return codeSplit[0];
  }
  return code;
};
