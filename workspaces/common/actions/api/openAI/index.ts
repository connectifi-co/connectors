import { ActionHandler, Prompt } from '../../../lib/types';
import { createResponse } from '../../../lib/utils';
import { generate } from './generate';
import { generatePrompt } from './generatePrompt';
import { summarize } from './summarize';
import { findSimilar } from './findSimilar';
import { getEntities } from './getEntities';

export const openAIHandler: ActionHandler = async (params) => {
    const { context, intent, keys} = {...params};
    const apiKey = keys && keys['apiKey'];
    if (!apiKey){
      return createResponse(400, {
        message: 'api keys not found',
      });
    }
    if (intent === "Generate") {
        const completion = await generate(apiKey, context as Prompt);
        return createResponse(200, completion);
    }

    if (intent === "GeneratePrompt") {
      const prompt = await generatePrompt(apiKey, context);
      return createResponse(200, prompt);
  }
    if (intent === "Summarize") {
        const summary = await summarize(apiKey, context);
        return createResponse(200, summary);
    }

    if (intent === "FindSimilar"){
      const list = await findSimilar(apiKey, context);
      return createResponse(200, list);
    }

    if (intent === "GetEntities"){
      const entities = await getEntities(apiKey, context);
      return createResponse(200, entities);
    }
  
    return createResponse(400, {
      message: 'intent not found',
    });
  }