import type { DeliveryHookRequest } from '@connectifi/sdk';
import { createResponse } from '../common/lib/utils';
import { addMiddleware } from '../common/lib/middleware';
import { deliveryHooksMap } from '../common/hooks';
import { RequestError } from '../common/lib/types';

const baseHandler = async (event: any) => {
  // look up delivery hook and invoke
  const hook = deliveryHooksMap.getHandler(event.pathParameters.hook);
  if (hook) {
    try {
      const hookResp = await hook(event.body as DeliveryHookRequest);
      return createResponse(200, hookResp);
    } catch (e) {
      const errCode = e instanceof RequestError ? 400 : 500;
      return createResponse(errCode, { error: e.message });
    }
  }

  // no hook, 404
  return createResponse(404, {
    message: 'delivery hook not found',
  });
};

export const handler = addMiddleware(baseHandler);
