import type { DeliveryHookRequest } from "../common/types"
import { openFIGIHook } from "../common/openfigi";

export async function handler(event:any) {

  const apiKey = '';

  const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

  return openFIGIHook(apiKey, context, destinations);
}