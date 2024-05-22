import type { Context as FDC3Context } from '@finos/fdc3';

export interface DeliveryHookRequest {
  context: FDC3Context;
  intent: string;
  source: string;
  destinations: string[];
}
