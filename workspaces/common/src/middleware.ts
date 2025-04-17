import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer'

export const addMiddleware = (handler: any) => {
  const mh = middy(handler);
  mh.use(httpJsonBodyParser())
  .use(httpHeaderNormalizer());
  return mh;
};
