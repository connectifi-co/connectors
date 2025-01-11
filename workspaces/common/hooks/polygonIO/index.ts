import type { Instrument, InstrumentList } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { createResponse } from '../../lib/utils';
import { enhanceInstrument } from './enhanceInstrument';
import { DeliveryHookHandler } from '../../lib/types';

export const polygonHook: DeliveryHookHandler = async (params) => {
  const { keys, context, destinations } = { ...params };
  const apiKey = keys?.['apiKey'];
  if (!apiKey) {
    return createResponse(400, {
      message: 'api key not provided',
    });
  }
  if (context.type === ContextTypes.Instrument) {
    const newCtx = await enhanceInstrument(apiKey, context as Instrument);
    const changes = destinations.map((destination) => ({
      destination,
      context: newCtx,
    }));

    return createResponse(200, { changes });
  } else if (context.type === ContextTypes.InstrumentList) {
    const instruments = (context as InstrumentList).instruments;
    const newInstruments = await Promise.all(
      instruments.map((inst) => {
        return enhanceInstrument(apiKey, inst);
      }),
    );
    const newCtx = {
      type: ContextTypes.InstrumentList,
      instruments: newInstruments,
    };
    const changes = destinations.map((destination) => ({
      destination,
      context: newCtx,
    }));
    return createResponse(200, { changes });
  }

  return createResponse(400, {
    message: 'bad context type',
  });
};
