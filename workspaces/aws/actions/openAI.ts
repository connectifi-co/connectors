import type { ActionRequest } from '../../common/types';
import { openAIHandler } from '../../common/actions/api/openAI/index';

export async function handler(event: any) {
  const apiKey = process.env.OPEN_AI_API_KEY || '';

  const { context, intent } = JSON.parse(event.body) as ActionRequest;

  return openAIHandler({ keys: { apiKey }, intent, context });
}
