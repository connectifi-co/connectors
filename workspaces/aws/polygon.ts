import type { DeliveryHookRequest } from "../common/types"
import { polygonHook } from "../common/polygon";

export async function handler(event:any) {

  const apiKey = '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return polygonHook(apiKey, context, destinations);
}