import type { Context } from '@finos/fdc3';
import { InstrumentPrice } from '../../../lib/types';

const POLYGON_HOST = 'https://api.polygon.io';
const POLYGON_SNAPSHOT_URL = `${POLYGON_HOST}/v2/snapshot/locale/us/markets/stocks/tickers`;
export const POLYGON_TICKER_INFO_URL = `${POLYGON_HOST}/v3/reference/tickers`;

export async function getPrice(apiKey: string, context: Context): Promise<InstrumentPrice> {
  const ticker: string = context.id?.ticker as string;
  if (!ticker) {
    return {
      type: 'connect.instrumentPrice',
      id: {
        ticker: 'unknown',
      },
      price: -1,
    };
  }
  const apiURL = `${POLYGON_SNAPSHOT_URL}/${ticker.toUpperCase()}?apiKey=${apiKey}`;
  console.log(`ticker not cached, calling polygon api: ${apiURL}`);

  const rHeaders = {
    'Content-Type': 'text/plain',
    outputFormat: 'application/json',
  };
  const resp = await fetch(apiURL, {
    headers: rHeaders,
    method: 'GET',
  });
  const json: any = await resp.json();
  const price = json.ticker.min.c !== 0 ? json.ticker.min.c : json.ticker.prevDay.c;
  return {
    type: 'connect.instrumentPrice',
    id: {
      ticker: ticker,
    },
    description: 'last quote',
    price: price,
  };
}



