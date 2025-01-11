import type { Instrument, InstrumentList } from '@finos/fdc3';
import type { DeliveryHookHandler } from '@connectifi/sdk';
import { ContextTypes } from '@finos/fdc3';
import { RequestError, ServerError } from '../types';
import { getExchangeAcronym, getExchangeName, getTickerInfo } from '../polygon';

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

const enhanceInstrument = async (
  apiKey: string,
  context: Instrument,
): Promise<Instrument> => {
  const tickerInfo = await getTickerInfo(apiKey, context.id?.ticker || '');
  if (tickerInfo) {
    const newContext: Instrument = { ...context };
    if (!newContext.name) {
      newContext.name = tickerInfo.name;
    }
    newContext.id.FIGI = tickerInfo.composite_figi;
    if (!newContext.market) {
      newContext.market = {};
    }
    newContext.market.COUNTRY_ISOALPHA2 = tickerInfo.locale;
    newContext.market.MIC = tickerInfo.primary_exchange;
    const exch = await getExchangeName(apiKey, tickerInfo.primary_exchange);
    if (exch) {
      newContext.market.name = exch.name;
    }
    const acronym = getExchangeAcronym(tickerInfo.primary_exchange);
    if (acronym) {
      newContext.market.acronym = acronym;
    }
    newContext.currency = tickerInfo.currency_name;
    return newContext;
  }
  return context;
};
