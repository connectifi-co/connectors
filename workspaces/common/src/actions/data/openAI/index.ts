import type { DataActionHandler } from '@connectifi/sdk';
import {
  Prompt,
  RequestError,
  ServerError,
} from '../../../types';
import { generate } from './generate';
import { summarize } from './summarize';
import { findSimilar } from './findSimilar';
import { generatePrompt } from './generatePrompt';
import { getEntities } from './getEntities';

const apiKey = process.env.OPEN_AI_API_KEY;

export const openAIHandler: DataActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('openAI api key missing');
  }
  
  const { context, intent } = { ...params };

  if (intent === "Generate") {
    const completion = await generate(apiKey, context as Prompt);
    return completion;
  }
  if (intent === "GeneratePrompt") {
    const prompt = await generatePrompt(apiKey, context);
    return prompt;
  }
  if (intent === "Summarize") {
      const summary = await summarize(apiKey, context);
      return summary;
  }
  if (intent === "FindSimilar"){
    const list = await findSimilar(apiKey, context);
    return list;
  }
  if (intent === "GetEntities"){
    const entities = await getEntities(apiKey, context);
    return entities;
  }

  throw new RequestError('intent not supported');
};
