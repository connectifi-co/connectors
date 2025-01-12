import { APIActionHandler, Prompt, RequestError, ServerError } from '../../../types';
import { createResponse } from '../../../utils';
import { generate } from './generate';
import { summarize } from './summarize';
import { findSimilar } from './findSimilar';

const apiKey = process.env.OPEN_AI_API_KEY;

export const openAIHandler: APIActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('openAI api key missing');
  }

  const { context, intent } = { ...params };
  if (intent === 'Generate') {
    const completion = await generate(apiKey, context as Prompt);
    return createResponse(200, completion);
  }
  if (intent !== 'Summarize' && intent !== 'FindSimilar') {
    throw new RequestError('intent not supported');
  }

  if (intent === 'Summarize') {
    const summary = await summarize(apiKey, context);
    return createResponse(200, summary);
  } else if (intent === 'FindSimilar') {
    const list = await findSimilar(apiKey, context);
    return createResponse(200, list);
  }
};
