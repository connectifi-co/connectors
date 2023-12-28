import type { Context as FDC3Context, Instrument } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { POLYGON_TICKER_INFO_URL, POLYGON_EXCHANGE_INFO_URL } from './constants';
import { awsResponse } from './utils';
import { exchanges } from './exchangeData';

let exchangeData: Array<any>  = exchanges;
const loadExchangeData = async (apiKey: string) => {
  const apiURL = `${POLYGON_EXCHANGE_INFO_URL}&apiKey=${apiKey}`;

  console.log(`calling polygon api at: ${apiURL}`);

  const rHeaders = {
    "Content-Type": "text/plain",
    outputFormat: "application/json",
  };
  const resp = await fetch(apiURL, {
    headers: rHeaders,
    method: "GET",
  });
  const json: any = await resp.json();
  console.log(`exchange results ${JSON.stringify(json)}`);
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

const enahanceInstrument = async (apiKey: string, context:Instrument): Promise<Instrument> => {
  const apiURL = `${POLYGON_TICKER_INFO_URL}/${context.id?.ticker}?apiKey=${apiKey}`;

  console.log(`calling polygon api at: ${apiURL}`);

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

  console.log('polygon results', data);

  if (data) { 
    const newContext:Instrument = {...context};
    if (!newContext.name) {
      newContext.name = data.name;
    }
    newContext.id.FIGI = data.composite_figi;
    if (!newContext.market) {
      newContext.market = {};
    }
    newContext.market.COUNTRY_ISOALPHA2 = data.locale;
    newContext.market.MIC = data.primary_exchange;
    const exch = await getExchangeName(apiKey, data.primary_exchange);
    console.log(`got exchange ${JSON.stringify(exch)}`);
    if (exch) {
      newContext.market.name = exch.name;
      newContext.market.acronym = exch.acronym;
    }
    newContext.currency = data.currency_name;
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
    console.log(`polygon result ${JSON.stringify(changes)}`);
    return awsResponse(200, changes);
  }

  return awsResponse(400, {
    message: 'bad context type',
  });
}