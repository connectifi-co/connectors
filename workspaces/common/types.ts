import type { Context as FDC3Context } from '@finos/fdc3';

export interface DeliveryHookRequest {
  context: FDC3Context;
  source: string;
  destinations: string[];
}

export interface IntentHookRequest {
  context: FDC3Context;
  intent: string;
  source: string;
  destinations: string[];
}

export interface TickerPriceData extends FDC3Context {
  type: 'cfi.tickerPrice',
  id: {
    ticker: string;
  };
  price: number;
  description?: string;
  timestamp?: number;
  askPrice?: number;
  bidPrice?: number;
  askSize?: number;
  bidSize?: number;

};

export interface TickerDetailsData extends FDC3Context {
  type: 'cfi.tickerDetails',
  id: {
	  ticker: string;
  };
  name: string;
  active: boolean;
  primaryExchange: string;
  marketCap: number;
  weightedSharesOutstanding: number;
  sicCode: string;
  sicDescription: string;
  totalEmployees: number;
  currency: string;
  listDate: string;
  delistedDate?: string;
  description: string;
  url: string;
  address?: {
	  street: string;
	  city: string;
	  state: string
	  postalCode: string;
	 };

  icon?: string;
}