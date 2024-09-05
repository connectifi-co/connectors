import type { DeliveryHookRequest } from "../common/types"
import { emailLink } from "../common/emailLink";

export async function handler(event:any) {
  const { context } = JSON.parse(event.body) as DeliveryHookRequest;

  return emailLink( context);
}