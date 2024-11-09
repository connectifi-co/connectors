import type { Instrument } from '@finos/fdc3';
import { getExchangeAcronym, getExchangeName, getTickerInfo } from '../../lib/polygon';

const POLYGON_HOST = 'https://api.polygon.io';
export const POLYGON_TICKER_INFO_URL = `${POLYGON_HOST}/v3/reference/tickers`;

export const enhanceInstrument = async (apiKey: string, context: Instrument): Promise<Instrument> => {
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
