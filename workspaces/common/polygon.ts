import type { Context as FDC3Context, Instrument } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { POLYGON_TICKER_INFO_URL } from './constants';
import { awsResponse } from './utils';

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
    newContext.market.name = data.primary_exchange;  // TODO lookup name for code via polygon api
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
  }

  return awsResponse(400, {
    message: 'bad context type',
  });
}