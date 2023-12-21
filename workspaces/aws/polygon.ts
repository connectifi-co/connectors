import type { DeliveryHookRequest } from "../common/types"
import { polygonHook } from "../common/polygon";

export async function handler(event:any) {

  const apiKey = process.env.POLYGON_API_KEY || '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return polygonHook(apiKey, context, destinations);
}