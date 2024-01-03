import type { DeliveryHookRequest } from "../common/types"
import { slackHook } from "../common/slack";

export async function handler(event:any) {

  const apiKey = process.env.SLACK_API_KEY || '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return slackHook(apiKey, context, destinations);
}