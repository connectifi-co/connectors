import type { DeliveryHookRequest } from "../../common/lib/types"
import { polygonHook } from "../../common/hooks/polygonIO/index";

export async function handler(event:any) {

  const apiKey = process.env.POLYGON_API_KEY || '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return polygonHook({keys:{apiKey}, context, destinations});
}