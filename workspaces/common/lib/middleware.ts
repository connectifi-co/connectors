import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';

export const addMiddleware = (handler: any) => {
  const mh = middy(handler);
  mh.use(httpJsonBodyParser());
  return mh;
};
