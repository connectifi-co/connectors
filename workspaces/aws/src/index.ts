import { addMiddleware } from '@/common/middleware';
import { actionsMap } from '@/common/actions';
import { deliveryHooksMap } from '@/common/hooks';
import { RequestError } from '@/common/types';

// delivery hook handler function
export const deliveryHookHandler = addMiddleware(async (event: any) => {
  // look up delivery hook and invoke
  const hook = deliveryHooksMap.getHandler(event.pathParameters.hook);
  if (hook) {
    try {
      const hookResp = await hook(event.body);
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
});

// action (links and data-api) handler function
export const actionHandler = addMiddleware(async (event: any) => {
  // look up action and invoke
  const action = actionsMap.getHandler(event.pathParameters.action);
  if (action) {
    try {
      const hookResp = await action(event.body);
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
});

const createResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body, null, 2),
  };
};
