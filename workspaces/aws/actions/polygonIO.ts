import type { ActionRequest } from '../../common/types';
import { polygonIOHandler } from '../../common/actions/api/polygonIO/index';

export async function handler(event: any) {
  const apiKey = process.env.POLYGON_API_KEY || '';

  const { context, intent } = JSON.parse(event.body) as ActionRequest;

  return polygonIOHandler({ keys: { apiKey }, intent, context });
}
