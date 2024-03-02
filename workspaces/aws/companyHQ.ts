import type { DeliveryHookRequest } from "../common/types"
import { companyHQ } from "../common/companyHQ";

export async function handler(event:any) {

  const apiKey = process.env.POLYGON_API_KEY || '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return companyHQ(apiKey, context);
}