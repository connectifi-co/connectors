import type { DeliveryHookRequest } from "../../common/lib/types"
import { exateHook } from "../../common/hooks/exate";

export async function handler(event:any) {

    const clientSecret = process.env.EXATE_CLIENT_SECRET || '';
    const clientId = process.env.EXATE_CLIENT_ID || '';
    const apiKey = process.env.EXATE_API_KEY || '';

    const { context, destinations } = JSON.parse(event.body) as DeliveryHookRequest;

    return exateHook({keys:{apiKey, clientId, clientSecret}, context, destinations});
}