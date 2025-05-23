import type { DeliveryHookHandler } from '@connectifi/sdk';

import { openFIGIHook } from './openfigi';
import { polygonHook } from './polygon';

const DeliveryHooksMap = () => {
  const handlers: Map<string, DeliveryHookHandler> = new Map();

  return {
    addHandler: (name: string, dh: DeliveryHookHandler) =>
      handlers.set(name, dh),
    getHandler: (name: string) => handlers.get(name),
  };
};

const hooks = DeliveryHooksMap();
hooks.addHandler('openfigi', openFIGIHook);
hooks.addHandler('polygonIO', polygonHook);

export const deliveryHooksMap = hooks;
