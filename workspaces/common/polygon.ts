import type { Context as FDC3Context, Instrument } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { POLYGON_TICKER_INFO_URL } from './constants';
import { awsResponse } from './utils';

export const polygonHook = async (apiKey: string, context:FDC3Context, destinations: string[]) => {
  if (context.type === ContextTypes.Instrument) {

    const apiURL = `${POLYGON_TICKER_INFO_URL}/${context.id?.ticker}?apiKey=${apiKey}`;

    console.log(`calling polygon api at: ${apiURL}`);

    const changes = [];
    
    return awsResponse(200, changes);
  }

  return awsResponse(400, {
    message: 'bad context type',
  });
}