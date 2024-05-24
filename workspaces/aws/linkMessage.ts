import type { DeliveryHookRequest } from "../common/types"
import { linkMessageHook } from "../common/linkMessage";

export async function handler(event:any) {

  const apiKey = process.env.OPEN_AI_API_KEY || "";

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return linkMessageHook(apiKey, context, destinations);
}