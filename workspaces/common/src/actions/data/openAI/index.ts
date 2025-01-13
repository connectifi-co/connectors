import type { DataActionHandler } from '@connectifi/sdk';
import {
  Prompt,
  RequestError,
  ServerError,
} from '../../../types';
import { generate } from './generate';
import { summarize } from './summarize';
import { findSimilar } from './findSimilar';

const apiKey = process.env.OPEN_AI_API_KEY;

export const openAIHandler: DataActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('openAI api key missing');
  }

  const { context, intent } = { ...params };
  if (
    intent !== 'Generate' &&
    intent !== 'FindSimilar' &&
    intent !== 'Summarize'
  ) {
    throw new RequestError('intent not supported');
  }

  if (intent === 'Generate') {
    const completion = await generate(apiKey, context as Prompt);
    return completion;
  } else if (intent === 'Summarize') {
    const summary = await summarize(apiKey, context);
    return summary;
  } else if (intent === 'FindSimilar') {
    const list = await findSimilar(apiKey, context);
    return list;
  }
};
