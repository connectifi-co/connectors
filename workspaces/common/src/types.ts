import type { Context, Contact, ContactList } from '@finos/fdc3';

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

export interface ChannelMessage extends Context {
  type: 'connect.channelMessage';
  channel: Channel;
  message: string;
  context?: Context;
}

export interface ChatMessage extends Context {
  type: 'connect.chatMessage';
  target: Contact;
  message: string;
  context?: Context;
}

export interface Channel extends Context {
  type: 'connect.channel';
  id: {
    slack?: string;
    teams?: string;
    fdc3?: string;
  },
  name: string;
}

export interface Interaction extends Context {
  type: 'fdc3.interaction';
  participants: ContactList;
  interactionType: 'Instant Message' | 'Email' | 'Call' | 'Meeting' | 'Note';
  description: string;
  initiator?: Contact;
  origin?: string; 
  originId?: string;
}


export interface HubSpotContact extends HubSpotObject {  
  properties: {
      createdate: string,
      email: string;
      firstname?: string;
      hs_object_id: string;
      lastmodifieddate: string;
      lastname?: string;
  },
}

export interface HubSpotCreateObject {
      associations: Array<HubSpotObjectAssociations>;
      objectWriteTraceId?: string;
      properties: {
        [key: string]: string;
    };
}

export interface HubSpotObjectAssociations {
  types: Array<HubSpotAssociation>;
  to: { id: string;}
}

export interface HubSpotAssociation {
   associationCategory: string;
   associationTypeId: number;
}

export interface HubSpotObject  {  
  id: string;
  properties: {
    [key: string]: string | null;
  },
  createdAt: string;
  updatedAt: string;
  archived:  boolean;
}


export interface HubSpotSearchRequest {
    query?: string;
    limit?: number;
    after?: string;
    sorts?: Array<string>;
    properties?: Array<string>;
    filterGroups?: Array<HSFilterGroup>;
}

export interface HSFilterGroup {
    filters: Array<HSFilter>;
}

export interface HSFilter {
  highValue?: string;
  propertyName: string;
  values?: Array<string>;
  value?: string;
  operator: FilterOperatorEnum;
}

export interface HSCollectionResponse {
    total: number;
    results: Array<HubSpotObject>;
}

export enum FilterOperatorEnum {
  Eq = "EQ",
  Neq = "NEQ",
  Lt = "LT",
  Lte = "LTE",
  Gt = "GT",
  Gte = "GTE",
  Between = "BETWEEN",
  In = "IN",
  NotIn = "NOT_IN",
  HasProperty = "HAS_PROPERTY",
  NotHasProperty = "NOT_HAS_PROPERTY",
  ContainsToken = "CONTAINS_TOKEN",
  NotContainsToken = "NOT_CONTAINS_TOKEN"
}

export interface TransactionResult extends Context {
  type: "fdc3.transactionResult";
  status: "Created" | "Deleted" | "Updated" | "Failed";
  context?: Context;
  message?: string;
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
  ChannelMessage = 'connect.channelMessage',
  ChatMessage = 'connect.chatMessage',
  Channel = 'connect.channel',
}
