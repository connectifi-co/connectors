import type { ActionRequest } from '@/common/types';
import { addMiddleware } from '@/common/middleware';
import { actionsMap } from '@/common/actions';
import { RequestError } from '@/common/types';
import { createResponse } from '.';

const baseHandler = async (event: any) => {
  // look up action and invoke
  const action = actionsMap.getHandler(event.pathParameters.action);
  if (action) {
    try {
      const hookResp = await action(event.body as ActionRequest);
      return createResponse(200, hookResp);
    } catch (e) {
      const errCode = e instanceof RequestError ? 400 : 500;
      return createResponse(errCode, { error: e.message });
    }
  }

  // no hook, 404
  return createResponse(404, {
    message: 'action not found',
  });
};

export const handler = addMiddleware(baseHandler);
