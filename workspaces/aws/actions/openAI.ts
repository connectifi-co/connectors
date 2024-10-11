import type { ActionRequest } from "../../common/lib/types"
import { openAIHook } from "../../common/actions/api/openAI";


export async function handler(event:any) {

  const apiKey = process.env.OPEN_AI_API_KEY || '';

  const polygonKey = process.env.POLYGON_API_KEY || '';

  const { context, intent } = JSON.parse(event.body) as ActionRequest;

  return openAIHook({keys:{apiKey, polygonKey}, intent, context});
}