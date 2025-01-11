import type { DeliveryHookRequest } from '../../common/lib/types';
import { slackHook } from '../../common/hooks/slack';

export async function handler(event: any) {
  const apiKey = process.env.SLACK_API_KEY || '';

  const { context, destinations } = JSON.parse(
    event.body,
  ) as DeliveryHookRequest;

  return slackHook({ keys: { apiKey }, context, destinations });
}
