import type { DeliveryHookRequest } from "../common/types"
import { polygonDataHook } from "../common/polygonData";

export async function handler(event:any) {

  const apiKey = process.env.POLYGON_API_KEY || '';

  const { intent, context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return polygonDataHook(apiKey, intent, context, destinations);
}