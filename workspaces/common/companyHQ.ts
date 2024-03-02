import type { Context as FDC3Context, Instrument } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import{ enahanceInstrument } from './polygon';
import { awsResponse } from './utils';

const cleanPostalCode = (code: string): string => {
    if (code) {
        const codeSplit = code.split('-');
        return codeSplit[0];
    }
    return code;
};

export const companyHQ = async (apiKey: string, context:FDC3Context) => {
  if (context.type === ContextTypes.Instrument) {
    const newCtx = await enahanceInstrument(apiKey, context as Instrument);
    let url = '';
    console.log(`get address from ${JSON.stringify(newCtx)}`);
    if (newCtx.address){
        url = `https://www.google.com/maps/search/${encodeURIComponent(newCtx.address.address1)},+${encodeURIComponent(newCtx.address.city)},+${encodeURIComponent(newCtx.address.state)}+${cleanPostalCode(newCtx.address.postal_code)}`
    } else {
        url = 'https://maps.google.com';
    }
    console.log(`url result: ${url}`);

    return awsResponse(200, {url});
  } 

  return awsResponse(400, {
    message: 'bad context type',
  });
}