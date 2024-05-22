import type { Context as FDC3Context } from '@finos/fdc3';
import { POLYGON_SNAPSHOT_URL } from './constants';
import { awsResponse } from './utils';

const getPrice = async (apiKey: string, context: FDC3Context) : Promise<FDC3Context> => {

    const ticker: string = context.id?.ticker as string;
    if (!ticker) {
        return {
            type: "cfi.PriceResult",
            price:-1,
            error: "No ticker found"
        };
    }
    const apiURL = `${POLYGON_SNAPSHOT_URL}/${ticker.toUpperCase()}?apiKey=${apiKey}`;
    console.log(`ticker not cached, calling polygon api: ${apiURL}`);
  
    const rHeaders = {
      "Content-Type": "text/plain",
      outputFormat: "application/json",
    };
    const resp = await fetch(apiURL, {
      headers: rHeaders,
      method: "GET",
    });
    const json: any = await resp.json();
    const price = json.ticker.min.c !== 0 ? json.ticker.min.c : json.ticker.prevDay.c;
    return {
        type: "cfi.PriceResult",
        price: price
    }
    
}

export const polygonDataHook = async (apiKey: string, intent: string, context:FDC3Context, destinations: string[]) => {
    let result: FDC3Context;
    switch (intent) {
        case "GetPrice":
            result = await getPrice(apiKey, context);
            break;
        default:
            return awsResponse(400, {
                message: 'no handler found for intent',
            });    
    }
    return awsResponse(200, result);

}