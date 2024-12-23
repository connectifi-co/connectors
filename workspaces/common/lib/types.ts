import type { Context as Context } from '@finos/fdc3';

export interface HTTPResponse {
    statusCode: number;
    headers: {};
    body: string;
}

export interface HookHandlerParams {
  context: Context;
  destinations: Array<string>;
  keys?: {[key: string]: string};
}

export interface DeliveryHookHandler {(params: HookHandlerParams): Promise<HTTPResponse>}

export interface DeliveryHookRequest {
  context: Context;
  source: string;
  destinations: string[];
}


export interface ActionRequest {
  context: Context;
  intent: string;
  source: string;
  destination: string;
}

export interface ActionHandlerParams {
  context: Context;
  intent?: string;
  keys?: {[key: string]: string};
}

export interface ActionHandler {(params: ActionHandlerParams): Promise<HTTPResponse>}

export interface DeliveryHookResponse {
  changes: Array<HookChangeResponse>;
}

export interface HookChangeResponse {
  destination: string;
  context: Context;
}

export interface LinkActionResponse {
  url: string;
}

export interface Prompt extends Context {
  type: 'connect.prompt';
  text: string;
  context?: Context;
}

export interface Completion extends Context {
  type: 'connect.completion';
  text: string;
}

export interface Summary extends Context {
  type: 'connect.summary';
  title: string;
  text: string;
}

export interface List extends Context {
  type: 'connect.list';
  listType: string;
  items: Array<Context>;
}

export interface CompanyDetails extends Context {
  type: 'connect.companyDetails';
  id: {
    ticker: string;
    figi?: string;
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
    state: string;
    postalCode: string;
  };
  icon?: string;
}

export interface InstrumentPrice extends Context {
  type: 'connect.instrumentPrice';
  id: {
    ticker?: string;
  };
  price: number;
  description?: string;
  timestamp?: number;
  askPrice?: number;
  bidPrice?: number;
  askSize?: number;
  bidSize?: number;
}

export interface Location extends Context {
  type:'connect.location';
  name: string;
  id: {
    geo?: {
      lat: number;
      long: number;
    };
    address: {
      street?: Array<string>;
      city?: string;
      state?: string;
      province?: string;
      country?: string;
      code?: string;
    }
  }
}

export interface Link extends Context {
  type: 'connect.link';
  title: string;
  href: string;
  message: string;
  linkType: 'website' | 'file' | 'application';
}

export interface Query extends Context {
	type: 'connect.query';
	name: string;
	text: string;
	modifiers?: {[key: string]: string};
}