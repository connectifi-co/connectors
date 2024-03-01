import type { Context as FDC3Context, Instrument, InstrumentList } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { POLYGON_TICKER_INFO_URL, POLYGON_EXCHANGE_INFO_URL } from './constants';
import { awsResponse } from './utils';



const tickerCache: Map<string, any> = new Map<string, any>();
export const getTickerInfo = async (apiKey: string, ticker:string): Promise<any> => {
  if (tickerCache.has(ticker)) {
    console.log(`ticker: ${ticker} is in cache`);
    return tickerCache.get(ticker);
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
    tickerCache.set(ticker, data);
    return data;
  }
  return undefined;
}

const enahanceInstrument = async (apiKey: string, context:Instrument): Promise<Instrument> => {
  const tickerInfo = await getTickerInfo(apiKey, context.id?.ticker?.toUpperCase() || '')
  if (tickerInfo) {
    const newContext:Instrument = {...context};
    newContext.name = tickerInfo.name;
   
    newContext.id.FIGI = tickerInfo.composite_figi;
    if (!newContext.market) {
      newContext.market = {};
    }

    newContext.currency = tickerInfo.currency_name;
    //add address
    newContext.address = tickerInfo.address;
    //add website
    //strip off http/https to make consumable as a smart link
    newContext.homepage_url = tickerInfo.homepage_url.startsWith("http://") ? tickerInfo.homepage_url.substr('http://'.length) : tickerInfo.homepage_url.substr('https://'.length);

    return newContext;
  }
  return context;
}

const cleanPostalCode = (code: string): string => {
    if (code) {
        const codeSplit = code.split('-');
        return codeSplit[0];
    }
    return code;
};

export const companyHQ = async (apiKey: string, context:FDC3Context) => {
  if (context.type === ContextTypes.Instrument) {
    const newCtx = await enahanceInstrument(apiKey, context as Instrument);
    let url = '';
    console.log(`get address from ${JSON.stringify(newCtx)}`);
    if (newCtx.address){
        url = `https://www.google.com/maps/search/${encodeURIComponent(newCtx.address.address1)},+${encodeURIComponent(newCtx.address.city)},+${encodeURIComponent(newCtx.address.state)}+${cleanPostalCode(newCtx.address.postal_code)}`
    } else {
        url = 'https://maps.google.com';
    }
    console.log(`url result: ${url}`);

    return awsResponse(200, {url});
  } 

  return awsResponse(400, {
    message: 'bad context type',
  });
}