import type { IntentHookRequest } from "../common/types"
import { openAIHook } from "../common/openAI";


export async function handler(event:any) {

  const apiKey = process.env.OPEN_AI_API_KEY || '';

  const polygonKey = process.env.POLYGON_API_KEY || '';

  const { context, intent } = JSON.parse(event.body) as IntentHookRequest;

  return openAIHook(apiKey, polygonKey, intent, context);
}