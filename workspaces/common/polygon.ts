import type { Context as FDC3Context, Instrument, InstrumentList } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { POLYGON_TICKER_INFO_URL, POLYGON_EXCHANGE_INFO_URL } from './constants';
import { awsResponse } from './utils';

const exchangeAcronyms = [
  {
    mic: 'XNYS',
    acronym: 'NYSE',
  },
  {
    mic: 'XNAS',
    acronym: 'NASDAQ',
  },
];
const getExchangeAcronym = (mic: string): string | undefined => {
  const ex = exchangeAcronyms.find((ex:any) => ex.mic === mic);
  return ex && ex.acronym;
}

let exchangeData: [] | undefined = undefined;
const loadExchangeData = async (apiKey: string) => {
  const apiURL = `${POLYGON_EXCHANGE_INFO_URL}&apiKey=${apiKey}`;

  console.log(`calling polygon exchange info api: ${apiURL}`);

  const rHeaders = {
    "Content-Type": "text/plain",
    outputFormat: "application/json",
  };
  const resp = await fetch(apiURL, {
    headers: rHeaders,
    method: "GET",
  });
  const json: any = await resp.json();
  if (json.results) {
    exchangeData = json.results;
  }
}

const getExchangeName = async (apiKey: string, mic: string): Promise<any> => {
  if (!exchangeData) {
    await loadExchangeData(apiKey);
  }
  if (exchangeData) {
    return exchangeData.find((ex:any) => {
      return (
        ex.type === 'exchange' &&
        ex.mic === ex.operating_mic &&
        ex.mic === mic
      );
    });
  }
  return undefined;
}

const tickerCache: Map<string, any> = new Map<string, any>();
export const getTickerInfo = async (apiKey: string, ticker:string): Promise<any> => {
  const tickerKey = ticker.toUpperCase();
  if (tickerCache.has(tickerKey)) {
    console.log(`ticker: ${ticker} is in cache`);
    return tickerCache.get(tickerKey);
  }

  const apiURL = `${POLYGON_TICKER_INFO_URL}/${ticker}?apiKey=${apiKey}`;
  console.log(`ticker not cached, calling polygon api: ${apiURL}`);

  const rHeaders = {
    "Content-Type": "text/plain",
    outputFormat: "application/json",
  };
  const resp = await fetch(apiURL, {
    headers: rHeaders,
    method: "GET",
  });
  const json: any = await resp.json();
  const data = json.results;
  // console.log(`ticker response: ${JSON.stringify(data, null, 2)}`);
  if (data) {
    tickerCache.set(tickerKey, data);
    return data;
  }
  return undefined;
}

export const enahanceInstrument = async (apiKey: string, context:Instrument): Promise<Instrument> => {
  const tickerInfo = await getTickerInfo(apiKey, context.id?.ticker?.toUpperCase() || '')
  if (tickerInfo) {
    const newContext:Instrument = {...context};
    newContext.name = tickerInfo.name;
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
    newContext.address = tickerInfo.address;
    newContext.homepage_url = tickerInfo.homepage_url;
    return newContext;
  }
  return context;
}

export const polygonHook = async (apiKey: string, context:FDC3Context, destinations: string[]) => {
  if (context.type === ContextTypes.Instrument) {
    const newCtx = await enahanceInstrument(apiKey, context as Instrument);
    const changes = destinations.map(destination => ({
      destination,
      context: newCtx,
    }));

    return awsResponse(200, {changes});
  } else if (context.type === ContextTypes.InstrumentList) {
    const instruments = (context as InstrumentList).instruments;
    const newInstruments = await Promise.all(instruments.map((inst) => {
      return enahanceInstrument(apiKey, inst);
    }))
    const newCtx = {
      type: ContextTypes.InstrumentList,
      instruments: newInstruments,
    }
    const changes = destinations.map(destination => ({
      destination,
      context: newCtx,
    }));
    return awsResponse(200, {changes});
  }

  return awsResponse(400, {
    message: 'bad context type',
  });
}