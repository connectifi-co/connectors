import type { DeliveryHookRequest } from "../common/types"
import { teamsLink } from "../common/teamsLink";


export async function handler(event:any) {

  const apiKey = process.env.OPEN_AI_API_KEY || '';

  const polygonKey = process.env.POLYGON_API_KEY || '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return teamsLink(apiKey, polygonKey, context);
}