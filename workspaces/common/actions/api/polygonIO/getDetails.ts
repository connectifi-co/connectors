import type { Context } from '@finos/fdc3';
import { CompanyDetails } from '../../../lib/types';
import {
  POLYGON_EXCHANGE_INFO_URL,
  POLYGON_TICKER_INFO_URL,
} from '../../../lib/constants';

const mapTickerDetails = (details: any): CompanyDetails => {
  const result: CompanyDetails = {
    type: 'connect.companyDetails',
    id: {
      ticker: details.ticker,
      figi: details.composite_figi,
    },
    name: details.name,
    active: details.active,
    primaryExchange: details.primary_exchange,
    marketCap: details.market_cap,
    weightedSharesOutstanding: details.weighted_shares_outstanding,
    sicCode: details.sic_code,
    sicDescription: details.sic_description,
    totalEmployees: details.total_employees,
    currency: details.currency,
    listDate: details.list_date,
    description: details.description,
    url: details.homepage_url,
  };
  if (details.address) {
    result.address = {
      street: details.address.address1,
      city: details.address.city,
      state: details.address.state,
      postalCode: details.address.postal_code,
    };
  }
  if (!result.active) {
    result.delistedDate = details.delisted_utc;
  }
  return result;
};

export async function getDetails(
  apiKey: string,
  context: Context,
): Promise<CompanyDetails> {
  const ticker: string = context.id?.ticker as string;
  if (ticker) {
    const result = await getTickerInfo(apiKey, ticker);
    if (result) {
      return mapTickerDetails(result);
    }
  }
  return {
    type: 'connect.companyDetails',
    id: {
      ticker: 'unknown',
    },
    name: 'Unknown',
    active: false,
    primaryExchange: '',
    marketCap: -1,
    weightedSharesOutstanding: -1,
    sicCode: '',
    sicDescription: '',
    totalEmployees: -1,
    currency: '',
    listDate: '',
    description: '',
    url: '',
  };
}

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
export const getExchangeAcronym = (mic: string): string => {
  const ex = exchangeAcronyms.find((ex: any) => ex.mic === mic);
  return ex?.acronym || '';
};

let exchangeData: [] | undefined = undefined;
const loadExchangeData = async (apiKey: string) => {
  const apiURL = `${POLYGON_EXCHANGE_INFO_URL}&apiKey=${apiKey}`;

  console.log(`calling polygon exchange info api: ${apiURL}`);

  const rHeaders = {
    'Content-Type': 'text/plain',
    outputFormat: 'application/json',
  };
  const resp = await fetch(apiURL, {
    headers: rHeaders,
    method: 'GET',
  });
  const json: any = await resp.json();
  if (json.results) {
    exchangeData = json.results;
  }
};

export const getExchangeName = async (
  apiKey: string,
  mic: string,
): Promise<any> => {
  if (!exchangeData) {
    await loadExchangeData(apiKey);
  }
  if (exchangeData) {
    return exchangeData.find((ex: any) => {
      return (
        ex.type === 'exchange' && ex.mic === ex.operating_mic && ex.mic === mic
      );
    });
  }
  return undefined;
};

const tickerCache: Map<string, any> = new Map<string, any>();
const getTickerInfo = async (apiKey: string, ticker: string): Promise<any> => {
  if (tickerCache.has(ticker)) {
    console.log(`ticker: ${ticker} is in cache`);
    return tickerCache.get(ticker);
  }

  const apiURL = `${POLYGON_TICKER_INFO_URL}/${ticker}?apiKey=${apiKey}`;
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
  const data = json.results;
  if (data) {
    tickerCache.set(ticker, data);
    return data;
  }
  return undefined;
};
