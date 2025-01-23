import type { Context } from '@finos/fdc3';

export class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestError';
  }
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

export interface Entities extends Context {
  type: 'connect.entities';
  companies: Array<Context>;
  people: Array<Context>;
  places: Array<Context>;
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
  type: 'connect.location';
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
    };
  };
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
  modifiers?: { [key: string]: string };
}

export enum ContextTypes {
  CompanyDetails = 'connect.companyDetails',
  Completion = 'connect.completion',
  InstrumentPrice = 'connect.instrumentPrice',
  Link = 'connect.link',
  List = 'connect.list',
  Location = 'connect.location',
  Query = 'connect.query',
  Prompt = 'connect.prompt',
  Summary = 'connect.summary',
}
