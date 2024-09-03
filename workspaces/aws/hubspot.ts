import type { IntentHookRequest } from "../common/types"
import { hubspotHook } from "../common/hubspot";

export async function handler(event:any) {

  const apiKey = process.env.HUBSPOT_API_KEY || '';

  console.log('hubspot request', event.body);

  const { context, intent } = JSON.parse(event.body) as IntentHookRequest;

  return hubspotHook(apiKey, intent, context);
}