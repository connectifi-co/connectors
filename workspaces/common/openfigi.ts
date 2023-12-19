import type { Context as FDC3Context, Instrument } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { OPENFIGI_TICKER_INFO_URL } from './constants';
import { awsResponse } from './utils';

export const addFIGIToInstrument = async (apiKey: string, context:Instrument):Promise<FDC3Context> => {
  const ticker = context.id.ticker;
  const req = {
    "query": ticker,
    "exchCode": "US",
    "securityType2": "Common Stock"
  }
  const headers = {
    "Content-Type": 'application/json',
    "X-OPENFIGI-APIKEY": apiKey,
  };
  try {
    const res = await fetch(OPENFIGI_TICKER_INFO_URL, { method: 'POST', body: JSON.stringify(req), headers});
    if (res.ok) {
      const newContext:Instrument = {...context};
      const resJson:any = await res.json();
      const data = resJson.data && resJson.data.length && resJson.data[0];
      console.log('figi response', {resJson, data})
      if (data) {
        newContext.id.FIGI = data.figi;
        if (!newContext.name) {
          newContext.name = data.name;
        }        
      }
      return newContext;
    } else {
      const errText = res.text();
      console.error('error response from open FIGI', {status: res.status, statusText: res.statusText, msg: errText});
    }
  } catch(e) {
    console.error('error calling open FIGI api', {err: e});
  }
  return context;
}

export const openFIGIHook = async (apiKey: string, context:FDC3Context, destinations: string[]) => {
  if (context.type === ContextTypes.Instrument) {
    const newCtx = await addFIGIToInstrument(apiKey, context as Instrument);
    const changes = destinations.map(destination => ({
      destination,
      context: newCtx,
    }));
  
    console.log('figi hook changes', {changes});
  
    return awsResponse(200, changes);
  }

  return awsResponse(400, {
    message: 'bad context type',
  });
}

