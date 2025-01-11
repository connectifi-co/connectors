import type { DeliveryHookRequest } from '../../common/lib/types';
import { openFIGIHook } from '../../common/hooks/openfigi';

export async function handler(event: any) {
  const apiKey = '';

  const { context, destinations } = JSON.parse(
    event.body,
  ) as DeliveryHookRequest;

  return openFIGIHook({ keys: { apiKey }, context, destinations });
}
