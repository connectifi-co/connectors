import { ActionHandler, Prompt } from '../../../types';
import { createResponse } from '../../../utils';
import { getPrice } from './getPrice';
import { getDetails } from './getDetails';

export const polygonIOHandler: ActionHandler = async (params) => {
  const { context, intent, keys } = { ...params };
  const apiKey = keys && keys['apiKey'];
  if (!apiKey) {
    return createResponse(400, {
      message: 'api key not found',
    });
  }
  if (intent === 'GetDetails') {
    const details = await getDetails(apiKey, context as Prompt);
    return createResponse(200, details);
  }

  if (intent === 'GetPrice') {
    const price = await getPrice(apiKey, context);
    return createResponse(200, price);
  }

  return createResponse(400, {
    message: 'intent not found',
  });
};
