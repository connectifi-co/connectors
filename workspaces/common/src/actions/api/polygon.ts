import type { DataActionHandler } from '@connectifi/sdk';
import type { Context } from '@finos/fdc3';
import {
  CompanyDetails,
  InstrumentPrice,
  RequestError,
  ServerError,
} from '../../types';
import { getTickerInfo } from '../../polygon';
import { POLYGON_HOST } from '../../constants';

const POLYGON_SNAPSHOT_URL = `${POLYGON_HOST}/v2/snapshot/locale/us/markets/stocks/tickers`;

const apiKey = process.env.POLYGON_API_KEY;

export const polygonIOHandler: DataActionHandler = async (request) => {
  if (!apiKey) {
    throw new ServerError('polygonIO api key missing');
  }

  const { context, intent } = request;
  if (intent !== 'GetDetails' && intent !== 'GetPrice') {
    throw new RequestError('intent not supported');
  }

  if (intent === 'GetDetails') {
    const details = await getDetails(apiKey, context.id.ticker);
    return details;
  } else if (intent === 'GetPrice') {
    const price = await getPrice(apiKey, context);
    return price;
  }
};

async function getDetails(
  apiKey: string,
  ticker: string,
): Promise<CompanyDetails> {
  const details = await getTickerInfo(apiKey, ticker);
  const result: CompanyDetails = {
    type: 'connect.companyDetails',
    id: {
      ticker: details?.ticker || '',
      figi: details?.composite_figi || '',
    },
    name: details?.name || '',
    active: details?.active || false,
    primaryExchange: details?.primary_exchange || '',
    marketCap: details?.market_cap || -1,
    weightedSharesOutstanding: details?.weighted_shares_outstanding || -1,
    sicCode: details?.sic_code || '',
    sicDescription: details?.sic_description || '',
    totalEmployees: details?.total_employees || -1,
    currency: details?.currency || '',
    listDate: details?.list_date || '',
    description: details?.description || '',
    url: details?.homepage_url || '',
  };
  if (details?.address) {
    result.address = {
      street: details.address.address1,
      city: details.address.city,
      state: details.address.state,
      postalCode: details.address.postal_code,
    };
  }
  if (!result.active) {
    result.delistedDate = details?.delisted_utc;
  }
  return result;
}

async function getPrice(
  apiKey: string,
  context: Context,
): Promise<InstrumentPrice> {
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
  const price =
    json.ticker.min.c !== 0 ? json.ticker.min.c : json.ticker.prevDay.c;
  return {
    type: 'connect.instrumentPrice',
    id: {
      ticker: ticker,
    },
    description: 'last quote',
    price: price,
  };
}
