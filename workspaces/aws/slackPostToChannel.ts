import type { DeliveryHookRequest } from "../common/types"
import { slackPostToChannelHook} from "../common/slackPostToChannel";

export async function handler(event:any) {

  const apiKey = process.env.SLACK_API_KEY || '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return slackPostToChannelHook(apiKey, context, destinations);
}