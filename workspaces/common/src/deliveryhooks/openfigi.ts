import { type Context, ContextTypes, type Instrument } from '@finos/fdc3';
import type { DeliveryHookHandler } from '@connectifi/sdk';
import { OPENFIGI_TICKER_INFO_URL } from '../constants';
import { RequestError, ServerError } from '../types';

const apiKey = process.env.OPENFIGI_API_KEY;

export const openFIGIHook: DeliveryHookHandler = async (request) => {
  if (!apiKey) {
    throw new ServerError('openfigi api key missing');
  }

  const { context } = request;
  if (context.type !== ContextTypes.Instrument) {
    throw new RequestError('context type not supported');
  }

  const newCtx = await enhanceInstrument(apiKey, context as Instrument);
  return { context: newCtx };
};

const enhanceInstrument = async (
  apiKey: string,
  context: Instrument,
): Promise<Context> => {
  const ticker = context.id.ticker;
  const req = {
    query: ticker,
    exchCode: 'US',
    securityType2: 'Common Stock',
  };
  const headers = {
    'Content-Type': 'application/json',
    'X-OPENFIGI-APIKEY': apiKey,
  };
  try {
    const res = await fetch(OPENFIGI_TICKER_INFO_URL, {
      method: 'POST',
      body: JSON.stringify(req),
      headers,
    });
    if (res.ok) {
      const newContext: Instrument = { ...context };
      const resJson: any = await res.json();
      const data = resJson.data?.[0];
      console.log('figi response', { resJson, data });
      if (data) {
        newContext.id.FIGI = data.figi;
        if (!newContext.name) {
          newContext.name = data.name;
        }
      }
      return newContext;
    } else {
      const errText = res.text();
      console.error('error response from open FIGI', {
        status: res.status,
        statusText: res.statusText,
        msg: errText,
      });
    }
  } catch (e) {
    console.error('error calling open FIGI api', { err: e });
  }
  return context;
};
