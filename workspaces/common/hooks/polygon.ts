import type { Instrument, InstrumentList } from '@finos/fdc3';
import type { DeliveryHookHandler } from '@connectifi/sdk';
import { ContextTypes } from '@finos/fdc3';
import { enhanceInstrument } from './enhanceInstrument';
import { RequestError, ServerError } from '../../lib/types';

const apiKey = process.env.POLYGON_API_KEY;

export const polygonHook: DeliveryHookHandler = async (request) => {
  if (!apiKey) {
    throw new ServerError('polygon api key missing');
  }

  const { context } = request;
  if (
    context.type !== ContextTypes.Instrument &&
    context.type !== ContextTypes.InstrumentList
  ) {
    throw new RequestError('context type not supported');
  }

  if (context.type === ContextTypes.Instrument) {
    const newCtx = await enhanceInstrument(apiKey, context as Instrument);
    return { context: newCtx };
  } else if (context.type === ContextTypes.InstrumentList) {
    const instruments = (context as InstrumentList).instruments;
    const newInstruments = await Promise.all(
      instruments.map((inst) => {
        return enhanceInstrument(apiKey, inst);
      }),
    );
    return {
      context: {
        type: ContextTypes.InstrumentList,
        instruments: newInstruments,
      },
    };
  }
};
