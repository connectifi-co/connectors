import type { Context as FDC3Context } from '@finos/fdc3';

export interface DeliveryHookRequest {
  context: FDC3Context;
  source: string;
  destinations: string[];
}

export interface IntentHookRequest {
  context: FDC3Context;
  intent: string;
  source: string;
  destination: string;
}