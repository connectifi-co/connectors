import { ActionHandler, Prompt } from '../../../types';
import { createResponse } from '../../../utils';
import { generate } from './generate';
import { summarize } from './summarize';
import { findSimilar } from './findSimilar';

export const openAIHandler: ActionHandler = async (params) => {
  const { context, intent, keys } = { ...params };
  const apiKey = keys?.['apiKey'];
  if (!apiKey) {
    return createResponse(400, {
      message: 'api keys not found',
    });
  }
  if (intent === 'Generate') {
    const completion = await generate(apiKey, context as Prompt);
    return createResponse(200, completion);
  }

  if (intent === 'Summarize') {
    const summary = await summarize(apiKey, context);
    return createResponse(200, summary);
  }

  if (intent === 'FindSimilar') {
    const list = await findSimilar(apiKey, context);
    return createResponse(200, list);
  }

  return createResponse(400, {
    message: 'intent not found',
  });
};
