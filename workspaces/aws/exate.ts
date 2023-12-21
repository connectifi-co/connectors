import type { DeliveryHookRequest } from "../common/types"
import { exateHook } from "../common/exate";

export async function handler(event:any) {

    const clientSecret = '';
    const clientId = '';
    const apiKey = '';

    const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

    return exateHook(apiKey, clientId, clientSecret, context, destinations);
}