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