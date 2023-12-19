import type { Context as FDC3Context } from '@finos/fdc3';

export interface DeliveryHookRequest {
  context: FDC3Context;
  source: string;
  destinations: string[];
}
